
import { useState, useEffect } from 'react';
import { ExerciseSet } from '@/types/exercise';
import { WorkoutMetrics } from '@/types/workout-metrics';
import { calculateWorkoutMetrics } from '@/utils/workoutMetrics';

export const useWorkoutMetrics = (
  exercises: Record<string, ExerciseSet[]>,
  time: number,
  weightUnit: string
) => {
  const [metrics, setMetrics] = useState<WorkoutMetrics>({
    time: 0,
    exerciseCount: 0,
    completedSets: 0,
    totalSets: 0,
    performance: {
      volume: 0,
      intensity: 0,
      density: 0,
      efficiency: 0
    }
  });

  useEffect(() => {
    const updatedMetrics = calculateWorkoutMetrics(exercises, time, weightUnit);
    setMetrics(updatedMetrics);
  }, [exercises, time, weightUnit]);

  return metrics;
};
