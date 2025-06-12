
import React, { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Essential lazy loading components
export const LazyTrainingExerciseSelector = lazy(() => 
  import('@/components/training/TrainingExerciseSelector').then(module => ({
    default: module.TrainingExerciseSelector
  }))
);

export const LazyVirtualizedExerciseList = lazy(() => 
  import('@/components/exercises/VirtualizedExerciseList').then(module => ({
    default: module.VirtualizedExerciseList
  }))
);

// Optimized suspense wrapper
interface SuspenseWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  minHeight?: number;
}

export const SuspenseWrapper: React.FC<SuspenseWrapperProps> = ({ 
  children, 
  fallback,
  minHeight = 200 
}) => {
  const defaultFallback = (
    <div className="space-y-4 p-4" style={{ minHeight }}>
      <Skeleton className="h-8 w-3/4 bg-gray-800" />
      <Skeleton className="h-6 w-full bg-gray-800" />
      <div className="grid grid-cols-2 gap-4 mt-6">
        <Skeleton className="h-32 bg-gray-800 rounded-lg" />
        <Skeleton className="h-32 bg-gray-800 rounded-lg" />
      </div>
    </div>
  );

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};

// Preload critical components
export const preloadCriticalComponents = () => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      import('@/components/training/TrainingExerciseSelector');
    });
  } else {
    setTimeout(() => {
      import('@/components/training/TrainingExerciseSelector');
    }, 2000);
  }
};
