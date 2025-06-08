import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { Exercise } from '@/types/exercise';
import { Skeleton } from '@/components/ui/skeleton';

interface VirtualizedExerciseGridProps {
  exercises: Exercise[];
  onSelectExercise?: (exercise: Exercise) => void;
  onEditExercise?: (exercise: Exercise) => void;
  onDeleteExercise?: (exercise: Exercise) => void;
  isLoading?: boolean;
  className?: string;
}

export const VirtualizedExerciseGrid: React.FC<VirtualizedExerciseGridProps> = React.memo(({
  exercises,
  onSelectExercise,
  onEditExercise,
  onDeleteExercise,
  isLoading = false,
  className = ""
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  
  // Enhanced grid configuration for premium layout
  const itemWidth = 340;
  const itemHeight = 220;
  const gap = 20;

  console.log('VirtualizedExerciseGrid received exercises:', exercises?.length || 0);

  // Set initial dimensions
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        console.log('Initial container dimensions:', rect.width, 'x', rect.height);
        setContainerSize({ width: rect.width, height: rect.height });
      } else {
        const fallbackWidth = Math.min(window.innerWidth - 64, 1200);
        const fallbackHeight = Math.max(600, window.innerHeight - 200);
        console.log('Using fallback dimensions:', fallbackWidth, 'x', fallbackHeight);
        setContainerSize({ width: fallbackWidth, height: fallbackHeight });
      }
    }
  }, []);

  // Calculate grid dimensions
  const { columnCount, rowCount, shouldUseVirtualization } = useMemo(() => {
    console.log('Calculating grid dimensions with containerSize:', containerSize);
    
    if (!exercises?.length) {
      console.log('No exercises to display');
      return { columnCount: 1, rowCount: 0, shouldUseVirtualization: false };
    }
    
    const width = Math.max(containerSize.width, 340);
    const height = Math.max(containerSize.height, 400);
    
    const availableWidth = width - gap;
    const columns = Math.max(1, Math.floor(availableWidth / (itemWidth + gap)));
    const rows = Math.ceil(exercises.length / columns);
    
    const useVirtualization = exercises.length > 12 && height > 0 && width > 0;
    
    console.log('Grid calculation result:', { 
      columns, 
      rows, 
      exerciseCount: exercises.length, 
      useVirtualization,
      containerWidth: width,
      containerHeight: height
    });
    
    return { 
      columnCount: columns, 
      rowCount: rows, 
      shouldUseVirtualization: useVirtualization 
    };
  }, [containerSize.width, containerSize.height, exercises?.length]);

  // Resize observer
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      try {
        const { width, height } = entries[0].contentRect;
        console.log('ResizeObserver update:', width, 'x', height);
        if (width > 0 && height > 0) {
          setContainerSize({ width, height });
        }
      } catch (error) {
        console.error('ResizeObserver error:', error);
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Handle favorite toggle
  const handleFavorite = useCallback((exercise: Exercise) => {
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(exercise.id)) {
        next.delete(exercise.id);
      } else {
        next.add(exercise.id);
      }
      return next;
    });
  }, []);

  // Import the unified card
  const { UnifiedExerciseCard } = await import('./UnifiedExerciseCard');

  // Enhanced grid cell renderer using unified card
  const Cell = useCallback(({ columnIndex, rowIndex, style }: {
    columnIndex: number;
    rowIndex: number;
    style: React.CSSProperties;
  }) => {
    const exerciseIndex = rowIndex * columnCount + columnIndex;
    const exercise = exercises[exerciseIndex];

    if (!exercise) return null;

    return (
      <div
        style={{
          ...style,
          padding: gap / 2,
          width: style.width,
          height: style.height,
        }}
      >
        <div className="h-full">
          <UnifiedExerciseCard
            exercise={exercise}
            variant="premium"
            context="library"
            onSelectExercise={onSelectExercise}
            onEdit={onEditExercise}
            onDelete={onDeleteExercise}
            onFavorite={handleFavorite}
            isFavorited={favorites.has(exercise.id)}
          />
        </div>
      </div>
    );
  }, [exercises, columnCount, onSelectExercise, onEditExercise, onDeleteExercise, favorites, handleFavorite, gap]);

  if (isLoading) {
    console.log('Showing loading skeleton');
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 ${className}`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 animate-pulse">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4 bg-gray-800" />
                  <Skeleton className="h-4 w-full bg-gray-800" />
                  <Skeleton className="h-4 w-2/3 bg-gray-800" />
                </div>
                <Skeleton className="h-8 w-8 bg-gray-800 rounded" />
              </div>
              
              <div className="space-y-2">
                <Skeleton className="h-2 w-full bg-gray-800 rounded-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 bg-gray-800 rounded-full" />
                  <Skeleton className="h-6 w-20 bg-gray-800 rounded-full" />
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 flex-1 bg-gray-800 rounded" />
                <Skeleton className="h-8 flex-1 bg-gray-800 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!exercises?.length) {
    console.log('No exercises found, showing empty state');
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <div className="w-8 h-8 text-gray-600">📋</div>
        </div>
        <div className="text-gray-400 space-y-2">
          <p className="text-lg font-medium">No exercises found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  // Use regular CSS Grid for smaller lists with unified card
  if (!shouldUseVirtualization || columnCount === 0 || rowCount === 0) {
    console.log('Using fallback CSS Grid rendering for', exercises.length, 'exercises');
    return (
      <div ref={containerRef} className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 ${className}`}>
        {exercises.map((exercise) => (
          <UnifiedExerciseCard
            key={exercise.id}
            exercise={exercise}
            variant="premium"
            context="library"
            onSelectExercise={onSelectExercise}
            onEdit={onEditExercise}
            onDelete={onDeleteExercise}
            onFavorite={handleFavorite}
            isFavorited={favorites.has(exercise.id)}
          />
        ))}
      </div>
    );
  }

  // Use virtualized grid for large lists
  console.log('Using virtualized grid rendering');
  return (
    <div ref={containerRef} className={`w-full h-full ${className}`}>
      <Grid
        columnCount={columnCount}
        rowCount={rowCount}
        width={containerSize.width}
        height={containerSize.height}
        columnWidth={itemWidth + gap}
        rowHeight={itemHeight + gap}
        itemData={{ exercises, onSelectExercise, favorites, handleFavorite }}
        className="scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-gray-700"
      >
        {Cell}
      </Grid>
    </div>
  );
});

VirtualizedExerciseGrid.displayName = 'VirtualizedExerciseGrid';
