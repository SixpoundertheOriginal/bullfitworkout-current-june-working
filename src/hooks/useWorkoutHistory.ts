import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getWorkoutHistory } from '@/services/workoutHistoryService';
import type { WorkoutHistoryFilters } from '@/services/workoutHistoryService';

// Define WorkoutHistoryFilters interface to use throughout the application
export type { WorkoutHistoryFilters };

// Interface for workout dates used by the calendar
export interface WorkoutDates {
  [date: string]: number;
}

// Hook to get workout dates for calendar view
export function useWorkoutDates(year: number, month: number) {
  return useQuery({
    queryKey: ['workout-dates', year, month],
    queryFn: async () => {
      // Create date range for the month
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0);
      
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('id, start_time')
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString());
      
      if (error) throw error;
      
      // Create a mapping of dates to workout counts
      const workoutDates: WorkoutDates = {};
      
      (data || []).forEach(workout => {
        const dateStr = workout.start_time.split('T')[0];
        workoutDates[dateStr] = (workoutDates[dateStr] || 0) + 1;
      });
      
      return workoutDates;
    },
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
    queryFn: () => getWorkoutHistory(filters),
    staleTime: 30000, // Consider data stale after 30 seconds
  });
  
  // Set up a subscription for real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('workout-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'workout_sessions' 
        }, 
        () => {
          // When any changes occur to the workout_sessions table, invalidate the queries
          queryClient.invalidateQueries({ queryKey: ['workout-history'] });
          queryClient.invalidateQueries({ queryKey: ['workouts'] });
          queryClient.invalidateQueries({ queryKey: ['workout-dates'] });
        }
      )
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
}

// New hook that wraps useWorkoutHistory and validates data
export const useValidatedWorkoutHistory = (filters: WorkoutHistoryFilters = { limit: 30 }) => {
  const { data, ...rest } = useWorkoutHistory(filters);

  const validatedData = useMemo(() => {
    if (!data) {
      return undefined;
    }
    
    const validatedWorkouts = (data.workouts || []).map((workout: any) => ({
      id: workout.id,
      name: workout.name || 'Unnamed Workout',
      start_time: workout.start_time,
      duration: workout.duration || 0,
      training_type: workout.training_type || 'General',
    })).filter((w: ValidatedWorkoutSession) => w.id && w.start_time);

    return {
      workouts: validatedWorkouts,
      exerciseCounts: data.exerciseCounts || {},
      totalCount: data.totalCount || 0,
    };
  }, [data]);

  return { data: validatedData, ...rest };
};
