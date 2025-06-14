
import { ExerciseSet } from '@/types/exercise';

export const calculateVolume = (set: ExerciseSet): number => {
  const weight = typeof set.weight === 'number' ? set.weight : 0;
  const reps = typeof set.reps === 'number' ? set.reps : 0;
  return weight * reps;
};

export const calculateSetVolume = (set: ExerciseSet, exerciseName?: string, userBodyWeight?: number): number => {
  // If this is a bodyweight exercise with auto-calculated weight
  if (set.weightCalculation?.isAuto && userBodyWeight) {
    return set.weightCalculation.value * set.reps;
  }
  
  return calculateVolume(set);
};

export const calculateTotalVolume = (sets: ExerciseSet[]): number => {
  return sets
    .filter(set => set.completed)
    .reduce((total, set) => total + calculateVolume(set), 0);
};

export const calculateMaxWeight = (sets: ExerciseSet[]): number => {
  return sets
    .filter(set => set.completed && set.weight > 0)
    .reduce((max, set) => Math.max(max, set.weight), 0);
};

export const calculateTotalReps = (sets: ExerciseSet[]): number => {
  return sets
    .filter(set => set.completed)
    .reduce((total, set) => total + set.reps, 0);
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};

export const isIsometricExercise = (exerciseName: string): boolean => {
  const isometricKeywords = ['plank', 'hold', 'wall sit', 'dead hang', 'l-sit'];
  return isometricKeywords.some(keyword => 
    exerciseName.toLowerCase().includes(keyword)
  );
};

export const formatIsometricSet = (duration: number, weight?: number): string => {
  const durationStr = formatDuration(duration);
  return weight && weight > 0 ? `${durationStr} @ ${weight}kg` : durationStr;
};

export const getExerciseGroup = (exerciseName: string): string => {
  const exerciseName_lower = exerciseName.toLowerCase();
  
  if (exerciseName_lower.includes('squat') || exerciseName_lower.includes('lunge')) {
    return 'legs';
  }
  if (exerciseName_lower.includes('bench') || exerciseName_lower.includes('press') || exerciseName_lower.includes('push')) {
    return 'chest';
  }
  if (exerciseName_lower.includes('row') || exerciseName_lower.includes('pull') || exerciseName_lower.includes('lat')) {
    return 'back';
  }
  if (exerciseName_lower.includes('curl') || exerciseName_lower.includes('bicep')) {
    return 'arms';
  }
  if (exerciseName_lower.includes('shoulder') || exerciseName_lower.includes('lateral')) {
    return 'shoulders';
  }
  
  return 'other';
};

// Fixed function to return Record<string, number> instead of array
export const calculateMuscleFocus = (exercises: Record<string, ExerciseSet[]>): Record<string, number> => {
  const muscleGroups: Record<string, number> = {};
  
  Object.entries(exercises).forEach(([exerciseName, sets]) => {
    const group = getExerciseGroup(exerciseName);
    const volume = calculateTotalVolume(sets);
    muscleGroups[group] = (muscleGroups[group] || 0) + volume;
  });
  
  return muscleGroups;
};

export const analyzeWorkoutComposition = (exercises: Record<string, ExerciseSet[]>) => {
  const totalExercises = Object.keys(exercises).length;
  
  let compound = 0;
  let isolation = 0;
  let bodyweight = 0;
  let isometric = 0;
  
  Object.keys(exercises).forEach(exerciseName => {
    if (isIsometricExercise(exerciseName)) {
      isometric++;
    } else if (isBodyweightExercise([exerciseName])) {
      bodyweight++;
    } else if (isCompoundExercise(exerciseName)) {
      compound++;
    } else {
      isolation++;
    }
  });
  
  return {
    compound: { count: compound, percentage: totalExercises > 0 ? (compound / totalExercises) * 100 : 0 },
    isolation: { count: isolation, percentage: totalExercises > 0 ? (isolation / totalExercises) * 100 : 0 },
    bodyweight: { count: bodyweight, percentage: totalExercises > 0 ? (bodyweight / totalExercises) * 100 : 0 },
    isometric: { count: isometric, percentage: totalExercises > 0 ? (isometric / totalExercises) * 100 : 0 },
    totalExercises
  };
};

export const isCompoundExercise = (exerciseName: string): boolean => {
  const compoundKeywords = ['squat', 'deadlift', 'bench', 'row', 'press', 'pull-up', 'chin-up'];
  return compoundKeywords.some(keyword => 
    exerciseName.toLowerCase().includes(keyword)
  );
};

export const isBodyweightExercise = (equipmentTypes: string[]): boolean => {
  return equipmentTypes.some(eq => eq.toLowerCase().includes('bodyweight') || eq.toLowerCase().includes('body'));
};

export const getTrendIndicator = (currentValue: number, previousValue: number): 'increasing' | 'decreasing' | 'stable' => {
  const threshold = 0.05; // 5% threshold
  const percentChange = previousValue > 0 ? (currentValue - previousValue) / previousValue : 0;
  
  if (Math.abs(percentChange) < threshold) return 'stable';
  return percentChange > 0 ? 'increasing' : 'decreasing';
};

// Fixed function signature to match expected parameters
export const calculateWorkoutMetrics = (
  exercises: Record<string, ExerciseSet[]>,
  time: number = 0,
  weightUnit: string = 'kg',
  userBodyWeight: number = 70
) => {
  const totalVolume = Object.values(exercises).flat().reduce((sum, set) => 
    set.completed ? sum + calculateSetVolume(set, undefined, userBodyWeight) : sum, 0
  );
  
  const totalSets = Object.values(exercises).flat().length;
  const completedSets = Object.values(exercises).flat().filter(set => set.completed).length;
  const exerciseCount = Object.keys(exercises).length;
  
  // Calculate performance metrics
  const intensity = userBodyWeight > 0 && completedSets > 0 
    ? ((totalVolume / completedSets) / userBodyWeight) * 100 
    : 0;
    
  const efficiency = time > 0 ? Math.min(100, (completedSets / time) * 60) : 0;
  const density = time > 0 ? (totalVolume / time) : 0;
  
  return {
    time,
    exerciseCount,
    completedSets,
    totalSets,
    performance: {
      volume: totalVolume,
      intensity: Math.round(intensity),
      density: Math.round(density),
      efficiency: Math.round(efficiency)
    }
  };
};
