
import { ExerciseSet } from '@/types/exercise';

export const calculateSetVolume = (set: ExerciseSet, exerciseName?: string, userBodyweight?: number): number => {
  // Make sure we're working with numbers
  const weight = typeof set.weight === 'string' ? parseFloat(set.weight) : set.weight;
  const reps = typeof set.reps === 'string' ? parseInt(set.reps, 10) : set.reps;
  
  if (!set.completed || isNaN(weight) || isNaN(reps)) {
    return 0;
  }
  
  // Special case for isometric exercises
  if (exerciseName && isIsometricExercise(exerciseName) && set.duration) {
    // For isometric exercises, factor in duration
    const effectiveWeight = weight > 0 ? weight : (userBodyweight || 70) * 0.7;
    return effectiveWeight * (set.duration / 10);
  }
  
  // Special case for bodyweight exercises
  if (exerciseName && isBodyweightExercise(exerciseName) && userBodyweight) {
    const loadFactor = getExerciseLoadFactor(exerciseName);
    return userBodyweight * loadFactor * reps;
  }
  
  // Standard calculation for weighted exercises
  return weight * reps;
};

export const getTrendIndicator = (
  currentValue: number, 
  previousValue: number
): 'increasing' | 'decreasing' | 'stable' | 'fluctuating' => {
  if (previousValue === 0) return 'stable';
  
  const percentChange = ((currentValue - previousValue) / previousValue) * 100;
  
  if (percentChange >= 5) return 'increasing';
  if (percentChange <= -5) return 'decreasing';
  if (Math.abs(percentChange) < 5) return 'stable';
  return 'fluctuating';
};

// Function to determine if an exercise is isometric
export const isIsometricExercise = (exerciseName: string): boolean => {
  const isometricExercises = [
    'plank', 'side plank', 'hollow hold', 'l-sit', 'wall sit',
    'bridge', 'superman', 'dead hang', 'handstand', 'isometric'
  ];
  
  return isometricExercises.some(exercise => 
    exerciseName.toLowerCase().includes(exercise.toLowerCase())
  );
};

// Function to determine if an exercise is bodyweight
export const isBodyweightExercise = (exerciseName: string): boolean => {
  const bodyweightExercises = [
    'push-up', 'pull-up', 'chin-up', 'dip', 'squat', 'lunge',
    'crunch', 'sit-up', 'leg raise', 'mountain climber', 'burpee',
    'bodyweight', 'body weight', 'calisthenics'
  ];
  
  // Check if the exercise name contains any bodyweight exercise keywords
  const isBW = bodyweightExercises.some(exercise => 
    exerciseName.toLowerCase().includes(exercise.toLowerCase())
  );
  
  // Check if it's not an isometric exercise (to avoid double counting)
  return isBW && !isIsometricExercise(exerciseName);
};

// Function to get load factor for bodyweight exercises
export const getExerciseLoadFactor = (exerciseName: string): number => {
  const loadFactors: Record<string, number> = {
    'pull-up': 1.0,
    'chin-up': 1.0,
    'dip': 1.0,
    'push-up': 0.65,
    'squat': 0.85,
    'lunge': 0.75,
    'crunch': 0.2,
    'sit-up': 0.3,
    'leg raise': 0.5,
    'mountain climber': 0.4,
    'burpee': 0.7
  };
  
  for (const [exercise, factor] of Object.entries(loadFactors)) {
    if (exerciseName.toLowerCase().includes(exercise.toLowerCase())) {
      return factor;
    }
  }
  
  // Default factor
  return 0.5;
};

// Function to determine muscle group
export const getExerciseGroup = (exerciseName: string): string | null => {
  const exerciseGroups: Record<string, string[]> = {
    'chest': ['bench press', 'push-up', 'dip', 'fly', 'chest'],
    'back': ['row', 'pull-up', 'lat', 'deadlift', 'back'],
    'shoulders': ['shoulder press', 'lateral raise', 'overhead', 'military', 'deltoid'],
    'arms': ['curl', 'extension', 'bicep', 'tricep'],
    'legs': ['squat', 'lunge', 'leg press', 'calf', 'hamstring', 'quad', 'leg'],
    'core': ['crunch', 'plank', 'sit-up', 'ab', 'core']
  };
  
  for (const [group, keywords] of Object.entries(exerciseGroups)) {
    if (keywords.some(keyword => exerciseName.toLowerCase().includes(keyword.toLowerCase()))) {
      return group;
    }
  }
  
  return null;
};

// Format duration for display
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (remainingSeconds === 0) {
    return `${minutes}m`;
  }
  
  return `${minutes}m ${remainingSeconds}s`;
};

// Format isometric set for display
export const formatIsometricSet = (duration: number, weight?: number, unit?: string): string => {
  const durationText = formatDuration(duration);
  
  if (!weight || weight === 0) {
    return `${durationText} hold`;
  }
  
  return `${durationText} hold with ${weight}${unit || 'kg'}`;
};

// Calculate workout metrics
export const calculateWorkoutMetrics = (
  exercises: Record<string, ExerciseSet[]>,
  time: number,
  weightUnit: string,
  userBodyweightKg: number = 70
) => {
  // Initialize metrics
  let totalVolume = 0;
  let totalSets = 0;
  let completedSets = 0;
  let totalWeight = 0;
  let maxWeight = 0;
  
  // Process each exercise
  Object.entries(exercises).forEach(([exerciseName, sets]) => {
    sets.forEach(set => {
      totalSets++;
      
      // Process completed sets
      if (set.completed) {
        completedSets++;
        
        // Calculate volume based on exercise type
        const volume = calculateSetVolume(set, exerciseName, userBodyweightKg);
        totalVolume += volume;
        
        // Track weight for intensity calculation
        const weight = typeof set.weight === 'string' ? parseFloat(set.weight) : set.weight;
        if (!isNaN(weight) && weight > 0) {
          totalWeight += weight;
          if (weight > maxWeight) {
            maxWeight = weight;
          }
        }
      }
    });
  });
  
  // Calculate performance metrics
  const exerciseCount = Object.keys(exercises).length;
  const intensity = maxWeight > 0 ? (totalWeight / completedSets) / maxWeight * 100 : 0;
  const density = time > 0 ? completedSets / (time / 60) : 0; // Sets per minute
  const efficiency = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  
  return {
    time,
    exerciseCount,
    completedSets,
    totalSets,
    performance: {
      volume: totalVolume,
      intensity: Math.round(intensity),
      density: Math.round(density * 10) / 10,
      efficiency: Math.round(efficiency)
    }
  };
};
