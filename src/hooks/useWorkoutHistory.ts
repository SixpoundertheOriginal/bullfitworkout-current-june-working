
import { useState, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { workoutHistoryApi } from '@/services/workoutHistoryService';
import type { WorkoutHistoryFilters, EnhancedWorkoutSession } from '@/services/workoutHistoryService';
import { useAuth } from '@/context/AuthContext';
import { calendarApi } from '@/services/calendarService';
import { subscriptionManager } from '@/services/SubscriptionManager';

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
  const { user } = useAuth();
  
  // Simple state for subscription management without useRef
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(0);
  
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
    staleTime: 30000,
    retry: 2,
  });
  
  // Set up subscription using centralized manager with debouncing
  useEffect(() => {
    if (!user?.id || isSubscribed) return;

    const handleWorkoutChange = (payload: any) => {
      const now = Date.now();
      
      // Debounce rapid updates (common during save operations)
      if (now - lastUpdate < 2000) {
        console.log('[useWorkoutHistory] Debouncing rapid update');
        return;
      }
      
      setLastUpdate(now);
      
      console.log('[useWorkoutHistory] Workout change detected, invalidating queries:', payload);
      
      // Stagger query invalidations to prevent race conditions
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['workout-history'] });
      }, 500);
      
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['workouts'] });
        queryClient.invalidateQueries({ queryKey: ['workout-dates'] });
      }, 1000);
    };

    // Use the centralized subscription manager
    const unsubscribe = subscriptionManager.subscribe({
      channelName: `workout-history-${user.id}`,
      table: 'workout_sessions',
      events: ['INSERT', 'UPDATE', 'DELETE'],
      callback: handleWorkoutChange
    });

    setIsSubscribed(true);
    console.log('[useWorkoutHistory] Subscription established via manager');

    return () => {
      if (unsubscribe) {
        unsubscribe();
        setIsSubscribed(false);
        console.log('[useWorkoutHistory] Subscription cleaned up');
      }
    };
  }, [user?.id, queryClient, isSubscribed, lastUpdate]);
  
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
