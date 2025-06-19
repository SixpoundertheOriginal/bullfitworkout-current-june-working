
import { useMemo } from 'react';
import { useValidatedWorkoutHistory } from './useWorkoutHistory';
import { useQuery } from '@tanstack/react-query';
import { workoutHistoryApi } from '@/services/workoutHistoryService';
import type { ExerciseSet } from '@/types/exercise';

export interface Workout {
  id: string;
  name: string;
  created_at: string;
  duration?: number;
  exercises?: Record<string, ExerciseSet[]>;
}

export const useWorkouts = () => {
  const { data, isLoading: historyLoading, error: historyError } = useValidatedWorkoutHistory({ limit: 365 });

  const baseWorkouts = data?.workouts;

  const workoutIds = useMemo(() => (baseWorkouts || []).map(w => w.id), [baseWorkouts]);

  const { data: workoutDetails, isLoading: detailsLoading, error: detailsError } = useQuery({
    queryKey: ['workoutDetails', workoutIds],
    queryFn: async () => {
      if (!workoutIds || workoutIds.length === 0) return {};
      return workoutHistoryApi.fetchDetails(workoutIds);
    },
    enabled: !!workoutIds && workoutIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  const workouts: Workout[] = useMemo(() => {
    if (!baseWorkouts) return [];
    
    try {
      return baseWorkouts.map(workout => {
        const details = workoutDetails?.[workout.id];
        return {
          id: workout.id,
          name: workout.name,
          created_at: workout.start_time,
          duration: workout.duration,
          exercises: details?.exercises as Record<string, ExerciseSet[]> | undefined,
        };
      }).filter(w => w.created_at);
    } catch (error) {
      console.error('[useWorkouts] Error processing workout data:', error);
      return [];
    }
  }, [baseWorkouts, workoutDetails]);

  const combinedError = historyError || detailsError;

  return {
    workouts,
    isLoading: historyLoading || (workoutIds.length > 0 && detailsLoading),
    error: combinedError || null,
  };
};
