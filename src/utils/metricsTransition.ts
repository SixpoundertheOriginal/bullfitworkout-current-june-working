
import { WorkoutMetrics } from '@/types/workout-metrics';
import { ProcessedWorkoutMetrics } from '@/utils/workoutMetricsProcessor';

/**
 * Utility function to convert legacy workout metrics to the new centralized format.
 * This helps with transitioning existing components that expect the old format.
 */
export function legacyMetricsAdapter(metrics: ProcessedWorkoutMetrics): WorkoutMetrics {
  return {
    time: metrics.duration,
    exerciseCount: metrics.exerciseCount,
    completedSets: metrics.setCount.completed,
    totalSets: metrics.setCount.total,
    performance: {
      volume: metrics.totalVolume,
      intensity: metrics.intensity,
      density: metrics.density,
      efficiency: metrics.efficiency
    }
  };
}

/**
 * Extracts just the density metrics from the full metrics object.
 * Useful when a component only needs density information.
 */
export function extractDensityMetrics(metrics: ProcessedWorkoutMetrics) {
  return metrics.densityMetrics;
}
