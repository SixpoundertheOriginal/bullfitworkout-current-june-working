export type MuscleGroup = 
  | "Chest" 
  | "Back" 
  | "Shoulders" 
  | "Biceps" 
  | "Triceps" 
  | "Forearms" 
  | "Quadriceps" 
  | "Hamstrings" 
  | "Calves" 
  | "Glutes" 
  | "Abdominals" 
  | "Obliques" 
  | "Lower Back" 
  | "Trapezius" 
  | "Neck";

export type EquipmentType = 
  | "Barbell" 
  | "Dumbbell" 
  | "Kettlebell" 
  | "Machine" 
  | "Cable" 
  | "Bodyweight" 
  | "Resistance Band" 
  | "Medicine Ball" 
  | "Plate" 
  | "TRX" 
  | "Rope" 
  | "Smith Machine" 
  | "EZ Bar" 
  | "Pull Up Bar" 
  | "Other";

export type MovementPattern = 
  | "push" 
  | "pull" 
  | "squat" 
  | "hinge" 
  | "rotation" 
  | "carry" 
  | "lunge" 
  | "isometric";

export type Difficulty = 
  | "beginner" 
  | "intermediate" 
  | "advanced" 
  | "expert";

export const COMMON_MUSCLE_GROUPS: MuscleGroup[] = [
  "Chest", "Back", "Shoulders", "Biceps", "Triceps", 
  "Forearms", "Quadriceps", "Hamstrings", "Calves", 
  "Glutes", "Abdominals", "Obliques", "Lower Back", 
  "Trapezius", "Neck"
];

export const COMMON_EQUIPMENT: EquipmentType[] = [
  "Barbell", "Dumbbell", "Kettlebell", "Machine", 
  "Cable", "Bodyweight", "Resistance Band", "Medicine Ball", 
  "Plate", "TRX", "Rope", "Smith Machine", "EZ Bar", 
  "Pull Up Bar", 
  "Other"
];

export const MOVEMENT_PATTERNS: MovementPattern[] = [
  "push", "pull", "squat", "hinge", "rotation", "carry", "lunge", "isometric"
];

export const DIFFICULTY_LEVELS: Difficulty[] = [
  "beginner", "intermediate", "advanced", "expert"
];

export interface Exercise {
  id: string;
  name: string;
  created_at: string;
  user_id: string;
  description?: string;
  primary_muscle_groups: MuscleGroup[];
  secondary_muscle_groups: MuscleGroup[];
  equipment_type: EquipmentType[];
  movement_pattern: MovementPattern;
  difficulty: Difficulty;
  instructions: Record<string, any>;
  is_compound: boolean;
  tips?: string[];
  variations?: string[];
  metadata: {
    default_weight?: number;
    default_reps?: number;
    weight_unit?: string;
    normalized_weight?: number;
    display_unit?: string;
  };
}

export interface ExerciseSet {
  id?: string;
  exercise_name: string;
  workout_id: string;
  weight: number;
  reps: number;
  set_number: number;
  completed: boolean;
  restTime?: number;
  isEditing?: boolean;
}

export interface Workout {
  id: string;
  created_at: string;
  user_id: string;
  start_time: string;
  end_time: string;
  duration: number;
  name: string;
  training_type: string;
}
