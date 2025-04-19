
import { ExerciseSet } from "@/types/exercise";
import { WorkoutMetrics } from "@/types/workout-metrics";

export const calculateWorkoutMetrics = (
  exercises: Record<string, ExerciseSet[]>,
  time: number,
  weightUnit: string
): WorkoutMetrics => {
  const exerciseCount = Object.keys(exercises).length;
  let totalSets = 0;
  let completedSets = 0;
  let totalVolume = 0;
  let totalIntensity = 0;
  let setCount = 0;

  // Calculate basic metrics
  Object.values(exercises).forEach((sets) => {
    totalSets += sets.length;
    completedSets += sets.filter((set) => set.completed).length;
    
    sets.forEach((set) => {
      if (set.completed && set.weight > 0 && set.reps > 0) {
        totalVolume += set.weight * set.reps;
        // Calculate intensity based on weight relative to max weight for the exercise
        const maxWeight = Math.max(...sets.map(s => s.weight));
        totalIntensity += (set.weight / maxWeight) * 100;
        setCount++;
      }
    });
  });

  // Calculate density (sets per minute)
  const density = time > 0 ? (completedSets / (time / 60)) : 0;
  
  // Calculate average intensity
  const averageIntensity = setCount > 0 ? totalIntensity / setCount : 0;

  // Calculate efficiency score (0-100)
  // Based on: completion rate, density, and workout structure
  const completionRate = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  const densityScore = Math.min(density * 10, 100); // Normalize density to 0-100
  const structureScore = Math.min(exerciseCount * 20, 100); // Reward workout complexity

  const efficiencyScore = Math.round(
    (completionRate * 0.4) + // 40% weight on completion
    (densityScore * 0.3) + // 30% weight on density
    (structureScore * 0.3) // 30% weight on structure
  );

  return {
    time,
    exerciseCount,
    completedSets,
    totalSets,
    performance: {
      volume: totalVolume,
      intensity: Math.round(averageIntensity),
      density: Math.round(density * 100) / 100,
      efficiency: Math.min(Math.max(efficiencyScore, 0), 100)
    }
  };
};

export const calculateSetVolume = (set: ExerciseSet): number => {
  if (set.completed && set.weight > 0 && set.reps > 0) {
    return set.weight * set.reps;
  }
  return 0;
};

export const getTrendIndicator = (
  currentValue: number,
  previousValue: number
): 'increasing' | 'decreasing' | 'stable' => {
  const percentChange = previousValue > 0 ? 
    ((currentValue - previousValue) / previousValue) * 100 : 0;
  
  if (percentChange > 5) return 'increasing';
  if (percentChange < -5) return 'decreasing';
  return 'stable';
};
