
import { WorkoutMetrics, WorkoutStats } from '@/types/workout-metrics';
import { ProcessedWorkoutMetrics } from '@/utils/workoutMetricsProcessor';

/**
 * Utility function to convert legacy workout metrics to the new centralized format.
 * This helps with transitioning existing components that expect the old format.
 */
export function legacyMetricsAdapter(metrics: ProcessedWorkoutMetrics): WorkoutMetrics {
  return {
    time: metrics.duration,
    exerciseCount: metrics.exerciseCount,
    completedSets: metrics.setCount?.completed || 0,
    totalSets: metrics.setCount?.total || 0,
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

/**
 * Creates a backward-compatible stats object from ProcessedWorkoutMetrics
 * for components that expect the old format.
 */
export function createBackwardCompatibleStats(metrics: ProcessedWorkoutMetrics): WorkoutStats {
  // Handle the case where metrics could be undefined or incomplete
  const setCount = metrics?.setCount || { total: 0, completed: 0 };
  const duration = metrics?.duration || 0;
  const exerciseCount = metrics?.exerciseCount || 0;
  const totalVolume = metrics?.totalVolume || 0;
  const density = metrics?.density || 0;
  const intensity = metrics?.intensity || 0;
  const efficiency = metrics?.efficiency || 0;
  const muscleFocus = metrics?.muscleFocus || {};

  return {
    totalWorkouts: 1,
    totalExercises: exerciseCount,
    totalSets: setCount.total,
    totalDuration: duration,
    avgDuration: duration,
    workoutTypes: [],
    // Include these properties as they're now in WorkoutStats
    progressMetrics: {
      volumeChangePercentage: 0,
      strengthTrend: 'stable',
      consistencyScore: 0
    },
    // Include muscle focus for backward compatibility
    muscleFocus: muscleFocus,
    // Create empty time patterns data
    timePatterns: {
      daysFrequency: {},
      durationByTimeOfDay: {
        morning: 0,
        afternoon: 0,
        evening: 0,
        night: 0
      }
    },
    exerciseVolumeHistory: [],
    totalVolume: totalVolume,
    density: density,
    intensity: intensity,
    efficiency: efficiency
  };
}
