import { useCallback } from 'react';
import { ExerciseSet } from '@/types/exercise';

interface UseExerciseSetOperationsProps {
  exerciseName: string;
  sets: ExerciseSet[];
  onUpdateSet: (setIndex: number, updates: Partial<ExerciseSet>) => void;
  onToggleCompletion: (setIndex: number) => void;
  onDeleteSet: (setIndex: number) => void;
}

export const useExerciseSetOperations = ({
  exerciseName,
  sets,
  onUpdateSet,
  onToggleCompletion,
  onDeleteSet
}: UseExerciseSetOperationsProps) => {
  
  // Safe set update with validation
  const handleSetUpdate = useCallback((setIndex: number, field: string, value: string) => {
    const currentSet = sets[setIndex];
    if (!currentSet) return;

    const numValue = parseFloat(value);
    
    // Prevent NaN and negative values - keep current value if invalid
    if (isNaN(numValue) || numValue < 0) {
      console.warn(`Invalid value for ${field}: ${value}. Keeping current value.`);
      return;
    }

    const updates: Partial<ExerciseSet> = {};
    
    if (field === 'weight') {
      updates.weight = numValue;
      // Recalculate volume immediately
      updates.volume = numValue * currentSet.reps;
    } else if (field === 'reps') {
      updates.reps = Math.floor(numValue);
      // Recalculate volume immediately
      updates.volume = currentSet.weight * Math.floor(numValue);
    }

    console.log(`Updating set ${setIndex} ${field} to ${numValue}`, updates);
    onUpdateSet(setIndex, updates);
  }, [sets, onUpdateSet]);

  // Enhanced completion handler with proper event management
  const handleSetCompletion = useCallback((setIndex: number, e?: React.MouseEvent) => {
    if (e) {
      // Check if the click originated from an input or button
      const target = e.target as HTMLElement;
      const isInteractiveElement = target.tagName === 'INPUT' || 
                                  target.tagName === 'BUTTON' ||
                                  target.closest('button') ||
                                  target.closest('input');
      
      if (isInteractiveElement) {
        console.log('Completion blocked - interactive element clicked');
        return;
      }
    }

    console.log(`Toggling completion for set ${setIndex}`);
    onToggleCompletion(setIndex);
  }, [onToggleCompletion]);

  // Safe delete with validation
  const handleSetDelete = useCallback((setIndex: number) => {
    const currentSet = sets[setIndex];
    if (!currentSet) {
      console.warn(`Cannot delete set ${setIndex} - set not found`);
      return;
    }

    console.log(`Deleting set ${setIndex} for ${exerciseName}`);
    onDeleteSet(setIndex);
  }, [sets, exerciseName, onDeleteSet]);

  return {
    handleSetUpdate,
    handleSetCompletion,
    handleSetDelete
  };
};
