
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
  id?: string;
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
  workout_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Exercise history item
export interface ExerciseHistory {
  date: string;
  sets: ExerciseSet[];
  volume?: number;
  max_weight?: number;
  total_reps?: number;
}
