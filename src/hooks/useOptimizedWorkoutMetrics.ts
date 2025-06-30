
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
  // Memoize with JSON stringify to ensure deep comparison
  return useMemo(() => {
    if (!exercises || typeof exercises !== 'object') {
      return {
        exerciseCount: 0,
        completedSets: 0,
        totalSets: 0,
        totalVolume: 0,
        totalReps: 0
      };
    }

    const exerciseCount = Object.keys(exercises).length;
    const completedSets = Object.values(exercises).reduce((total, sets) => 
      total + (sets?.filter(set => set?.completed)?.length || 0), 0
    );
    const totalSets = Object.values(exercises).reduce((total, sets) => 
      total + (sets?.length || 0), 0
    );
    const totalVolume = Object.values(exercises).reduce((total, sets) => 
      total + (sets?.filter(set => set?.completed)?.reduce((setTotal, set) => 
        setTotal + ((set?.weight || 0) * (set?.reps || 0)), 0
      ) || 0), 0
    );
    const totalReps = Object.values(exercises).reduce((total, sets) => 
      total + (sets?.filter(set => set?.completed)?.reduce((setTotal, set) => 
        setTotal + (set?.reps || 0), 0
      ) || 0), 0
    );

    return {
      exerciseCount,
      completedSets,
      totalSets,
      totalVolume,
      totalReps
    };
  }, [JSON.stringify(exercises)]);
};
