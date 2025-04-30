
import { useMemo, useState, useEffect } from 'react';
import { ExerciseSet } from '@/types/exercise';
import { processWorkoutMetrics, ProcessedWorkoutMetrics } from '@/utils/workoutMetricsProcessor';
import { useWeightUnit } from '@/context/WeightUnitContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { WorkoutStats, WorkoutStatsResult } from '@/types/workout-metrics';

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
): WorkoutStatsResult {
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
    tags: [],
    timePatterns: {
      daysFrequency: {},
      durationByTimeOfDay: {
        morning: 0,
        afternoon: 0,
        evening: 0,
        night: 0
      }
    },
    muscleFocus: {},
    exerciseVolumeHistory: []
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
      // Fix table name - use workout_sessions instead of workouts
      const { data: workoutData, error } = await supabase
        .from('workout_sessions')
        .select('*, exercises:exercise_sets(*)')
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
        
        // Prepare time patterns data
        const daysFrequency: Record<string, number> = {
          monday: 0, tuesday: 0, wednesday: 0, thursday: 0, 
          friday: 0, saturday: 0, sunday: 0
        };
        
        const durationByTimeOfDay = {
          morning: 0,   // 5am-11:59am
          afternoon: 0, // 12pm-4:59pm
          evening: 0,   // 5pm-8:59pm
          night: 0      // 9pm-4:59am
        };
        
        // Muscle focus tracking
        const muscleFocusData: Record<string, number> = {};
        
        // Exercise volume history for tracking progress
        const exerciseVolumes: Record<string, any> = {};
        
        // Get most recent workout date
        const mostRecentDate = workoutData[0]?.start_time || new Date().toISOString();
        
        workoutData.forEach(workout => {
          // Count workout types
          if (workout.training_type) {
            typeCounts[workout.training_type] = (typeCounts[workout.training_type] || 0) + 1;
          }
          
          // Track workout day frequency
          const workoutDate = new Date(workout.start_time);
          // Use correct weekday formatting - lowercase is not a valid option
          const day = workoutDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
          if (daysFrequency[day] !== undefined) {
            daysFrequency[day]++;
          }
          
          // Track time of day
          const hour = workoutDate.getHours();
          if (hour >= 5 && hour < 12) {
            durationByTimeOfDay.morning += workout.duration || 0;
          } else if (hour >= 12 && hour < 17) {
            durationByTimeOfDay.afternoon += workout.duration || 0;
          } else if (hour >= 17 && hour < 21) {
            durationByTimeOfDay.evening += workout.duration || 0;
          } else {
            durationByTimeOfDay.night += workout.duration || 0;
          }
          
          // Check for tags in metadata if it exists
          if (workout.metadata && typeof workout.metadata === 'object') {
            // Fix: Safely check for tags in metadata
            const metadataObj = workout.metadata as Record<string, any>;
            const workoutTags = metadataObj.tags || [];
            
            if (Array.isArray(workoutTags)) {
              workoutTags.forEach((tag: string) => {
                if (tag) tagCounts[tag] = (tagCounts[tag] || 0) + 1;
              });
            }
          }
          
          // Count exercises and sets
          if (workout.exercises && Array.isArray(workout.exercises)) {
            // Get unique exercise names
            const exerciseNames = workout.exercises.map(e => e.exercise_name);
            const uniqueExercises = new Set(exerciseNames);
            exerciseCount += uniqueExercises.size;
            
            // Count sets
            setCount += workout.exercises.length;
            
            // Track muscle focus (simple implementation)
            Array.from(uniqueExercises).forEach(exerciseName => {
              // This is simplified - in a real app, you'd get the muscle groups from an exercise database
              const muscleGroup = getExerciseMainMuscleGroup(exerciseName as string);
              if (muscleGroup) {
                muscleFocusData[muscleGroup] = (muscleFocusData[muscleGroup] || 0) + 1;
              }
            });
            
            // Track exercise volume for progress tracking
            workout.exercises.forEach(set => {
              const name = set.exercise_name;
              if (!exerciseVolumes[name]) {
                exerciseVolumes[name] = {
                  volume: 0,
                  count: 0,
                  recent: true,
                };
              }
              
              if (set.weight && set.reps && set.completed) {
                exerciseVolumes[name].volume += set.weight * set.reps;
                exerciseVolumes[name].count++;
              }
            });
          }
        });
        
        // Convert workout types to array
        const workoutTypes = Object.entries(typeCounts).map(([type, count]) => ({
          type,
          count,
          percentage: (count / totalWorkouts) * 100
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
        
        // Create exercise volume history with trends
        const exerciseVolumeHistory = Object.entries(exerciseVolumes)
          .map(([exercise_name, data]) => ({
            exercise_name,
            trend: 'increasing' as const,
            percentChange: 10 // Placeholder value
          }))
          .sort((a, b) => b.percentChange - a.percentChange)
          .slice(0, 5);
        
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
          workouts: workoutData,
          timePatterns: {
            daysFrequency,
            durationByTimeOfDay
          },
          muscleFocus: muscleFocusData,
          exerciseVolumeHistory,
          lastWorkoutDate: mostRecentDate
        });
      }
    } catch (error) {
      console.error('Error fetching workout data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Helper function to map exercise names to muscle groups (simplified)
  const getExerciseMainMuscleGroup = (exerciseName: string): string => {
    const nameLower = exerciseName.toLowerCase();
    
    if (nameLower.includes('bench') || nameLower.includes('chest') || nameLower.includes('pec')) {
      return 'chest';
    } else if (nameLower.includes('squat') || nameLower.includes('leg') || nameLower.includes('quad')) {
      return 'legs';
    } else if (nameLower.includes('dead') || nameLower.includes('back') || nameLower.includes('row')) {
      return 'back';
    } else if (nameLower.includes('shoulder') || nameLower.includes('press') || nameLower.includes('delt')) {
      return 'shoulders';
    } else if (nameLower.includes('bicep') || nameLower.includes('curl')) {
      return 'arms';
    } else if (nameLower.includes('tricep') || nameLower.includes('extension')) {
      return 'arms';
    } else if (nameLower.includes('core') || nameLower.includes('ab')) {
      return 'core';
    }
    
    return 'other';
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
    ...(workoutMetrics || {} as ProcessedWorkoutMetrics),  // Include the processed metrics
    stats,              // Include backward compatibility stats
    loading,
    refetch,
    workouts
  } as WorkoutStatsResult;
}
