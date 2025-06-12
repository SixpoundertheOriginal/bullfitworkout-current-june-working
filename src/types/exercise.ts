
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
  primary_muscle_groups?: string[];
  equipment_type?: string[];
  difficulty?: string;
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
