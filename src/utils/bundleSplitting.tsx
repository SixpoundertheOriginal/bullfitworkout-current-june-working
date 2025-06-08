
import React, { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

// Bundle splitting with lazy loading for mobile performance
export const LazyTrainingExerciseSelector = lazy(() => 
  import('@/components/training/TrainingExerciseSelector').then(module => ({
    default: module.TrainingExerciseSelector
  }))
);

export const LazyLibraryExerciseManager = lazy(() => 
  import('@/components/library/LibraryExerciseManager').then(module => ({
    default: module.LibraryExerciseManager
  }))
);

export const LazyExerciseSearchInterface = lazy(() => 
  import('@/components/search/ExerciseSearchInterface').then(module => ({
    default: module.ExerciseSearchInterface
  }))
);

export const LazyVirtualizedExerciseList = lazy(() => 
  import('@/components/exercises/VirtualizedExerciseList').then(module => ({
    default: module.VirtualizedExerciseList
  }))
);

// High-performance suspense wrapper with optimized fallbacks
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
      <Skeleton className="h-6 w-2/3 bg-gray-800" />
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

// Performance-optimized component preloader
export const preloadComponent = (importFn: () => Promise<any>) => {
  const componentPromise = importFn();
  return () => componentPromise;
};

// Preload critical components for mobile
export const preloadCriticalComponents = () => {
  // Preload during idle time
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      preloadComponent(() => import('@/components/training/TrainingExerciseSelector'));
      preloadComponent(() => import('@/components/library/LibraryExerciseManager'));
    });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      preloadComponent(() => import('@/components/training/TrainingExerciseSelector'));
      preloadComponent(() => import('@/components/library/LibraryExerciseManager'));
    }, 2000);
  }
};
