
import { supabase } from '@/integrations/supabase/client';

export interface WorkoutHistoryFilters {
  limit?: number;
  offset?: number;
  startDate?: string | null;
  endDate?: string | null;
  trainingTypes?: string[];
}

// Enhanced workout session interface that extends Supabase data with exercise sets
export interface EnhancedWorkoutSession {
  id: string;
  name: string;
  start_time: string;
  duration: number;
  training_type: string;
  created_at: string;
  end_time: string;
  is_historical: boolean;
  logged_at: string;
  metadata: any;
  notes: string;
  updated_at: string;
  user_id: string;
  exerciseSets: Array<{
    exercise_name: string;
    id: string;
  }>;
}

export const getWorkoutHistory = async (filters: WorkoutHistoryFilters = { limit: 30 }) => {
  try {
    const countQuery = supabase
      .from('workout_sessions')
      .select('id', { count: 'exact', head: true });
      
    if (filters.startDate) {
      countQuery.gte('start_time', filters.startDate);
    }
    
    if (filters.endDate) {
      countQuery.lte('start_time', filters.endDate);
    }
    
    if (filters.trainingTypes && filters.trainingTypes.length > 0) {
      countQuery.in('training_type', filters.trainingTypes);
    }
    
    const { count, error: countError } = await countQuery;
    
    if (countError) throw countError;
    
    let query = supabase
      .from('workout_sessions')
      .select('*')
      .order('start_time', { ascending: false });
      
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 30) - 1);
    }
    
    if (filters.startDate) {
      query = query.gte('start_time', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.lte('start_time', filters.endDate);
    }
    
    if (filters.trainingTypes && filters.trainingTypes.length > 0) {
      query = query.in('training_type', filters.trainingTypes);
    }
    
    const { data, error: workoutsError } = await query;
    
    if (workoutsError) throw workoutsError;
    
    const exerciseCountData: Record<string, { exercises: number; sets: number }> = {};
    
    if (data) {
      // Fetch exercise sets for all workouts in one batch
      const workoutIds = data.map(w => w.id);
      const { data: allExerciseSets, error: exerciseSetsError } = await supabase
        .from('exercise_sets')
        .select('workout_id, exercise_name, id')
        .in('workout_id', workoutIds);
        
      if (exerciseSetsError) throw exerciseSetsError;
      
      // Group exercise sets by workout
      const exerciseSetsByWorkout: Record<string, Array<{exercise_name: string, id: string}>> = {};
      (allExerciseSets || []).forEach(set => {
        if (!exerciseSetsByWorkout[set.workout_id]) {
          exerciseSetsByWorkout[set.workout_id] = [];
        }
        exerciseSetsByWorkout[set.workout_id].push({
          exercise_name: set.exercise_name,
          id: set.id
        });
      });
      
      // Create enhanced workout objects with exercise sets
      const enhancedWorkouts: EnhancedWorkoutSession[] = data.map(workout => ({
        ...workout,
        exerciseSets: exerciseSetsByWorkout[workout.id] || []
      }));
      
      // Calculate exercise counts
      enhancedWorkouts.forEach(workout => {
        const exerciseNames = new Set(workout.exerciseSets.map(set => set.exercise_name));
        exerciseCountData[workout.id] = {
          exercises: exerciseNames.size,
          sets: workout.exerciseSets.length
        };
      });
      
      return {
        workouts: enhancedWorkouts,
        exerciseCounts: exerciseCountData,
        totalCount: count || 0
      };
    }
    
    return {
      workouts: [] as EnhancedWorkoutSession[],
      exerciseCounts: exerciseCountData,
      totalCount: count || 0
    };
  } catch (err) {
    console.error('Error fetching workout history:', err);
    throw err;
  }
};

interface WorkoutSet {
  weight: number;
  reps: number;
  completed?: boolean;
}

export const getWorkoutDetails = async (workoutIds: string[]) => {
  if (workoutIds.length === 0) return {};

  const { data: allSets, error } = await supabase
    .from('exercise_sets')
    .select('workout_id, exercise_name, weight, reps, completed')
    .in('workout_id', workoutIds);
  
  if (error) throw error;

  const setsByWorkout: Record<string, { exercise_name: string | null; weight: number | null; reps: number | null; completed: boolean | null }[]> = {};
  (allSets || []).forEach(set => {
    if (!setsByWorkout[set.workout_id]) {
      setsByWorkout[set.workout_id] = [];
    }
    setsByWorkout[set.workout_id].push(set);
  });
  
  const workoutsWithDetails: Record<string, { exercises: Record<string, WorkoutSet[]> }> = {};
  workoutIds.forEach(id => {
    const workoutSets = setsByWorkout[id] || [];
    const exercises: Record<string, WorkoutSet[]> = {};
    workoutSets.forEach(set => {
      const exerciseName = set.exercise_name || 'Unknown Exercise';
      if (!exercises[exerciseName]) {
        exercises[exerciseName] = [];
      }
      exercises[exerciseName].push({ weight: set.weight || 0, reps: set.reps || 0, completed: set.completed ?? true });
    });
    workoutsWithDetails[id] = { exercises };
  });

  return workoutsWithDetails;
};
