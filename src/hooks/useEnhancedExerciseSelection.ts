
import { useCallback } from 'react';
import { Exercise } from '@/types/exercise';
import { useExerciseSelection } from '@/contexts/ExerciseSelectionContext';

export interface UseEnhancedExerciseSelectionOptions {
  onSelectionComplete?: (exercises: Exercise[]) => void;
  maxSelections?: number;
  allowDuplicates?: boolean;
}

export const useEnhancedExerciseSelection = ({
  onSelectionComplete,
  maxSelections,
  allowDuplicates = false
}: UseEnhancedExerciseSelectionOptions = {}) => {
  const {
    selectedExercises,
    addExercise,
    removeExercise,
    clearSelection,
    isSelected,
    selectionMode,
    setSelectionMode
  } = useExerciseSelection();

  const handleSelectExercise = useCallback((exercise: Exercise) => {
    if (selectionMode === 'single') {
      addExercise(exercise);
      onSelectionComplete?.([exercise]);
    } else {
      // Multiple selection mode
      if (isSelected(exercise.id)) {
        removeExercise(exercise.id);
      } else {
        // Check max selections limit
        if (maxSelections && selectedExercises.length >= maxSelections) {
          return; // Don't add more than max allowed
        }
        
        // Check duplicates
        if (!allowDuplicates && selectedExercises.some(e => e.id === exercise.id)) {
          return;
        }
        
        addExercise(exercise);
      }
    }
  }, [
    selectionMode,
    addExercise,
    onSelectionComplete,
    isSelected,
    removeExercise,
    maxSelections,
    selectedExercises,
    allowDuplicates
  ]);

  const handleCompleteSelection = useCallback(() => {
    onSelectionComplete?.(selectedExercises);
    clearSelection();
  }, [onSelectionComplete, selectedExercises, clearSelection]);

  const canSelectMore = useCallback(() => {
    if (!maxSelections) return true;
    return selectedExercises.length < maxSelections;
  }, [maxSelections, selectedExercises.length]);

  return {
    selectedExercises,
    selectionMode,
    setSelectionMode,
    handleSelectExercise,
    handleCompleteSelection,
    clearSelection,
    isSelected,
    canSelectMore: canSelectMore(),
    selectionCount: selectedExercises.length
  };
};
