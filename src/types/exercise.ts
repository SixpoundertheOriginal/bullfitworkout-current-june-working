
export interface Exercise {
  id: string;
  name: string;
  description?: string;
  primary_muscle_groups: string[];
  secondary_muscle_groups: string[];
  equipment_type: string[];
  movement_pattern: string;
  difficulty: string;
  is_custom?: boolean;
  created_by?: string;
  // Required fields for the database
  instructions: any; // Json type in Supabase
  is_compound: boolean;
  // Optional fields
  media_urls?: any; // Json type in Supabase
  metadata?: any; // Json type in Supabase
  tips?: string[];
  variations?: string[];
}

export interface ExerciseSet {
  id?: string;
  weight: number;
  reps: number;
  completed: boolean;
  set_number: number; // Make this required to match database schema
  exercise_name: string;
  workout_id: string; // Make this required to match database schema
}
