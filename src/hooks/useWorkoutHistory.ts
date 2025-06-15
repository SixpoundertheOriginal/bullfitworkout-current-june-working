import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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

export function useWorkoutHistory(filters: WorkoutHistoryFilters = { limit: 30 }) {
  const queryClient = useQueryClient();
  
  const queryInfo = useQuery({
    queryKey: [
      'workout-history', 
      filters.limit, 
      filters.offset, 
      filters.startDate, 
      filters.endDate, 
      filters.trainingTypes
    ],
    queryFn: () => workoutHistoryApi.fetch(filters),
    staleTime: 30000, // Consider data stale after 30 seconds
  });
  
  // Set up a subscription for real-time updates
  useEffect(() => {
    const handleWorkoutChange = (payload: any) => {
      console.log('Workout change detected, invalidating queries:', payload);
      // When any changes occur to the workout_sessions table, invalidate the queries
      queryClient.invalidateQueries({ queryKey: ['workout-history'] });
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      queryClient.invalidateQueries({ queryKey: ['workout-dates'] });
    };

    const channel = supabase
      .channel('workout-updates')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'workout_sessions' }, handleWorkoutChange)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'workout_sessions' }, handleWorkoutChange)
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'workout_sessions' }, handleWorkoutChange)
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  
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

// New hook that wraps useWorkoutHistory and validates data
export const useValidatedWorkoutHistory = (filters: WorkoutHistoryFilters = { limit: 30 }) => {
  const { data, ...rest } = useWorkoutHistory(filters);

  const validatedData = useMemo(() => {
    if (!data) {
      return undefined;
    }
    
    const validatedWorkouts = (data.workouts || []).map((workout: EnhancedWorkoutSession) => ({
      id: workout.id,
      name: workout.name || 'Unnamed Workout',
      start_time: workout.start_time,
      duration: workout.duration || 0,
      training_type: workout.training_type || 'General',
      exerciseSets: workout.exerciseSets || [], // Now properly typed
    })).filter((w: ValidatedWorkoutSession) => w.id && w.start_time);

    return {
      workouts: validatedWorkouts,
      exerciseCounts: data.exerciseCounts || {},
      totalCount: data.totalCount || 0,
    };
  }, [data]);

  return { data: validatedData, ...rest };
};
