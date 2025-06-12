
export interface ExerciseSet {
  id: number;
  weight: number;
  reps: number;
  duration: string;
  completed: boolean;
  volume: number;
}

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  primary_muscle_groups?: string[];
  secondary_muscle_groups?: string[];
  equipment_type?: string[];
  difficulty?: string;
  movement_pattern?: string;
  is_compound?: boolean;
  instructions?: {
    steps: string;
    form: string;
  };
  sets?: ExerciseSet[];
}

export type ExerciseCardVariant = 'library-manage' | 'workout-add' | 'compact';

export interface ExerciseCardContextType {
  exercise: Exercise;
  variant: ExerciseCardVariant;
  context: 'library' | 'selection' | 'workout';
  isFavorited: boolean;
  className?: string;
  primaryMuscles: string[];
  equipment: string[];
}

// Type definitions
export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core' | 'glutes' | 'calves';
export type EquipmentType = 'barbell' | 'dumbbell' | 'kettlebell' | 'bodyweight' | 'resistance_band' | 'cable' | 'machine';
export type MovementPattern = 'push' | 'pull' | 'squat' | 'hinge' | 'lunge' | 'carry' | 'rotation';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// Constants
export const COMMON_MUSCLE_GROUPS: MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'glutes', 'calves'
];

export const COMMON_EQUIPMENT: EquipmentType[] = [
  'barbell', 'dumbbell', 'kettlebell', 'bodyweight', 'resistance_band', 'cable', 'machine'
];

export const MOVEMENT_PATTERNS: MovementPattern[] = [
  'push', 'pull', 'squat', 'hinge', 'lunge', 'carry', 'rotation'
];

export const DIFFICULTY_LEVELS: Difficulty[] = [
  'beginner', 'intermediate', 'advanced'
];
