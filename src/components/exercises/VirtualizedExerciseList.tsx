
import React from 'react';
import { Exercise } from '@/types/exercise';
import { ExerciseListVirtualizer } from './ExerciseListVirtualizer';
import { ExerciseListEmpty } from './ExerciseListEmpty';

interface VirtualizedExerciseListProps {
  exercises: Exercise[];
  variant?: 'library-manage' | 'workout-add';
  onAdd?: (exercise: Exercise) => void;
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exercise: Exercise) => void;
  onViewDetails?: (exercise: Exercise) => void;
  onDuplicate?: (exercise: Exercise) => void;
  onHover?: (exercise: Exercise) => void;
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
  searchTerm?: string;
  hasFilters?: boolean;
  onAddExercise?: () => void;
  onClearFilters?: () => void;
}

export const VirtualizedExerciseList: React.FC<VirtualizedExerciseListProps> = ({
  exercises,
  variant = 'library-manage',
  onAdd,
  onEdit,
  onDelete,
  onViewDetails,
  onDuplicate,
  onHover,
  itemHeight = 120,
  containerHeight = 600,
  overscan = 5,
  searchTerm,
  hasFilters,
  onAddExercise,
  onClearFilters
}) => {
  // Show empty state if no exercises
  if (exercises.length === 0) {
    return (
      <ExerciseListEmpty
        variant={variant}
        searchTerm={searchTerm}
        hasFilters={hasFilters}
        onAddExercise={onAddExercise}
        onClearFilters={onClearFilters}
      />
    );
  }

  // Render virtualized list
  return (
    <ExerciseListVirtualizer
      exercises={exercises}
      variant={variant}
      itemHeight={itemHeight}
      containerHeight={containerHeight}
      overscan={overscan}
      onAdd={onAdd}
      onEdit={onEdit}
      onDelete={onDelete}
      onViewDetails={onViewDetails}
      onDuplicate={onDuplicate}
      onHover={onHover}
    />
  );
};
