
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
