
import { 
  MuscleGroup, 
  EquipmentType, 
  MovementPattern, 
  Difficulty, 
  LoadingType, 
  VariantCategory 
} from '@/constants/exerciseMetadata';

// Re-export types with export type syntax for compatibility with isolatedModules
export type { MuscleGroup };
export type { EquipmentType };
export type { MovementPattern };
export type { Difficulty };
export type { LoadingType };
export type { VariantCategory };

// Add WeightCalculation interface that was missing
export interface WeightCalculation {
  value: number;
  isAuto: boolean;
  source: 'default' | 'auto' | 'user';
}

// Load factors map for exercise weight calculations
export const EXERCISE_LOAD_FACTORS: Record<string, { factor: number }> = {
  "Squat": { factor: 1.0 },
  "Deadlift": { factor: 1.0 },
  "Bench Press": { factor: 0.8 },
  "Pull-up": { factor: 0.9 },
  "Push-up": { factor: 0.6 },
  // Default factor is used in useExerciseWeight.ts if specific exercise not found
};

// Base Exercise interface
export interface Exercise {
  id: string;
  name: string;
  description?: string;
  primary_muscle_groups: MuscleGroup[];
  secondary_muscle_groups?: MuscleGroup[];
  equipment_type: EquipmentType[];
  movement_pattern: MovementPattern;
  difficulty: Difficulty;
  instructions?: {
    steps?: string;
    form?: string;
  };
  is_compound: boolean;
  estimated_load_percent?: number;
  loading_type?: LoadingType;
  tips?: string[];
  variations?: string[];
  variant_category?: VariantCategory;
  is_bodyweight: boolean;
  energy_cost_factor?: number;
  metadata?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  user_id?: string | null;
  visibility?: 'public' | 'private' | 'shared';
  icon?: string;
  is_favorite?: boolean;
  last_used_at?: string | null;
  usage_count?: number;
  is_recommended?: boolean;
  image_url?: string | null;
  video_url?: string | null;
}

// Types for exercise variants
export interface ExerciseVariant {
  id: string;
  exercise_id: string;
  name: string;
  description?: string;
  difficulty_modifier?: number; // Easier (-1), Same (0), Harder (+1)
  equipment_type?: EquipmentType[];
  instructions?: string;
  image_url?: string | null;
  video_url?: string | null;
  variant_type: 'regression' | 'progression' | 'variation' | 'alternative';
}

// Exercise set data
export interface ExerciseSet {
  id: string; // Made required for consistency
  exercise_name: string;
  exercise_id?: string;
  set_number: number;
  weight?: number;
  reps?: number;
  duration?: number; // In seconds
  distance?: number; // In meters
  is_warmup?: boolean;
  is_dropset?: boolean;
  perceived_exertion?: number; // RPE scale 1-10
  notes?: string;
  completed: boolean;
  workout_id?: string; // Keep optional as expected by EditExerciseSetModal
  created_at?: string;
  updated_at?: string;
  restTime?: number; // Added for compatibility with existing code
  rest_time?: number; // Added for API compatibility
  isEditing?: boolean; // Added for UI state management
  weightCalculation?: WeightCalculation; // Added for weight calculation logic
  metadata?: Record<string, any>; // Added for additional data
}

// Exercise history item
export interface ExerciseHistory {
  date: string;
  sets: ExerciseSet[];
  volume?: number;
  max_weight?: number;
  total_reps?: number;
}

// Add missing utility functions referenced in workoutMetricsProcessor.ts
export const calculateEffectiveWeight = (exercise: Exercise, userWeight: number = 70): number => {
  if (isBodyweightExercise(exercise)) {
    const factor = getExerciseLoadFactor(exercise);
    return userWeight * factor;
  }
  return 0;
};

export const getExerciseLoadFactor = (exercise: Exercise): number => {
  if (exercise.estimated_load_percent) {
    return exercise.estimated_load_percent / 100;
  }
  
  return EXERCISE_LOAD_FACTORS[exercise.name]?.factor || 0.6;
};

export const isBodyweightExercise = (exercise: Exercise): boolean => {
  return exercise.is_bodyweight || 
    (Array.isArray(exercise.equipment_type) && 
     exercise.equipment_type.includes('bodyweight' as EquipmentType));
};
