import { useMemo } from 'react';
import { useWorkoutHistory } from './useWorkoutHistory';
import { useQuery } from '@tanstack/react-query';
import { getWorkoutDetails } from '@/services/workoutHistoryService';

interface WorkoutSet {
  weight: number;
  reps: number;
}

export interface Workout {
  id: string;
  name: string;
  created_at: string;
  duration?: number;
  exercises?: Record<string, WorkoutSet[]>;
}

export const useWorkouts = () => {
  const { workouts: baseWorkouts, isLoading: historyLoading, error: historyError } = useWorkoutHistory({ limit: 365 });

  const workoutIds = useMemo(() => (baseWorkouts || []).map(w => w.id), [baseWorkouts]);

  const { data: workoutDetails, isLoading: detailsLoading, error: detailsError } = useQuery({
    queryKey: ['workoutDetails', workoutIds],
    queryFn: () => getWorkoutDetails(workoutIds),
    enabled: !!workoutIds && workoutIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const workouts: Workout[] = useMemo(() => {
    if (!baseWorkouts) return [];
    return baseWorkouts.map(workout => {
      const details = workoutDetails?.[workout.id];
      return {
        id: workout.id,
        name: workout.name || 'Unnamed Workout',
        created_at: workout.start_time,
        duration: workout.duration,
        exercises: details?.exercises,
      };
    }).filter(w => w.created_at);
  }, [baseWorkouts, workoutDetails]);

  const combinedError = historyError || detailsError;

  return {
    workouts,
    isLoading: historyLoading || (workoutIds.length > 0 && detailsLoading),
    error: combinedError || null,
  };
};
