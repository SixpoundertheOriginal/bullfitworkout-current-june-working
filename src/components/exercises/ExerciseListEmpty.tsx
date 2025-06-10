
import React from 'react';
import { ExerciseEmptyState } from './ExerciseEmptyState';

interface ExerciseListEmptyProps {
  variant?: 'library-manage' | 'workout-add';
  searchTerm?: string;
  hasFilters?: boolean;
  onAddExercise?: () => void;
  onClearFilters?: () => void;
}

export const ExerciseListEmpty: React.FC<ExerciseListEmptyProps> = ({
  variant = 'library-manage',
  searchTerm,
  hasFilters,
  onAddExercise,
  onClearFilters
}) => {
  const getEmptyStateType = () => {
    if (searchTerm || hasFilters) {
      return 'no-results';
    }
    return 'no-exercises';
  };

  return (
    <div className="flex items-center justify-center h-64">
      <ExerciseEmptyState
        type={getEmptyStateType()}
        searchTerm={searchTerm}
        onAddExercise={onAddExercise}
        onClearFilters={hasFilters ? onClearFilters : undefined}
        className="border-dashed border-2 border-muted"
      />
    </div>
  );
};
