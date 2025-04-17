
export interface ExerciseSet {
  id?: string;
  weight: number;
  reps: number;
  completed: boolean;
  set_number: number; // Required to match database schema
  exercise_name: string;
  workout_id: string; // Required to match database schema
}

export type MuscleGroup = string;
export type EquipmentType = string;
export type MovementPattern = 'push' | 'pull' | 'squat' | 'hinge' | 'rotation' | 'carry' | 'isolation';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Exercise {
  id: string;
  name: string;
  description: string;
  primary_muscle_groups: MuscleGroup[];
  secondary_muscle_groups: MuscleGroup[];
  equipment_type: EquipmentType[];
  movement_pattern: MovementPattern;
  difficulty: Difficulty;
  is_compound: boolean;
  instructions: Record<string, any>; // Json type in Supabase
  is_custom?: boolean;
  created_by?: string;
  // Optional fields
  media_urls?: Record<string, any>; // Json type in Supabase
  metadata?: Record<string, any>; // Json type in Supabase
  tips?: string[];
  variations?: string[];
}

export const MOVEMENT_PATTERNS: MovementPattern[] = ['push', 'pull', 'squat', 'hinge', 'rotation', 'carry', 'isolation'];
export const DIFFICULTY_LEVELS: Difficulty[] = ['beginner', 'intermediate', 'advanced'];
export const COMMON_MUSCLE_GROUPS: MuscleGroup[] = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Forearms',
  'Quadriceps', 'Hamstrings', 'Calves', 'Glutes', 'Abs', 'Obliques',
  'Lower Back', 'Neck', 'Traps'
];
export const COMMON_EQUIPMENT: EquipmentType[] = [
  'Barbell', 'Dumbbell', 'Kettlebell', 'Cable Machine', 'Smith Machine',
  'Resistance Band', 'Bodyweight', 'Machine', 'Medicine Ball', 'Stability Ball',
  'TRX/Suspension', 'Bench', 'Pull-up Bar', 'Battle Ropes', 'Box', 'None'
];
