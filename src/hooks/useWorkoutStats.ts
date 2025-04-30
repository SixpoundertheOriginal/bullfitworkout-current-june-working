
import { useMemo, useState, useEffect } from 'react';
import { ExerciseSet } from '@/types/exercise';
import { processWorkoutMetrics, ProcessedWorkoutMetrics } from '@/utils/workoutMetricsProcessor';
import { useWeightUnit } from '@/context/WeightUnitContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

// Define the WorkoutStats type that components expect
export interface WorkoutStats {
  totalWorkouts: number;
  totalExercises: number;
  totalSets: number;
  totalDuration: number;
  avgDuration: number;
  workoutTypes: { type: string; count: number }[];
  recommendedType?: string;
  recommendedDuration?: number;
  recommendedTags?: string[];
  tags?: { name: string; count: number }[];
  progressMetrics?: {
    volumeChangePercentage: number;
    strengthTrend: 'increasing' | 'decreasing' | 'stable';
    consistencyScore: number;
  };
  streakDays?: number;
  workouts?: any[]; // For backward compatibility
}

// Define the TopExerciseStats type for components that use it
export interface TopExerciseStats {
  exerciseName: string;
  totalVolume: number;
  totalSets: number;
  averageWeight: number;
}

// Define the WorkoutTypeStats type for components that use it
export interface WorkoutTypeStats {
  type: string;
  count: number;
  percentage: number;
}

/**
 * Hook to calculate and return comprehensive workout statistics
 * using the centralized workout metrics processor.
 * 
 * @param exercises The workout exercises and their sets
 * @param duration The workout duration in minutes
 * @param userBodyInfo Optional user body information for bodyweight exercise calculations
 * @returns Processed workout metrics and backward compatibility properties
 */
export function useWorkoutStats(
  exercises?: Record<string, ExerciseSet[]>,
  duration?: number,
  userBodyInfo?: { weight: number; unit: string }
) {
  const { weightUnit } = useWeightUnit();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [stats, setStats] = useState<WorkoutStats>({
    totalWorkouts: 0,
    totalExercises: 0,
    totalSets: 0,
    totalDuration: 0,
    avgDuration: 0,
    workoutTypes: [],
    tags: []
  });
  
  // Process workout metrics if exercises are provided
  const workoutMetrics = useMemo(() => {
    if (exercises && duration !== undefined) {
      return processWorkoutMetrics(exercises, duration, weightUnit, userBodyInfo);
    }
    return null;
  }, [exercises, duration, weightUnit, userBodyInfo]);
  
  // Fetch workout data and stats when no specific exercises are provided
  useEffect(() => {
    if (!exercises && user) {
      fetchWorkoutData();
    } else if (!exercises) {
      setLoading(false);
    }
  }, [user, exercises]);
  
  const fetchWorkoutData = async () => {
    setLoading(true);
    try {
      const { data: workoutData, error } = await supabase
        .from('workouts')
        .select('*, exercises(*)')
        .order('start_time', { ascending: false });
        
      if (error) throw error;
      
      setWorkouts(workoutData || []);
      
      // Calculate stats
      if (workoutData && workoutData.length > 0) {
        const totalWorkouts = workoutData.length;
        const totalDuration = workoutData.reduce((sum, w) => sum + (w.duration || 0), 0);
        const avgDuration = totalDuration / totalWorkouts;
        
        // Count exercises and sets
        let exerciseCount = 0;
        let setCount = 0;
        
        // Count workout types
        const typeCounts: Record<string, number> = {};
        const tagCounts: Record<string, number> = {};
        
        workoutData.forEach(workout => {
          // Count workout types
          if (workout.training_type) {
            typeCounts[workout.training_type] = (typeCounts[workout.training_type] || 0) + 1;
          }
          
          // Count tags
          if (workout.tags && Array.isArray(workout.tags)) {
            workout.tags.forEach(tag => {
              if (tag) tagCounts[tag] = (tagCounts[tag] || 0) + 1;
            });
          }
          
          // Count exercises and sets
          if (workout.exercises && Array.isArray(workout.exercises)) {
            // Get unique exercise names
            const uniqueExercises = new Set(workout.exercises.map(e => e.exercise_name));
            exerciseCount += uniqueExercises.size;
            
            // Count sets
            setCount += workout.exercises.length;
          }
        });
        
        // Convert workout types to array
        const workoutTypes = Object.entries(typeCounts).map(([type, count]) => ({
          type,
          count
        })).sort((a, b) => b.count - a.count);
        
        // Convert tags to array
        const tags = Object.entries(tagCounts).map(([name, count]) => ({
          name,
          count
        })).sort((a, b) => b.count - a.count);
        
        // Find recommended type (most frequent)
        const recommendedType = workoutTypes.length > 0 ? workoutTypes[0].type : undefined;
        
        // Calculate average duration from recent workouts
        const recentWorkouts = workoutData.slice(0, 10);
        const recentAvgDuration = recentWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0) / (recentWorkouts.length || 1);
        
        // Create recommended tags (most frequent)
        const recommendedTags = tags.slice(0, 3).map(t => t.name);
        
        // Calculate streak days (simplified logic)
        const streakDays = calculateStreakDays(workoutData);
        
        // Calculate progress metrics (simplified)
        const progressMetrics = {
          volumeChangePercentage: 5, // Placeholder
          strengthTrend: 'increasing' as const,
          consistencyScore: 85 // Placeholder
        };
        
        setStats({
          totalWorkouts,
          totalExercises: exerciseCount,
          totalSets: setCount,
          totalDuration,
          avgDuration: Math.round(avgDuration),
          workoutTypes,
          recommendedType,
          recommendedDuration: Math.round(recentAvgDuration),
          recommendedTags,
          tags,
          progressMetrics,
          streakDays,
          workouts: workoutData
        });
      }
      
    } catch (error) {
      console.error('Error fetching workout data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate streak days
  const calculateStreakDays = (workouts: any[]): number => {
    if (!workouts || workouts.length === 0) return 0;
    
    // Sort workouts by date
    const sortedWorkouts = [...workouts].sort((a, b) => 
      new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    );
    
    // Simple streak calculation (consecutive days with workouts)
    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const mostRecentDate = new Date(sortedWorkouts[0].start_time);
    mostRecentDate.setHours(0, 0, 0, 0);
    
    // Check if most recent workout was today or yesterday
    const diffDays = Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 3600 * 24));
    if (diffDays > 1) return 0; // Streak broken if no workout yesterday or today
    
    // Calculate consecutive days with workouts
    let currentDate = new Date(sortedWorkouts[0].start_time);
    currentDate.setHours(0, 0, 0, 0);
    
    for (let i = 1; i < sortedWorkouts.length; i++) {
      const workoutDate = new Date(sortedWorkouts[i].start_time);
      workoutDate.setHours(0, 0, 0, 0);
      
      const dayDiff = Math.floor((currentDate.getTime() - workoutDate.getTime()) / (1000 * 3600 * 24));
      
      if (dayDiff === 1) {
        // Next consecutive day
        streak++;
        currentDate = workoutDate;
      } else if (dayDiff === 0) {
        // Same day, continue checking
        continue;
      } else {
        // Gap in streak
        break;
      }
    }
    
    return streak;
  };
  
  const refetch = () => {
    if (!exercises) {
      fetchWorkoutData();
    }
  };
  
  // Combine the metrics with the backward compatibility properties
  return {
    ...workoutMetrics,  // Include the processed metrics
    stats,              // Include backward compatibility stats
    loading,
    refetch,
    workouts
  };
}
