import { ExerciseSet } from "@/types/exercise";
import { WorkoutMetrics } from "@/types/workout-metrics";

export const isIsometricExercise = (exerciseName: string): boolean => {
  // Add your isometric exercise checks here
  return exerciseName.toLowerCase().includes('hold') || 
         exerciseName.toLowerCase().includes('plank') ||
         exerciseName.toLowerCase().includes('static');
};

export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatIsometricSet = (
  duration: number,
  weight: number,
  weightUnit: string
): string => {
  return `${formatDuration(duration)} hold${weight > 0 ? ` @ ${weight}${weightUnit}` : ''}`;
};

export const formatRestTime = (seconds: number): string => {
  return formatDuration(seconds);
};

// Effort factors for different exercise types
export const EXERCISE_LOAD_FACTORS: Record<string, number> = {
  // Full bodyweight movements
  "Pull-ups": 1.0,
  "Chin-ups": 1.0,
  "Dips": 1.0,
  "Muscle-ups": 1.0,
  
  // Push movements (partial bodyweight)
  "Push-ups": 0.65,
  "Decline Push-ups": 0.7,
  "Incline Push-ups": 0.5,
  
  // Core movements
  "Leg Raises": 0.5,
  "Hanging Leg Raises": 0.5,
  "Knee Raises": 0.35,
  "Hanging Knee Raises": 0.35,
  "Ab Rollouts": 0.5,
  "Mountain Climbers": 0.4,
  
  // Isometric holds
  "Plank": 0.6,
  "Side Plank": 0.5,
  "L-Sit": 0.7,
  "Front Lever": 0.8,
  "Back Lever": 0.8,
  "Handstand": 1.0,
  "Wall Sit": 0.7
};

// Default load factor for exercises not in the map
const DEFAULT_LOAD_FACTOR = 0.5;

// Get load factor for a specific exercise
export const getExerciseLoadFactor = (exerciseName: string): number => {
  // Check for exact match
  if (EXERCISE_LOAD_FACTORS[exerciseName]) {
    return EXERCISE_LOAD_FACTORS[exerciseName];
  }
  
  // Check for partial matches
  for (const [key, value] of Object.entries(EXERCISE_LOAD_FACTORS)) {
    if (exerciseName.toLowerCase().includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return DEFAULT_LOAD_FACTOR;
};

// Determine if an exercise is primarily bodyweight
export const isBodyweightExercise = (exerciseName: string): boolean => {
  const bodyweightKeywords = [
    'push-up', 'pushup', 'pull-up', 'pullup', 'dip', 'plank', 
    'burpee', 'mountain climber', 'crunch', 'sit-up', 'situp',
    'leg raise', 'knee raise', 'bodyweight', 'body weight', 
    'squat', 'lunge', 'handstand', 'pistol'
  ];
  
  return bodyweightKeywords.some(keyword => 
    exerciseName.toLowerCase().includes(keyword)
  );
};

// Add the functions from workoutMetrics.ts
export const calculateWorkoutMetrics = (
  exercises: Record<string, ExerciseSet[]>,
  time: number,
  weightUnit: string,
  userBodyweight: number = 70 // Default to 70kg if no user bodyweight provided
): WorkoutMetrics => {
  const exerciseCount = Object.keys(exercises).length;
  let totalSets = 0;
  let completedSets = 0;
  let totalVolume = 0;
  let totalIntensity = 0;
  let setCount = 0;

  // Calculate basic metrics
  Object.entries(exercises).forEach(([exerciseName, sets]) => {
    totalSets += sets.length;
    completedSets += sets.filter((set) => set.completed).length;
    
    sets.forEach((set) => {
      if (set.completed) {
        // Calculate volume based on exercise type
        totalVolume += calculateSetVolume(set, exerciseName, userBodyweight);
        
        // Calculate intensity based on weight relative to max weight for the exercise
        const isIsometric = isIsometricExercise(exerciseName);
        const isBodyweight = isBodyweightExercise(exerciseName);
        
        if (!isIsometric && !isBodyweight && set.weight > 0) {
          const maxWeight = Math.max(...sets.map(s => s.weight > 0 ? s.weight : 0));
          if (maxWeight > 0) {
            totalIntensity += (set.weight / maxWeight) * 100;
            setCount++;
          }
        } else {
          // Assign a standard intensity value for bodyweight/isometric
          totalIntensity += 70;
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

export const calculateSetVolume = (
  set: ExerciseSet, 
  exerciseName: string = "", 
  userBodyweight: number = 70
): number => {
  if (!set.completed) return 0;
  
  const isIsometric = set.duration && set.duration > 0;
  const isBodyweight = isBodyweightExercise(exerciseName);
  const loadFactor = getExerciseLoadFactor(exerciseName);
  
  // For isometric exercises (time-based)
  if (isIsometric) {
    // If weight is explicitly provided, use it
    if (set.weight > 0) {
      return set.weight * (set.duration || 0) / 10;
    } 
    // Otherwise use adjusted bodyweight
    else {
      return (userBodyweight * loadFactor) * (set.duration || 0) / 10;
    }
  }
  
  // For standard weighted exercises
  if (set.weight > 0 && set.reps > 0) {
    return set.weight * set.reps;
  }
  
  // For bodyweight exercises with no explicit weight
  if (isBodyweight && set.reps > 0) {
    return userBodyweight * loadFactor * set.reps;
  }
  
  // For other bodyweight exercises (if none of the above criteria match)
  if (set.reps > 0) {
    return set.reps * 10; // Fallback nominal weight value
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
