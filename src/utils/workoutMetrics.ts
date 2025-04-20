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
      if (set.completed) {
        // For normal weighted exercises
        if (set.weight > 0 && set.reps > 0) {
          totalVolume += set.weight * set.reps;
          // Calculate intensity based on weight relative to max weight for the exercise
          const maxWeight = Math.max(...sets.map(s => s.weight > 0 ? s.weight : 0));
          if (maxWeight > 0) {
            totalIntensity += (set.weight / maxWeight) * 100;
            setCount++;
          }
        } 
        // For isometric exercises (count as volume even if weight is 0)
        else if (set.reps > 0) {
          // Use a nominal weight value for isometric exercises
          totalVolume += set.reps * 10; // Assign 10 as nominal weight value for isometrics
          totalIntensity += 70; // Assign a standard intensity value for isometrics
          setCount++;
        }
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
  if (set.completed) {
    // Standard weighted exercise
    if (set.weight > 0 && set.reps > 0) {
      return set.weight * set.reps;
    }
    // Isometric or bodyweight exercise
    else if (set.reps > 0) {
      return set.reps * 10; // Use nominal weight value
    }
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

export const getExerciseGroup = (exerciseName: string): string => {
  // This would ideally come from a database table that maps exercises to muscle groups
  const exerciseGroups: Record<string, string> = {
    // Chest exercises
    "Bench Press": "chest",
    "Incline Bench Press": "chest",
    "Decline Bench Press": "chest",
    "Dumbbell Flyes": "chest",
    "Cable Flyes": "chest",
    "Push-ups": "chest",
    
    // Back exercises
    "Pull-ups": "back",
    "Chin-ups": "back",
    "Lat Pulldowns": "back",
    "Rows": "back",
    "Deadlift": "back",
    
    // Leg exercises
    "Squats": "legs",
    "Leg Press": "legs",
    "Lunges": "legs",
    "Leg Extensions": "legs",
    "Leg Curls": "legs",
    "Calf Raises": "legs",
    
    // Arm exercises
    "Bicep Curls": "arms",
    "Tricep Extensions": "arms",
    "Hammer Curls": "arms",
    "Skull Crushers": "arms",
    
    // Shoulder exercises
    "Overhead Press": "shoulders",
    "Lateral Raises": "shoulders",
    "Front Raises": "shoulders",
    "Rear Delt Flyes": "shoulders",
    
    // Core exercises
    "Planks": "core",
    "Crunches": "core",
    "Russian Twists": "core",
    "Leg Raises": "core"
  };
  
  return exerciseGroups[exerciseName] || "";
};

export const isSameExerciseGroup = (exercise1: string, exercise2: string): boolean => {
  const group1 = getExerciseGroup(exercise1);
  const group2 = getExerciseGroup(exercise2);
  
  return group1 !== "" && group1 === group2;
};

export const isIsometricExercise = (exerciseName: string): boolean => {
  // Check if the name contains keywords suggesting isometric exercise
  const isometricKeywords = [
    'static', 'hold', 'plank', 'isometric', 'hang', 'l-sit', 'wall sit'
  ];
  
  return isometricKeywords.some(keyword => 
    exerciseName.toLowerCase().includes(keyword.toLowerCase())
  );
};
