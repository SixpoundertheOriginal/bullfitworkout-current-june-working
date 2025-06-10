
import { useCallback } from 'react';

interface ExerciseSet {
  id: number;
  weight: number;
  reps: number;
  duration: string;
  completed: boolean;
  volume: number;
}

interface UseExerciseTrackerActionsProps {
  onUpdateSet: (setId: number, updates: Partial<ExerciseSet>) => void;
  onToggleCompletion: (setId: number) => void;
  onAddSet: () => void;
  onDeleteSet: (setId: number) => void;
  onDeleteExercise?: (exerciseName: string) => void;
  exerciseName: string;
  sets: ExerciseSet[];
}

export const useExerciseTrackerActions = ({
  onUpdateSet,
  onToggleCompletion,
  onAddSet,
  onDeleteSet,
  onDeleteExercise,
  exerciseName,
  sets
}: UseExerciseTrackerActionsProps) => {
  
  const handleSetUpdate = useCallback((setId: number, field: string, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return;

    const updates: Partial<ExerciseSet> = {};
    if (field === 'weight') {
      updates.weight = numValue;
    } else if (field === 'reps') {
      updates.reps = Math.floor(numValue);
    }

    // Recalculate volume
    const set = sets.find(s => s.id === setId);
    if (set) {
      const newWeight = updates.weight ?? set.weight;
      const newReps = updates.reps ?? set.reps;
      updates.volume = newWeight * newReps;
    }

    onUpdateSet(setId, updates);
  }, [onUpdateSet, sets]);

  const handleSetDoubleClick = useCallback((setId: number, e: React.MouseEvent) => {
    // Prevent double-click if clicking on input or button
    if ((e.target as HTMLElement).tagName === 'INPUT' || 
        (e.target as HTMLElement).tagName === 'BUTTON' ||
        (e.target as HTMLElement).closest('button')) {
      return;
    }
    onToggleCompletion(setId);
  }, [onToggleCompletion]);

  const handleDeleteExercise = useCallback(() => {
    if (onDeleteExercise) {
      onDeleteExercise(exerciseName);
    }
  }, [onDeleteExercise, exerciseName]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent, callback: () => void) => {
    if (e.key === 'Enter') {
      callback();
    } else if (e.key === 'Escape') {
      // Handle escape in the calling component
    }
  }, []);

  return {
    handleSetUpdate,
    handleSetDoubleClick,
    handleDeleteExercise,
    handleKeyPress,
    handleAddSet: onAddSet,
    handleDeleteSet: onDeleteSet
  };
};
