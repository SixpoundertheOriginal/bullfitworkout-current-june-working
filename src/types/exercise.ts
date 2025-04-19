export interface Exercise {
  id: string;
  name: string;
  created_at: string;
  user_id: string;
  metadata: {
    default_weight: number;
    default_reps: number;
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
