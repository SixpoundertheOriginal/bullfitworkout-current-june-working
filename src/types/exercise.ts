
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
}

export interface ExerciseSet {
  id?: string;
  weight: number;
  reps: number;
  completed: boolean;
  set_number?: number;
  exercise_name: string;
  workout_id?: string;
}
