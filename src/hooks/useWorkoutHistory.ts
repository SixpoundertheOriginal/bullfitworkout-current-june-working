
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { workoutHistoryApi } from '@/services/workoutHistoryService';
import type { WorkoutHistoryFilters, EnhancedWorkoutSession } from '@/services/workoutHistoryService';
import { useAuth } from '@/context/AuthContext';
import { calendarApi } from '@/services/calendarService';

// Define WorkoutHistoryFilters interface to use throughout the application
export type { WorkoutHistoryFilters };

// Interface for workout dates used by the calendar
export interface WorkoutDates {
  [date: string]: number;
}

// Hook to get workout dates for calendar view
export function useWorkoutDates(year: number, month: number) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['workout-dates', user?.id, year, month],
    queryFn: async () => {
      if (!user?.id) return {};
      return calendarApi.fetchWorkoutDatesForMonth(user.id, year, month);
    },
    enabled: !!user?.id,
  });
}

// Pure data fetching hook - NO subscription management
export function useWorkoutHistory(filters: WorkoutHistoryFilters = { limit: 30 }) {
  const { user } = useAuth();
  
  // Memoize query key to prevent unnecessary re-renders
  const queryKey = useMemo(() => [
    'workout-history', 
    user?.id,
    filters.limit, 
    filters.offset, 
    filters.startDate, 
    filters.endDate, 
    filters.trainingTypes
  ], [user?.id, filters.limit, filters.offset, filters.startDate, filters.endDate, filters.trainingTypes]);
  
  const queryInfo = useQuery({
    queryKey,
    queryFn: () => {
      console.log('[useWorkoutHistory] Fetching workout history with filters:', filters);
      return workoutHistoryApi.fetch(filters);
    },
    enabled: !!user?.id,
    staleTime: 30000,
    retry: 2,
  });
  
  return queryInfo;
}

export interface ValidatedWorkoutSession {
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

// Validated workout history hook - pure data transformation
export const useValidatedWorkoutHistory = (filters: WorkoutHistoryFilters = { limit: 30 }) => {
  const { data, ...rest } = useWorkoutHistory(filters);

  const validatedData = useMemo(() => {
    if (!data) {
      return undefined;
    }
    
    try {
      const validatedWorkouts = (data.workouts || []).map((workout: EnhancedWorkoutSession) => ({
        id: workout.id,
        name: workout.name || 'Unnamed Workout',
        start_time: workout.start_time,
        duration: workout.duration || 0,
        training_type: workout.training_type || 'General',
        exerciseSets: workout.exerciseSets || [],
      })).filter((w: ValidatedWorkoutSession) => w.id && w.start_time);

      return {
        workouts: validatedWorkouts,
        exerciseCounts: data.exerciseCounts || {},
        totalCount: data.totalCount || 0,
      };
    } catch (error) {
      console.error('[useValidatedWorkoutHistory] Data validation error:', error);
      return {
        workouts: [],
        exerciseCounts: {},
        totalCount: 0,
      };
    }
  }, [data]);

  return { data: validatedData, ...rest };
};
