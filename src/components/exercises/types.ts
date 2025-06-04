
export interface ExerciseSet {
  weight: number;
  reps: number;
  restTime?: number;
  completed: boolean;
  isEditing?: boolean;
}

export interface ExerciseCardProps {
  exercise: string;
  sets: ExerciseSet[];
  onAddSet: () => void;
  onCompleteSet: (setIndex: number) => void;
  onRemoveSet: (setIndex: number) => void;
  onEditSet: (setIndex: number) => void;
  onSaveSet: (setIndex: number) => void;
  onWeightChange: (setIndex: number, value: string) => void;
  onRepsChange: (setIndex: number, value: string) => void;
  onRestTimeChange?: (setIndex: number, value: string) => void;
  onWeightIncrement: (setIndex: number, increment: number) => void;
  onRepsIncrement: (setIndex: number, increment: number) => void;
  onRestTimeIncrement?: (setIndex: number, increment: number) => void;
  isActive: boolean;
  onShowRestTimer: () => void;
  onResetRestTimer: () => void;
  onDeleteExercise: () => void;
}
