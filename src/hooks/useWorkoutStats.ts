
import { useMemo } from 'react';
import { ExerciseSet } from '@/types/exercise';
import { processWorkoutMetrics, ProcessedWorkoutMetrics } from '@/utils/workoutMetricsProcessor';
import { useWeightUnit } from '@/context/WeightUnitContext';

/**
 * Hook to calculate and return comprehensive workout statistics
 * using the centralized workout metrics processor.
 * 
 * @param exercises The workout exercises and their sets
 * @param duration The workout duration in minutes
 * @param userBodyInfo Optional user body information for bodyweight exercise calculations
 * @returns Processed workout metrics
 */
export function useWorkoutStats(
  exercises: Record<string, ExerciseSet[]>,
  duration: number,
  userBodyInfo?: { weight: number; unit: string }
): ProcessedWorkoutMetrics {
  const { weightUnit } = useWeightUnit();
  
  const workoutMetrics = useMemo(() => {
    return processWorkoutMetrics(exercises, duration, weightUnit, userBodyInfo);
  }, [exercises, duration, weightUnit, userBodyInfo]);
  
  return workoutMetrics;
}
