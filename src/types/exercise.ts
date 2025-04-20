
export interface ExerciseSet {
  weight: number;
  reps: number;
  duration?: number;
  restTime?: number;
  completed: boolean;
  isEditing?: boolean;
  set_number: number;
  exercise_name: string;
  workout_id: string;
}

export type MuscleGroup = 
  | 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core' | 'cardio' | 'full body'
  | 'biceps' | 'triceps' | 'forearms' | 'traps' | 'lats' | 'glutes' | 'hamstrings' 
  | 'quads' | 'calves' | 'abs' | 'obliques' | 'lower back';

export type EquipmentType = 
  | 'barbell' | 'dumbbell' | 'kettlebell' | 'cable' | 'machine' | 'bodyweight' 
  | 'resistance band' | 'smith machine' | 'box' | 'bench' | 'other';

export type MovementPattern = 
  | 'push' | 'pull' | 'squat' | 'hinge' | 'lunge' | 'rotation' | 'carry' | 'isometric';

export type Difficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface Exercise {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  description: string;
  primary_muscle_groups: MuscleGroup[];
  secondary_muscle_groups: MuscleGroup[];
  equipment_type: EquipmentType[];
  movement_pattern: MovementPattern;
  difficulty: Difficulty;
  instructions: Record<string, any>;
  is_compound: boolean;
  tips: string[];
  variations: string[];
  metadata: Record<string, any>;
  load_factor?: number;  // Added for bodyweight exercises
  is_isometric?: boolean; // Flag to identify isometric exercises
  is_bodyweight?: boolean; // Flag for bodyweight exercises
}

export const COMMON_MUSCLE_GROUPS: MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio', 'full body',
  'biceps', 'triceps', 'forearms', 'traps', 'lats', 'glutes', 'hamstrings',
  'quads', 'calves', 'abs', 'obliques', 'lower back'
];

export const COMMON_EQUIPMENT: EquipmentType[] = [
  'barbell', 'dumbbell', 'kettlebell', 'cable', 'machine', 'bodyweight',
  'resistance band', 'smith machine', 'box', 'bench', 'other'
];

export const MOVEMENT_PATTERNS: MovementPattern[] = [
  'push', 'pull', 'squat', 'hinge', 'lunge', 'rotation', 'carry', 'isometric'
];

export const DIFFICULTY_LEVELS: Difficulty[] = [
  'beginner', 'intermediate', 'advanced', 'expert'
];

export interface LoadFactorMapping {
  name: string;
  factor: number;
  description?: string;
}

export const EXERCISE_LOAD_FACTORS: LoadFactorMapping[] = [
  { name: "Pull-ups", factor: 1.0, description: "Full bodyweight" },
  { name: "Chin-ups", factor: 1.0, description: "Full bodyweight" },
  { name: "Dips", factor: 1.0, description: "Full bodyweight" },
  { name: "Push-ups", factor: 0.65, description: "~65% of bodyweight" },
  { name: "Leg Raises", factor: 0.5, description: "Lower body engagement" },
  { name: "Plank", factor: 0.6, description: "Isometric core engagement" },
  { name: "L-Sit", factor: 0.7, description: "Advanced isometric core hold" },
  { name: "Handstand", factor: 1.0, description: "Full bodyweight inverted" }
];
