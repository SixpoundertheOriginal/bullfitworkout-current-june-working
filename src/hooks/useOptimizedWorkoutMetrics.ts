
import { useMemo } from 'react';
import { ExerciseSet } from '@/store/workoutStore';

export interface WorkoutMetrics {
  exerciseCount: number;
  completedSets: number;
  totalSets: number;
  totalVolume: number;
  totalReps: number;
}

export const useOptimizedWorkoutMetrics = (exercises: Record<string, ExerciseSet[]>): WorkoutMetrics => {
  return useMemo(() => {
    const exerciseCount = Object.keys(exercises).length;
    const completedSets = Object.values(exercises).reduce((total, sets) => 
      total + sets.filter(set => set.completed).length, 0
    );
    const totalSets = Object.values(exercises).reduce((total, sets) => 
      total + sets.length, 0
    );
    const totalVolume = Object.values(exercises).reduce((total, sets) => 
      total + sets.filter(set => set.completed).reduce((setTotal, set) => 
        setTotal + (set.weight * set.reps), 0
      ), 0
    );
    const totalReps = Object.values(exercises).reduce((total, sets) => 
      total + sets.filter(set => set.completed).reduce((setTotal, set) => 
        setTotal + set.reps, 0
      ), 0
    );

    return {
      exerciseCount,
      completedSets,
      totalSets,
      totalVolume,
      totalReps
    };
  }, [exercises]);
};
