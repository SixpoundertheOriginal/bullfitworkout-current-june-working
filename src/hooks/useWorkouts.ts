
import { useMemo } from 'react';
import { useWorkoutHistory } from './useWorkoutHistory';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

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

const fetchWorkoutDetails = async (workoutIds: string[]) => {
  if (workoutIds.length === 0) return {};

  const { data: allSets, error } = await supabase
    .from('exercise_sets')
    .select('workout_id, exercise_name, weight, reps')
    .in('workout_id', workoutIds);
  
  if (error) throw error;

  const setsByWorkout: Record<string, { exercise_name: string | null; weight: number | null; reps: number | null }[]> = {};
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
      exercises[exerciseName].push({ weight: set.weight || 0, reps: set.reps || 0 });
    });
    workoutsWithDetails[id] = { exercises };
  });

  return workoutsWithDetails;
};

export const useWorkouts = () => {
  const { workouts: baseWorkouts, isLoading: historyLoading, error: historyError } = useWorkoutHistory({ limit: 365 });

  const workoutIds = useMemo(() => (baseWorkouts || []).map(w => w.id), [baseWorkouts]);

  const { data: workoutDetails, isLoading: detailsLoading, error: detailsError } = useQuery({
    queryKey: ['workoutDetails', workoutIds],
    queryFn: () => fetchWorkoutDetails(workoutIds),
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
