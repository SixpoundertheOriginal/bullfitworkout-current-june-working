// Keep existing code imports

import { ExerciseSet } from '@/types/exercise';
import { calculateEffectiveWeight, getExerciseLoadFactor, isBodyweightExercise } from '@/types/exercise';

// Enhanced ProcessedWorkoutMetrics with more detailed information
export interface ProcessedWorkoutMetrics {
  duration: number;
  exerciseCount: number;
  setCount: {
    total: number;
    completed: number;
    failed: number;
  };
  totalVolume: number;
  adjustedVolume: number; // Volume adjusted for bodyweight exercises
  intensity: number;
  density: number;
  efficiency: number;
  densityMetrics: {
    setsPerMinute: number;
    volumePerMinute: number;
  };
  intensityMetrics: {
    averageRpe: number;
    peakLoad: number;
    averageLoad: number;
  };
  muscleFocus: Record<string, number>;
  estimatedEnergyExpenditure: number;
  movementPatterns: Record<string, number>;
}

// Main function to process workout metrics
export const processWorkoutMetrics = (
  exercises: Record<string, ExerciseSet[]>,
  duration: number,
  weightUnit: 'kg' | 'lb' = 'kg',
  userBodyInfo?: { weight: number; unit: string }
): ProcessedWorkoutMetrics => {
  // Initialize metrics
  const metrics: ProcessedWorkoutMetrics = {
    duration,
    exerciseCount: 0,
    setCount: {
      total: 0,
      completed: 0,
      failed: 0,
    },
    totalVolume: 0,
    adjustedVolume: 0,
    intensity: 0,
    density: 0,
    efficiency: 0,
    densityMetrics: {
      setsPerMinute: 0,
      volumePerMinute: 0,
    },
    intensityMetrics: {
      averageRpe: 0,
      peakLoad: 0,
      averageLoad: 0,
    },
    muscleFocus: {},
    estimatedEnergyExpenditure: 0,
    movementPatterns: {},
  };

  // If no exercises or duration, return initialized metrics
  if (!exercises || duration <= 0) {
    return metrics;
  }

  // Convert user weight to kg for consistent calculations if provided
  const userWeightKg = userBodyInfo 
    ? userBodyInfo.unit === 'lb' 
      ? userBodyInfo.weight * 0.453592 
      : userBodyInfo.weight
    : 70; // Default weight if not provided

  // Track exercise data for processing
  const exerciseNames = Object.keys(exercises);
  metrics.exerciseCount = exerciseNames.length;

  let totalRpe = 0;
  let rpeCount = 0;
  let peakLoad = 0;
  let totalLoad = 0;
  let totalReps = 0;

  // Process each exercise
  exerciseNames.forEach(exerciseName => {
    const sets = exercises[exerciseName];
    if (!sets || sets.length === 0) return;

    metrics.setCount.total += sets.length;

    // Process each set in the exercise
    sets.forEach(set => {
      if (set.completed) {
        metrics.setCount.completed += 1;
        
        // Calculate volume (weight x reps)
        const standardVolume = set.weight * set.reps;
        metrics.totalVolume += standardVolume;

        // Handle adjusted volume for bodyweight exercises if we have exercise data and user weight
        if (set.weightCalculation?.isAuto && userBodyInfo) {
          // This is a bodyweight exercise with auto-calculated weight
          const effectiveWeight = set.weightCalculation.value;
          const adjustedVolume = effectiveWeight * set.reps;
          metrics.adjustedVolume += adjustedVolume;
        } else {
          // Regular weighted exercise or no auto calculation
          metrics.adjustedVolume += standardVolume;
        }
        
        // Track RPE if available
        if (set.metadata && typeof set.metadata === 'object' && 'rpe' in set.metadata) {
          const rpe = Number(set.metadata.rpe);
          if (!isNaN(rpe) && rpe > 0) {
            totalRpe += rpe;
            rpeCount++;
          }
        }
        
        // Track peak and total load
        const currentLoad = set.weight;
        peakLoad = Math.max(peakLoad, currentLoad);
        totalLoad += currentLoad;
        totalReps += set.reps;
      } else {
        metrics.setCount.failed += 1;
      }
    });

    // Update muscle focus data
    // This is a simplified approach - in a production app, you would look up the exercise
    // in a database to get accurate muscle group data
    const muscleGroup = getExerciseMainMuscleGroup(exerciseName);
    if (muscleGroup) {
      metrics.muscleFocus[muscleGroup] = (metrics.muscleFocus[muscleGroup] || 0) + sets.length;
    }

    // Update movement pattern data (simplified)
    const movementPattern = getExerciseMovementPattern(exerciseName);
    if (movementPattern) {
      metrics.movementPatterns[movementPattern] = 
        (metrics.movementPatterns[movementPattern] || 0) + sets.length;
    }
  });

  // Calculate density metrics (work per unit time)
  if (duration > 0) {
    metrics.densityMetrics.setsPerMinute = metrics.setCount.completed / duration;
    metrics.densityMetrics.volumePerMinute = metrics.totalVolume / duration;
    metrics.density = (metrics.setCount.completed / duration) * (metrics.totalVolume / 1000);
  }

  // Calculate intensity metrics
  metrics.intensityMetrics.averageRpe = rpeCount > 0 ? totalRpe / rpeCount : 0;
  metrics.intensityMetrics.peakLoad = peakLoad;
  metrics.intensityMetrics.averageLoad = totalReps > 0 ? totalLoad / totalReps : 0;
  metrics.intensity = metrics.intensityMetrics.averageRpe * (metrics.totalVolume / 1000) / duration;
  
  // Calculate efficiency (completed sets vs total sets)
  metrics.efficiency = metrics.setCount.total > 0 
    ? (metrics.setCount.completed / metrics.setCount.total) * 100 
    : 0;

  // Estimate energy expenditure (very simplified calculation)
  metrics.estimatedEnergyExpenditure = calculateEstimatedEnergyExpenditure(
    metrics.totalVolume,
    duration,
    metrics.exerciseCount,
    userWeightKg
  );

  return metrics;
};

// Helper function to map exercise names to muscle groups (simplified)
const getExerciseMainMuscleGroup = (exerciseName: string): string => {
  const nameLower = exerciseName.toLowerCase();
  
  if (nameLower.includes('bench') || nameLower.includes('chest') || nameLower.includes('pec')) {
    return 'chest';
  } else if (nameLower.includes('squat') || nameLower.includes('leg') || nameLower.includes('quad')) {
    return 'legs';
  } else if (nameLower.includes('dead') || nameLower.includes('back') || nameLower.includes('row')) {
    return 'back';
  } else if (nameLower.includes('shoulder') || nameLower.includes('press') || nameLower.includes('delt')) {
    return 'shoulders';
  } else if (nameLower.includes('bicep') || nameLower.includes('curl')) {
    return 'arms';
  } else if (nameLower.includes('tricep') || nameLower.includes('extension')) {
    return 'arms';
  } else if (nameLower.includes('core') || nameLower.includes('ab')) {
    return 'core';
  }
  
  return 'other';
};

// Helper function to map exercise names to movement patterns (simplified)
const getExerciseMovementPattern = (exerciseName: string): string => {
  const nameLower = exerciseName.toLowerCase();
  
  if (nameLower.includes('bench') || nameLower.includes('push') || nameLower.includes('press')) {
    return 'push';
  } else if (nameLower.includes('row') || nameLower.includes('pull') || nameLower.includes('curl')) {
    return 'pull';
  } else if (nameLower.includes('squat') || nameLower.includes('leg press')) {
    return 'squat';
  } else if (nameLower.includes('dead') || nameLower.includes('hip thrust')) {
    return 'hinge';
  } else if (nameLower.includes('lunge') || nameLower.includes('step')) {
    return 'lunge';
  } else if (nameLower.includes('twist') || nameLower.includes('rotation')) {
    return 'rotation';
  } else if (nameLower.includes('carry') || nameLower.includes('farmer')) {
    return 'carry';
  } else if (nameLower.includes('plank') || nameLower.includes('hold') || nameLower.includes('isometric')) {
    return 'isometric';
  }
  
  return 'other';
};

// Simplified energy expenditure estimation
const calculateEstimatedEnergyExpenditure = (
  totalVolume: number,
  duration: number,
  exerciseCount: number,
  userWeightKg: number
): number => {
  // This is a very simplified formula - in a real app, you'd use more sophisticated models
  // that take into account exercise types, heart rate data if available, etc.
  
  // Basic MET calculation (Metabolic Equivalent of Task)
  // Light strength training: ~3 METs, Vigorous: ~6 METs
  const estimatedMET = 3 + (totalVolume / 10000) + (exerciseCount / 5);
  
  // Calories = MET × weight in kg × time in hours
  const timeInHours = duration / 60;
  const estimatedCalories = estimatedMET * userWeightKg * timeInHours;
  
  return Math.round(estimatedCalories);
};

// Function to estimate effective weight for bodyweight exercises when we don't have rich exercise data
export const estimateBodyweightExerciseLoad = (
  exerciseName: string,
  bodyWeight: number = 70 // Default 70kg if not provided
): number => {
  const nameLower = exerciseName.toLowerCase();
  
  // Common bodyweight exercises and their approximate load factors
  // These are educated estimates - actual values would depend on exact technique, individual biomechanics, etc.
  if (nameLower.includes('push-up') || nameLower.includes('pushup')) {
    return bodyWeight * 0.65; // ~65% of bodyweight
  } else if (nameLower.includes('pull-up') || nameLower.includes('pullup') || 
             nameLower.includes('chin-up') || nameLower.includes('chinup')) {
    return bodyWeight * 1.0; // ~100% of bodyweight
  } else if (nameLower.includes('dip')) {
    return bodyWeight * 1.0; // ~100% of bodyweight
  } else if (nameLower.includes('squat') && !nameLower.includes('weighted')) {
    return bodyWeight * 0.6; // ~60% of bodyweight (for air squats)
  } else if (nameLower.includes('lunge') && !nameLower.includes('weighted')) {
    return bodyWeight * 0.6; // ~60% of bodyweight (for bodyweight lunges)
  } else if (nameLower.includes('plank')) {
    return bodyWeight * 0.6; // ~60% of bodyweight
  } else if (nameLower.includes('sit-up') || nameLower.includes('situp')) {
    return bodyWeight * 0.3; // ~30% of bodyweight
  } else if (nameLower.includes('leg raise')) {
    return bodyWeight * 0.5; // ~50% of bodyweight (for leg portion)
  } else if (nameLower.includes('mountain climber')) {
    return bodyWeight * 0.6; // ~60% of bodyweight
  } else if (nameLower.includes('burpee')) {
    return bodyWeight * 1.0; // ~100% of bodyweight given the explosive component
  }
  
  // Default to 50% of bodyweight if unknown
  return bodyWeight * 0.5;
};
