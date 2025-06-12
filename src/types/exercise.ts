export interface ExerciseSet {
  id: string;
  weight: number;
  reps: number;
  duration: string;
  completed: boolean;
  volume: number;
  set_number?: number;
  exercise_name?: string;
  workout_id?: string;
  restTime?: number;
  rest_time?: number;
  created_at?: string;
}

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  primary_muscle_groups: string[];
  secondary_muscle_groups: string[];
  equipment_type: string[];
  difficulty?: string;
  movement_pattern?: string;
  is_compound?: boolean;
  is_bodyweight?: boolean;
  load_factor?: number;
  tips?: string[];
  variations?: string[];
  instructions?: {
    steps: string;
    form: string;
  };
  sets?: ExerciseSet[];
  user_id?: string;
  created_at?: string;
  metadata?: Record<string, any>;
}

export type ExerciseCardVariant = 'library-manage' | 'workout-add' | 'compact' | 'premium' | 'minimal';

export interface ExerciseCardContextType {
  exercise: Exercise;
  variant: ExerciseCardVariant;
  context: 'library' | 'selection' | 'workout';
  isFavorited: boolean;
  className?: string;
  primaryMuscles: string[];
  equipment: string[];
}

// Type definitions - Updated muscle groups to match usage
export type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'arms' | 'legs' | 'core' | 'glutes' | 'calves' | 'biceps' | 'triceps' | 'quads' | 'hamstrings' | 'lats' | 'abs';
export type EquipmentType = 'barbell' | 'dumbbell' | 'kettlebell' | 'bodyweight' | 'resistance_band' | 'cable' | 'machine' | 'smith_machine' | 'box' | 'bench' | 'other';
export type MovementPattern = 'push' | 'pull' | 'squat' | 'hinge' | 'lunge' | 'carry' | 'rotation' | 'core';
export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

// Weight unit type - standardize to use "lbs" consistently
export type WeightUnit = 'kg' | 'lbs';

// Weight calculation interfaces
export interface WeightCalculation {
  weight: number;
  unit: WeightUnit;
  converted?: number;
  value?: number;
  isAuto?: boolean;
  source?: string;
}

// Exercise load factors
export const EXERCISE_LOAD_FACTORS = {
  compound: 1.2,
  isolation: 1.0,
  bodyweight: 0.8,
  machine: 1.1
} as const;

// Utility functions for weight calculations
export const calculateEffectiveWeight = (weight: number, exerciseType: string): number => {
  const loadFactor = EXERCISE_LOAD_FACTORS[exerciseType as keyof typeof EXERCISE_LOAD_FACTORS] || 1.0;
  return weight * loadFactor;
};

export const getExerciseLoadFactor = (exerciseType: string): number => {
  return EXERCISE_LOAD_FACTORS[exerciseType as keyof typeof EXERCISE_LOAD_FACTORS] || 1.0;
};

export const isBodyweightExercise = (equipmentTypes: string[]): boolean => {
  return equipmentTypes.includes('bodyweight');
};

// Constants
export const COMMON_MUSCLE_GROUPS: MuscleGroup[] = [
  'chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'glutes', 'calves', 'biceps', 'triceps', 'quads', 'hamstrings', 'lats', 'abs'
];

export const COMMON_EQUIPMENT: EquipmentType[] = [
  'barbell', 'dumbbell', 'kettlebell', 'bodyweight', 'resistance_band', 'cable', 'machine', 'smith_machine', 'box', 'bench', 'other'
];

export const MOVEMENT_PATTERNS: MovementPattern[] = [
  'push', 'pull', 'squat', 'hinge', 'lunge', 'carry', 'rotation', 'core'
];

export const DIFFICULTY_LEVELS: Difficulty[] = [
  'beginner', 'intermediate', 'advanced'
];

// Exercise metrics constants
export const LOADING_TYPES = ['initial', 'search', 'filter', 'infinite'] as const;
export const VARIANT_CATEGORIES = ['basic', 'advanced', 'premium'] as const;

export type LoadingType = typeof LOADING_TYPES[number];
export type VariantCategory = typeof VARIANT_CATEGORIES[number];

// Enhanced exercise for training context
export interface EnhancedExercise extends Exercise {
  id: string; // Make sure id is always present
}

// Exercise input interface for database operations
export interface ExerciseInput {
  name: string;
  description?: string; // Make this optional
  primary_muscle_groups: string[];
  secondary_muscle_groups: string[];
  equipment_type: string[];
  difficulty: string;
  movement_pattern: string;
  is_compound: boolean;
  instructions: {
    steps: string;
    form: string;
  };
  tips?: string[];
  variations?: string[];
  user_id?: string;
  metadata?: Record<string, any>;
}
