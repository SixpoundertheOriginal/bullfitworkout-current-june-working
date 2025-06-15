
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
    
    // Mock implementation with proper exerciseCounts structure
    return {
      workouts: [],
      exerciseCounts: {}, // This will be populated as { workoutId: { exercises: number, sets: number } }
      totalCount: 0
    };
  } catch (error) {
    console.error('[DataService] Error fetching workout history:', error);
    throw error;
  }
};

const fetchWorkoutDetails = async (workoutIds: string[]): Promise<WorkoutDetailsResponse> => {
  try {
    console.log('[DataService] Fetching workout details for IDs:', workoutIds);
    
    // Mock implementation - replace with actual Supabase queries
    const details: WorkoutDetailsResponse = {};
    workoutIds.forEach(id => {
      details[id] = { exercises: {} };
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
