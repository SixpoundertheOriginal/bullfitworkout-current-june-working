
import React from 'react';
import { Exercise } from '@/types/exercise';
import { CommonExerciseCard } from './CommonExerciseCard';
import { Skeleton } from '@/components/ui/skeleton';
import { useLazyLoading } from '@/hooks/useLazyLoading';
import { useNetworkStatus } from '@/utils/serviceWorker';

interface LazyExerciseCardProps {
  exercise: Exercise;
  variant?: 'library-manage' | 'workout-add';
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onViewDetails?: () => void;
  onDuplicate?: () => void;
}

export const LazyExerciseCard: React.FC<LazyExerciseCardProps> = ({
  exercise,
  variant = 'library-manage',
  ...handlers
}) => {
  const { elementRef, shouldLoad } = useLazyLoading({
    rootMargin: '200px',
    threshold: 0.1
  });
  const isOnline = useNetworkStatus();

  if (!shouldLoad) {
    return (
      <div ref={elementRef as React.RefObject<HTMLDivElement>} className="mb-4">
        <ExerciseCardSkeleton />
      </div>
    );
  }

  return (
    <div ref={elementRef as React.RefObject<HTMLDivElement>} className="mb-4">
      <CommonExerciseCard
        exercise={exercise}
        variant={variant}
        {...handlers}
      />
      {!isOnline && (
        <div className="mt-2 text-xs text-amber-400 bg-amber-900/20 px-2 py-1 rounded">
          Offline - Some features may be limited
        </div>
      )}
    </div>
  );
};

export const ExerciseCardSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
      <div className="flex flex-col gap-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Skeleton className="h-5 w-3/4 bg-gray-800 mb-2" />
            <Skeleton className="h-4 w-full bg-gray-800 mb-1" />
            <Skeleton className="h-4 w-2/3 bg-gray-800" />
          </div>
          <Skeleton className="h-8 w-8 bg-gray-800 rounded" />
        </div>
        
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 bg-gray-800 rounded-full" />
          <Skeleton className="h-6 w-20 bg-gray-800 rounded-full" />
          <Skeleton className="h-6 w-14 bg-gray-800 rounded-full" />
        </div>
        
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 bg-gray-800 rounded" />
          <Skeleton className="h-8 w-16 bg-gray-800 rounded" />
        </div>
      </div>
    </div>
  );
};
