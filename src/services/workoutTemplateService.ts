
import { TrainingConfig } from '@/hooks/useTrainingSetupPersistence';

export interface WorkoutTemplate {
  exercises: Array<{
    name: string;
    sets: number;
    reps: number;
    weight: number;
    restTime: number;
    muscleGroup: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  }>;
  estimatedDuration: number;
  caloriesBurned: number;
  equipment: string[];
  focusAreas: string[];
  xpReward: number;
}

const WORKOUT_TEMPLATES: Record<string, WorkoutTemplate> = {
  "Strength": {
    exercises: [
      { name: "Push-ups", sets: 3, reps: 12, weight: 0, restTime: 60, muscleGroup: "chest", difficulty: "beginner" },
      { name: "Squats", sets: 3, reps: 15, weight: 0, restTime: 60, muscleGroup: "legs", difficulty: "beginner" },
      { name: "Plank", sets: 3, reps: 30, weight: 0, restTime: 45, muscleGroup: "core", difficulty: "beginner" },
      { name: "Lunges", sets: 3, reps: 10, weight: 0, restTime: 60, muscleGroup: "legs", difficulty: "beginner" },
      { name: "Pike Push-ups", sets: 3, reps: 8, weight: 0, restTime: 60, muscleGroup: "shoulders", difficulty: "intermediate" },
      { name: "Mountain Climbers", sets: 3, reps: 20, weight: 0, restTime: 45, muscleGroup: "core", difficulty: "intermediate" }
    ],
    estimatedDuration: 35,
    caloriesBurned: 280,
    equipment: ["None"],
    focusAreas: ["Upper Body", "Lower Body", "Core"],
    xpReward: 150
  },
  "Cardio": {
    exercises: [
      { name: "Jumping Jacks", sets: 3, reps: 30, weight: 0, restTime: 30, muscleGroup: "full body", difficulty: "beginner" },
      { name: "High Knees", sets: 3, reps: 20, weight: 0, restTime: 30, muscleGroup: "legs", difficulty: "beginner" },
      { name: "Burpees", sets: 3, reps: 8, weight: 0, restTime: 45, muscleGroup: "full body", difficulty: "intermediate" },
      { name: "Sprint Intervals", sets: 4, reps: 30, weight: 0, restTime: 90, muscleGroup: "legs", difficulty: "intermediate" },
      { name: "Box Jumps", sets: 3, reps: 12, weight: 0, restTime: 60, muscleGroup: "legs", difficulty: "intermediate" }
    ],
    estimatedDuration: 25,
    caloriesBurned: 320,
    equipment: ["None"],
    focusAreas: ["Cardiovascular", "Fat Burn", "Endurance"],
    xpReward: 120
  },
  "Yoga": {
    exercises: [
      { name: "Sun Salutation", sets: 3, reps: 5, weight: 0, restTime: 30, muscleGroup: "full body", difficulty: "beginner" },
      { name: "Warrior Pose", sets: 2, reps: 8, weight: 0, restTime: 15, muscleGroup: "legs", difficulty: "beginner" },
      { name: "Tree Pose", sets: 2, reps: 5, weight: 0, restTime: 15, muscleGroup: "core", difficulty: "beginner" },
      { name: "Downward Dog", sets: 3, reps: 10, weight: 0, restTime: 20, muscleGroup: "full body", difficulty: "beginner" },
      { name: "Cobra Pose", sets: 3, reps: 8, weight: 0, restTime: 15, muscleGroup: "back", difficulty: "beginner" }
    ],
    estimatedDuration: 20,
    caloriesBurned: 150,
    equipment: ["Yoga Mat"],
    focusAreas: ["Flexibility", "Balance", "Mindfulness"],
    xpReward: 100
  },
  "Calisthenics": {
    exercises: [
      { name: "Pull-ups", sets: 3, reps: 8, weight: 0, restTime: 90, muscleGroup: "back", difficulty: "intermediate" },
      { name: "Dips", sets: 3, reps: 10, weight: 0, restTime: 60, muscleGroup: "triceps", difficulty: "intermediate" },
      { name: "Handstand Push-ups", sets: 2, reps: 5, weight: 0, restTime: 120, muscleGroup: "shoulders", difficulty: "advanced" },
      { name: "Pistol Squats", sets: 3, reps: 6, weight: 0, restTime: 90, muscleGroup: "legs", difficulty: "advanced" },
      { name: "L-Sit", sets: 3, reps: 15, weight: 0, restTime: 60, muscleGroup: "core", difficulty: "advanced" }
    ],
    estimatedDuration: 40,
    caloriesBurned: 300,
    equipment: ["Pull-up Bar"],
    focusAreas: ["Bodyweight Mastery", "Functional Strength"],
    xpReward: 180
  }
};

export function generateWorkoutTemplate(trainingConfig: TrainingConfig | null): WorkoutTemplate {
  const trainingType = trainingConfig?.trainingType || "Strength";
  const duration = trainingConfig?.duration || 30;
  
  let template = WORKOUT_TEMPLATES[trainingType] || WORKOUT_TEMPLATES["Strength"];
  
  // Adjust template based on duration
  if (duration < 20) {
    // Short workout - reduce exercises
    template = {
      ...template,
      exercises: template.exercises.slice(0, 3),
      estimatedDuration: duration,
      caloriesBurned: Math.round(template.caloriesBurned * 0.6),
      xpReward: Math.round(template.xpReward * 0.7)
    };
  } else if (duration > 45) {
    // Long workout - add more sets
    template = {
      ...template,
      exercises: template.exercises.map(ex => ({ ...ex, sets: ex.sets + 1 })),
      estimatedDuration: duration,
      caloriesBurned: Math.round(template.caloriesBurned * 1.4),
      xpReward: Math.round(template.xpReward * 1.3)
    };
  }
  
  // Apply tags/intensity adjustments
  if (trainingConfig?.tags?.includes('high-intensity')) {
    template = {
      ...template,
      exercises: template.exercises.map(ex => ({ ...ex, reps: Math.round(ex.reps * 1.2) })),
      caloriesBurned: Math.round(template.caloriesBurned * 1.2),
      xpReward: Math.round(template.xpReward * 1.1)
    };
  }
  
  return template;
}

export function convertTemplateToStoreFormat(template: WorkoutTemplate) {
  const exercises: Record<string, Array<{ weight: number; reps: number; restTime: number; completed: boolean; isEditing: boolean }>> = {};
  
  template.exercises.forEach(exercise => {
    exercises[exercise.name] = Array.from({ length: exercise.sets }, () => ({
      weight: exercise.weight,
      reps: exercise.reps,
      restTime: exercise.restTime,
      completed: false,
      isEditing: false
    }));
  });
  
  return exercises;
}
