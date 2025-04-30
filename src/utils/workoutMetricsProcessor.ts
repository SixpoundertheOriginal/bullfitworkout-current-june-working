
import { ExerciseSet } from '@/types/exercise';
import { WorkoutMetrics } from '@/types/workout-metrics';
import { 
  calculateMuscleFocus, 
  analyzeWorkoutComposition, 
  getExerciseGroup,
  calculateSetVolume,
  isIsometricExercise,
  isBodyweightExercise,
  formatDuration
} from '@/utils/exerciseUtils';

export interface UserBodyInfo {
  weight: number;
  unit: string;
}

export interface WorkoutComposition {
  compound: { count: number; percentage: number };
  isolation: { count: number; percentage: number };
  bodyweight: { count: number; percentage: number };
  isometric: { count: number; percentage: number };
  totalExercises: number;
}

export interface ExerciseGroupData {
  group: string;
  totalVolume: number;
  exercises: string[];
}

export interface WorkoutTimeDistribution {
  activeTime: number;  // in minutes
  restTime: number;    // in minutes
  activeTimePercentage: number;
  restTimePercentage: number;
}

export interface ProcessedWorkoutMetrics {
  // Core metrics
  duration: number;    // in minutes
  formattedDuration: string;
  totalVolume: number;
  exerciseCount: number;
  setCount: {
    total: number;
    completed: number;
  };
  
  // Performance metrics
  efficiency: number;  // percentage
  density: number;     // sets per minute
  intensity: number;   // percentage of max weight
  
  // Exercise breakdown
  muscleFocus: Record<string, number>;
  composition: WorkoutComposition;
  exerciseGroups: ExerciseGroupData[];
  
  // Time metrics
  timeDistribution: WorkoutTimeDistribution;
  
  // Additional metadata
  maxWeight: number;
  exerciseTypeCounts: {
    weighted: number;
    bodyweight: number;
    isometric: number;
    total: number;
  };
}

/**
 * Process workout data to calculate standardized metrics
 * 
 * @param exercises The workout's exercises and sets
 * @param duration The workout duration in minutes
 * @param weightUnit The unit of weight measurement ('kg' or 'lb')
 * @param userBodyInfo Optional user body information for bodyweight calculations
 * @returns Standardized processed workout metrics
 */
export function processWorkoutMetrics(
  exercises: Record<string, ExerciseSet[]>,
  duration: number,
  weightUnit: string = 'kg',
  userBodyInfo?: UserBodyInfo
): ProcessedWorkoutMetrics {
  // Default values if no exercises
  if (!exercises || Object.keys(exercises).length === 0) {
    return getEmptyWorkoutMetrics(duration);
  }

  // Get user bodyweight (with default fallback of 70kg)
  const userBodyweight = userBodyInfo?.weight || 70;
  
  // Convert user weight to kg if needed
  const userWeightInKg = userBodyInfo?.unit === 'lb' 
    ? userBodyweight / 2.20462 
    : userBodyweight;
    
  // Calculate exercise and set counts
  const exerciseCount = Object.keys(exercises).length;
  const allSets = Object.values(exercises).flat();
  const totalSets = allSets.length;
  const completedSets = allSets.filter(set => set.completed).length;
  
  // Calculate efficiency percentage
  const efficiency = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  
  // Calculate volume and weight metrics
  let totalVolume = 0;
  let weightedSetCount = 0;
  let maxWeight = 0;
  let totalRestTime = 0;
  
  allSets.forEach(set => {
    if (set.completed) {
      // Calculate volume based on weight and reps
      const volume = calculateSetVolume(set, "", userWeightInKg);
      totalVolume += volume;
      
      // Track maximum weight
      if (set.weight > maxWeight) maxWeight = set.weight;
      
      // Count weighted sets
      if (set.weight > 0) {
        weightedSetCount++;
      }
    }
    
    // Sum up rest time
    totalRestTime += set.restTime || 60;
  });
  
  // Calculate average weight
  const avgWeight = weightedSetCount > 0 ? totalVolume / weightedSetCount : 0;
  
  // Calculate intensity
  const intensity = maxWeight > 0 ? (avgWeight / maxWeight) * 100 : 0;
  
  // Calculate active workout time and rest time (in minutes)
  const restTimeMinutes = totalRestTime / 60;
  const activeWorkoutTime = Math.max(duration - restTimeMinutes, 0);
  
  // Calculate time distribution percentages
  const activeTimePercentage = duration > 0 ? (activeWorkoutTime / duration) * 100 : 0;
  const restTimePercentage = duration > 0 ? (restTimeMinutes / duration) * 100 : 0;
  
  // Calculate workout density (sets per minute)
  const density = duration > 0 ? completedSets / duration : 0;
  
  // Calculate muscle focus distribution
  const muscleFocus = calculateMuscleFocus(exercises);
  
  // Analyze exercise composition
  const composition = analyzeWorkoutComposition(exercises);
  
  // Calculate exercise groups data
  const groupsMap: Record<string, ExerciseGroupData> = {};
  
  // Track exercise types for analytics
  let weightedCount = 0;
  let bodyweightCount = 0;
  let isometricCount = 0;
  
  Object.entries(exercises).forEach(([exerciseName, sets]) => {
    const group = getExerciseGroup(exerciseName);
    if (!group) return;
    
    if (!groupsMap[group]) {
      groupsMap[group] = {
        group,
        totalVolume: 0,
        exercises: []
      };
    }
    
    // Add exercise to group
    if (!groupsMap[group].exercises.includes(exerciseName)) {
      groupsMap[group].exercises.push(exerciseName);
    }
    
    // Track exercise type
    if (isIsometricExercise(exerciseName)) {
      isometricCount++;
    } else if (isBodyweightExercise(exerciseName)) {
      bodyweightCount++;
    } else {
      weightedCount++;
    }
    
    // Calculate volume for this exercise
    let exerciseVolume = 0;
    sets.forEach(set => {
      if (set.completed) {
        exerciseVolume += calculateSetVolume(set, exerciseName, userWeightInKg);
      }
    });
    
    groupsMap[group].totalVolume += exerciseVolume;
  });

  return {
    // Core metrics
    duration: duration,
    formattedDuration: formatDuration(duration * 60), // formatDuration expects seconds
    totalVolume: totalVolume,
    exerciseCount: exerciseCount,
    setCount: {
      total: totalSets,
      completed: completedSets
    },
    
    // Performance metrics
    efficiency: efficiency,
    density: density,
    intensity: intensity,
    
    // Exercise breakdown
    muscleFocus: muscleFocus,
    composition: composition,
    exerciseGroups: Object.values(groupsMap),
    
    // Time metrics
    timeDistribution: {
      activeTime: activeWorkoutTime,
      restTime: restTimeMinutes,
      activeTimePercentage: activeTimePercentage,
      restTimePercentage: restTimePercentage
    },
    
    // Additional metadata
    maxWeight: maxWeight,
    exerciseTypeCounts: {
      weighted: weightedCount,
      bodyweight: bodyweightCount,
      isometric: isometricCount,
      total: weightedCount + bodyweightCount + isometricCount
    }
  };
}

/**
 * Return default empty metrics for a workout with no exercises
 */
function getEmptyWorkoutMetrics(duration: number): ProcessedWorkoutMetrics {
  return {
    duration: duration,
    formattedDuration: formatDuration(duration * 60),
    totalVolume: 0,
    exerciseCount: 0,
    setCount: { total: 0, completed: 0 },
    efficiency: 0,
    density: 0,
    intensity: 0,
    muscleFocus: {},
    composition: {
      compound: { count: 0, percentage: 0 },
      isolation: { count: 0, percentage: 0 },
      bodyweight: { count: 0, percentage: 0 },
      isometric: { count: 0, percentage: 0 },
      totalExercises: 0
    },
    exerciseGroups: [],
    timeDistribution: {
      activeTime: 0,
      restTime: 0,
      activeTimePercentage: 0,
      restTimePercentage: 0
    },
    maxWeight: 0,
    exerciseTypeCounts: {
      weighted: 0, bodyweight: 0, isometric: 0, total: 0
    }
  };
}
