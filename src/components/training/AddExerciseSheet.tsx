
import React from 'react';
import { Exercise } from "@/types/exercise";
import { ExerciseSelectionModal } from "@/components/exercises/ExerciseSelectionModal";

interface AddExerciseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectExercise: (exercise: string | Exercise) => void;
  trainingType?: string;
}

export const AddExerciseSheet: React.FC<AddExerciseSheetProps> = ({
  open,
  onOpenChange,
  onSelectExercise,
  trainingType = ""
}) => {
  const handleSelectExercise = (exercise: Exercise) => {
    onSelectExercise(exercise);
  };

  return (
    <ExerciseSelectionModal
      open={open}
      onOpenChange={onOpenChange}
      onSelectExercise={handleSelectExercise}
      trainingType={trainingType}
      title="Add an Exercise"
      selectionMode="single"
    />
  );
};
