
import { useCallback, useState } from 'react';
import { Exercise } from '@/types/exercise';

export interface ExerciseCardActions {
  onSelectExercise?: (exercise: Exercise) => void;
  onAdd?: (exercise: Exercise) => void;
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exercise: Exercise) => void;
  onFavorite?: (exercise: Exercise) => void;
  onView?: (exercise: Exercise) => void;
}

export interface UseExerciseCardActionsOptions {
  exercise: Exercise;
  actions: ExerciseCardActions;
  context?: 'library' | 'selection' | 'workout';
}

export const useExerciseCardActions = ({
  exercise,
  actions,
  context = 'library'
}: UseExerciseCardActionsOptions) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovered(false);
  }, []);

  const handleSelect = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    actions.onSelectExercise?.(exercise);
  }, [actions.onSelectExercise, exercise]);

  const handleAdd = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    actions.onAdd?.(exercise);
  }, [actions.onAdd, exercise]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    actions.onEdit?.(exercise);
  }, [actions.onEdit, exercise]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    actions.onDelete?.(exercise);
  }, [actions.onDelete, exercise]);

  const handleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorited(prev => !prev);
    actions.onFavorite?.(exercise);
  }, [actions.onFavorite, exercise]);

  const handleView = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    actions.onView?.(exercise);
  }, [actions.onView, exercise]);

  const handleCardClick = useCallback(() => {
    if (context === 'selection' && actions.onAdd) {
      actions.onAdd(exercise);
    } else if (actions.onSelectExercise) {
      actions.onSelectExercise(exercise);
    }
  }, [context, actions.onAdd, actions.onSelectExercise, exercise]);

  return {
    isHovered,
    isFavorited,
    setIsFavorited,
    handlers: {
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onSelect: handleSelect,
      onAdd: handleAdd,
      onEdit: handleEdit,
      onDelete: handleDelete,
      onFavorite: handleFavorite,
      onView: handleView,
      onCardClick: handleCardClick
    }
  };
};
