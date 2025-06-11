
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
  hasFilters = false,
  onAddExercise,
  onClearFilters
}) => {
  return (
    <div className="flex items-center justify-center h-64">
      <ExerciseEmptyState
        hasFilters={hasFilters || !!searchTerm}
        onClearFilters={onClearFilters || (() => {})}
        onCreateExercise={onAddExercise}
        showCreateButton={!!onAddExercise}
      />
    </div>
  );
};
