
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface WorkoutTypeStats {
  type: string;
  count: number;
  totalDuration: number;
  percentage: number;
}

export interface TopExerciseStats {
  exerciseName: string;
  count: number;
  totalSets: number;
  averageWeight: number;
  totalVolume: number;
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalDuration: number;
  avgDuration: number;
  totalExercises: number;
  totalSets: number;
  topExercises: TopExerciseStats[];
  workoutTypes: WorkoutTypeStats[];
  lastWorkoutDate: string | null;
  streakDays: number;
}

export function useWorkoutStats(limit: number = 50) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<WorkoutStats>({
    totalWorkouts: 0,
    totalDuration: 0,
    avgDuration: 0,
    totalExercises: 0,
    totalSets: 0,
    topExercises: [],
    workoutTypes: [],
    lastWorkoutDate: null,
    streakDays: 0,
  });

  useEffect(() => {
    async function fetchWorkoutStats() {
      if (!user) return;

      try {
        setLoading(true);
        
        // Fetch all workouts
        const { data: workouts, error: workoutsError } = await supabase
          .from('workout_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('start_time', { ascending: false })
          .limit(limit);
          
        if (workoutsError) throw workoutsError;
        
        if (!workouts || workouts.length === 0) {
          setLoading(false);
          return;
        }
        
        // Fetch exercise sets for these workouts
        const workoutIds = workouts.map(w => w.id);
        const { data: exerciseSets, error: setsError } = await supabase
          .from('exercise_sets')
          .select('*')
          .in('workout_id', workoutIds);
          
        if (setsError) throw setsError;
        
        // Calculate basic stats
        const totalWorkouts = workouts.length;
        const totalDuration = workouts.reduce((sum, w) => sum + w.duration, 0);
        const avgDuration = totalDuration / totalWorkouts;
        const lastWorkoutDate = workouts[0]?.start_time || null;
        
        // Calculate workout types distribution
        const typeCount: Record<string, { count: number; duration: number }> = {};
        workouts.forEach(workout => {
          const type = workout.training_type;
          if (!typeCount[type]) {
            typeCount[type] = { count: 0, duration: 0 };
          }
          typeCount[type].count++;
          typeCount[type].duration += workout.duration;
        });
        
        const workoutTypes: WorkoutTypeStats[] = Object.entries(typeCount).map(([type, data]) => ({
          type,
          count: data.count,
          totalDuration: data.duration,
          percentage: (data.count / totalWorkouts) * 100
        })).sort((a, b) => b.count - a.count);
        
        // Calculate exercise stats
        const exerciseData: Record<string, { 
          count: number; 
          sets: number; 
          totalWeight: number;
          totalReps: number;
        }> = {};
        
        exerciseSets?.forEach(set => {
          const name = set.exercise_name;
          if (!exerciseData[name]) {
            exerciseData[name] = { count: 0, sets: 0, totalWeight: 0, totalReps: 0 };
          }
          exerciseData[name].count++;
          exerciseData[name].sets++;
          exerciseData[name].totalWeight += set.weight;
          exerciseData[name].totalReps += set.reps;
        });
        
        const topExercises: TopExerciseStats[] = Object.entries(exerciseData)
          .map(([exerciseName, data]) => ({
            exerciseName,
            count: data.count,
            totalSets: data.sets,
            averageWeight: data.totalWeight / data.sets,
            totalVolume: data.totalWeight * data.totalReps
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);
          
        // Calculate unique exercises and total sets
        const totalExercises = Object.keys(exerciseData).length;
        const totalSets = exerciseSets?.length || 0;
        
        // Calculate workout streak
        let streakDays = 0;
        if (workouts.length > 0) {
          // Convert dates to YYYY-MM-DD format for comparison
          const workoutDates = workouts.map(w => 
            new Date(w.start_time).toISOString().split('T')[0]
          );
          
          // Remove duplicates (multiple workouts on same day)
          const uniqueDates = [...new Set(workoutDates)].sort();
          
          // Check for consecutive days
          const today = new Date().toISOString().split('T')[0];
          if (uniqueDates[0] === today) {
            streakDays = 1;
            
            for (let i = 1; i < uniqueDates.length; i++) {
              const currentDate = new Date(uniqueDates[i-1]);
              currentDate.setDate(currentDate.getDate() - 1);
              const expectedPrevious = currentDate.toISOString().split('T')[0];
              
              if (uniqueDates[i] === expectedPrevious) {
                streakDays++;
              } else {
                break;
              }
            }
          }
        }
        
        setStats({
          totalWorkouts,
          totalDuration,
          avgDuration,
          totalExercises,
          totalSets,
          topExercises,
          workoutTypes,
          lastWorkoutDate,
          streakDays,
        });
      } catch (error) {
        console.error('Error fetching workout stats:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchWorkoutStats();
  }, [user, limit]);
  
  return { stats, loading };
}
