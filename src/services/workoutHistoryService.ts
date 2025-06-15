
import { supabase } from '@/integrations/supabase/client';

// Enhanced type definitions for DataService APIs
export interface WorkoutHistoryFilters {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  trainingTypes?: string[];
}

export interface EnhancedWorkoutSession {
  id: string;
  name: string;
  start_time: string;
  duration: number;
  training_type: string;
  exerciseSets: Array<{
    exercise_name: string;
    id: string;
  }>;
}

export interface WorkoutHistoryResponse {
  workouts: EnhancedWorkoutSession[];
  exerciseCounts: Record<string, { exercises: number; sets: number }>;
  totalCount: number;
}

export interface WorkoutDetailsResponse {
  [workoutId: string]: {
    exercises: Record<string, any[]>;
  };
}

// Workout History API
const fetchWorkoutHistory = async (filters: WorkoutHistoryFilters): Promise<WorkoutHistoryResponse> => {
  try {
    console.log('[DataService] Fetching workout history with filters:', filters);
    
    let query = supabase
      .from('workout_sessions')
      .select(`
        id, 
        name, 
        start_time, 
        duration, 
        training_type,
        exercise_sets (
          id,
          exercise_name
        )
      `, { count: 'exact' });

    if (filters.startDate) {
      query = query.gte('start_time', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('start_time', filters.endDate);
    }
    if (filters.trainingTypes && filters.trainingTypes.length > 0) {
      query = query.in('training_type', filters.trainingTypes);
    }

    query = query.order('start_time', { ascending: false });

    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 1) - 1);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('[DataService] Error fetching workout history:', error);
      throw error;
    }

    const safeData = data || [];
    const workouts: EnhancedWorkoutSession[] = safeData.map((session: any) => ({
      id: session.id,
      name: session.name || 'Unnamed Workout',
      start_time: session.start_time,
      duration: session.duration || 0,
      training_type: session.training_type || 'General',
      exerciseSets: (session.exercise_sets || []).map((set: any) => ({ id: set.id, exercise_name: set.exercise_name })),
    }));
    
    const exerciseCounts: Record<string, { exercises: number; sets: number }> = {};
    safeData.forEach((session: any) => {
      const uniqueExercises = new Set((session.exercise_sets || []).map((s: any) => s.exercise_name));
      exerciseCounts[session.id] = {
        exercises: uniqueExercises.size,
        sets: (session.exercise_sets || []).length,
      };
    });

    return {
      workouts,
      exerciseCounts,
      totalCount: count || 0,
    };
  } catch (error) {
    console.error('[DataService] Error fetching workout history:', error);
    throw error;
  }
};

const fetchWorkoutDetails = async (workoutIds: string[]): Promise<WorkoutDetailsResponse> => {
  if (!workoutIds || workoutIds.length === 0) {
    return {};
  }
  try {
    console.log('[DataService] Fetching workout details for IDs:', workoutIds);
    
    const { data: sets, error } = await supabase
      .from('exercise_sets')
      .select('*')
      .in('workout_id', workoutIds)
      .order('set_number', { ascending: true });

    if (error) {
      console.error('[DataService] Error fetching workout details:', error);
      throw error;
    }

    const details: WorkoutDetailsResponse = {};
    workoutIds.forEach(id => {
      details[id] = { exercises: {} };
    });

    (sets || []).forEach(set => {
      if (!details[set.workout_id]) {
        details[set.workout_id] = { exercises: {} };
      }
      if (!details[set.workout_id].exercises[set.exercise_name]) {
        details[set.workout_id].exercises[set.exercise_name] = [];
      }
      details[set.workout_id].exercises[set.exercise_name].push(set);
    });
    
    return details;
  } catch (error) {
    console.error('[DataService] Error fetching workout details:', error);
    throw error;
  }
};

export const workoutHistoryApi = {
  fetch: fetchWorkoutHistory,
  fetchDetails: fetchWorkoutDetails
};
