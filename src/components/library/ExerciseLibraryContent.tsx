
import React from 'react';
import { Exercise } from '@/types/exercise';
import { VirtualizedExerciseGrid } from '@/components/exercises/VirtualizedExerciseGrid';
import { Skeleton } from '@/components/ui/skeleton';

interface ExerciseLibraryContentProps {
  exercises: Exercise[];
  isLoading: boolean;
  onSelectExercise: (exercise: Exercise) => void;
  onEditExercise: (exercise: Exercise) => void;
  onDeleteExercise: (exercise: Exercise) => void;
  className?: string;
}

export const ExerciseLibraryContent: React.FC<ExerciseLibraryContentProps> = ({
  exercises,
  isLoading,
  onSelectExercise,
  onEditExercise,
  onDeleteExercise,
  className = ""
}) => {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (exercises.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className={`flex-1 min-h-0 ${className}`}>
      <VirtualizedExerciseGrid
        exercises={exercises}
        isLoading={isLoading}
        onSelectExercise={onSelectExercise}
        onEditExercise={onEditExercise}
        onDeleteExercise={onDeleteExercise}
        className="h-full"
      />
    </div>
  );
};

const LoadingSkeleton: React.FC = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <Skeleton className="h-5 w-3/4 bg-gray-800 mb-2" />
            <Skeleton className="h-4 w-full bg-gray-800 mb-1" />
            <Skeleton className="h-4 w-2/3 bg-gray-800" />
          </div>
          <Skeleton className="h-8 w-20 bg-gray-800 rounded" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 bg-gray-800 rounded-full" />
          <Skeleton className="h-6 w-20 bg-gray-800 rounded-full" />
          <Skeleton className="h-6 w-14 bg-gray-800 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

const EmptyState: React.FC = () => (
  <div className="text-center py-12 text-gray-400">
    <div className="w-16 h-16 mx-auto mb-4 bg-gray-800 rounded-full flex items-center justify-center">
      <div className="w-8 h-8 bg-gray-700 rounded"></div>
    </div>
    <h3 className="text-xl font-semibold mb-2">No exercises found</h3>
    <p className="text-gray-500 mb-4">
      Try adjusting your search terms or filters to find exercises.
    </p>
  </div>
);
