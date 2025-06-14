
import React from 'react';
import { Exercise } from "@/types/exercise";
import { ExerciseSelectionModal } from "@/components/exercises/ExerciseSelectionModal";

interface AddExerciseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectExercise: (exercise: Exercise) => void;
  trainingType?: string;
}

export const AddExerciseSheet: React.FC<AddExerciseSheetProps> = ({
  open,
  onOpenChange,
  onSelectExercise,
  trainingType = ""
}) => {
  return (
    <ExerciseSelectionModal
      open={open}
      onOpenChange={onOpenChange}
      onSelectExercise={onSelectExercise}
      trainingType={trainingType}
      title="Add an Exercise"
      selectionMode="single"
    />
  );
};
