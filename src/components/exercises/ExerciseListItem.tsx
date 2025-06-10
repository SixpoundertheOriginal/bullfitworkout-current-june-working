
import React from 'react';
import { Exercise } from '@/types/exercise';
import { LazyExerciseCard } from './LazyExerciseCard';

interface ExerciseListItemProps {
  exercise: Exercise;
  variant: 'library-manage' | 'workout-add';
  itemHeight: number;
  onAdd?: (exercise: Exercise) => void;
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exercise: Exercise) => void;
  onViewDetails?: (exercise: Exercise) => void;
  onDuplicate?: (exercise: Exercise) => void;
  onHover?: (exercise: Exercise) => void;
}

export const ExerciseListItem: React.FC<ExerciseListItemProps> = React.memo(({
  exercise,
  variant,
  itemHeight,
  onAdd,
  onEdit,
  onDelete,
  onViewDetails,
  onDuplicate,
  onHover
}) => {
  const handleItemHover = React.useCallback(() => {
    onHover?.(exercise);
  }, [exercise, onHover]);

  return (
    <div
      style={{
        height: itemHeight,
        display: 'flex',
        alignItems: 'stretch'
      }}
      onMouseEnter={handleItemHover}
      className="transform-gpu will-change-transform"
    >
      <LazyExerciseCard
        exercise={exercise}
        variant={variant}
        onAdd={onAdd ? () => onAdd(exercise) : undefined}
        onEdit={onEdit ? () => onEdit(exercise) : undefined}
        onDelete={onDelete ? () => onDelete(exercise) : undefined}
        onViewDetails={onViewDetails ? () => onViewDetails(exercise) : undefined}
        onDuplicate={onDuplicate ? () => onDuplicate(exercise) : undefined}
      />
    </div>
  );
});

ExerciseListItem.displayName = 'ExerciseListItem';
