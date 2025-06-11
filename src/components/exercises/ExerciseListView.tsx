
import React from 'react';
import { Exercise } from '@/types/exercise';
import { VirtualizedExerciseGrid } from './VirtualizedExerciseGrid';
import { ExerciseEmptyState } from './ExerciseEmptyState';

interface ExerciseListViewProps {
  exercises: Exercise[];
  isLoading: boolean;
  hasFilters: boolean;
  onSelectExercise?: (exercise: Exercise) => void;
  onEditExercise?: (exercise: Exercise) => void;
  onDeleteExercise?: (exercise: Exercise) => void;
  onViewDetails?: (exercise: Exercise) => void;
  onDuplicate?: (exercise: Exercise) => void;
  onClearFilters: () => void;
  onCreateExercise?: () => void;
  showCreateButton?: boolean;
  className?: string;
}

export const ExerciseListView: React.FC<ExerciseListViewProps> = React.memo(({
  exercises,
  isLoading,
  hasFilters,
  onSelectExercise,
  onEditExercise,
  onDeleteExercise,
  onViewDetails,
  onDuplicate,
  onClearFilters,
  onCreateExercise,
  showCreateButton = false,
  className = ""
}) => {
  if (isLoading) {
    return (
      <div className={`flex-1 min-h-0 ${className}`}>
        <VirtualizedExerciseGrid
          exercises={[]}
          onSelectExercise={onSelectExercise}
          isLoading={true}
          className="h-full"
        />
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className={`flex-1 min-h-0 ${className}`}>
        <ExerciseEmptyState
          hasFilters={hasFilters}
          onClearFilters={onClearFilters}
          onCreateExercise={onCreateExercise}
          showCreateButton={showCreateButton}
        />
      </div>
    );
  }

  return (
    <div className={`flex-1 min-h-0 ${className}`}>
      <VirtualizedExerciseGrid
        exercises={exercises}
        onSelectExercise={onSelectExercise}
        onEditExercise={onEditExercise}
        onDeleteExercise={onDeleteExercise}
        isLoading={false}
        className="h-full"
      />
    </div>
  );
});

ExerciseListView.displayName = 'ExerciseListView';
