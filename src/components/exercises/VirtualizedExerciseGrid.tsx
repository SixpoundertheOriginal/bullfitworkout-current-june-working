
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { Exercise } from '@/types/exercise';
import { CommonExerciseCard } from './CommonExerciseCard';
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
  
  // Grid configuration - optimized for performance
  const itemWidth = 320;
  const itemHeight = 200;
  const gap = 16;

  // Add debug logging for exercise data
  console.log('VirtualizedExerciseGrid received exercises:', exercises?.length || 0);

  // Set initial dimensions based on viewport to avoid waiting for ResizeObserver
  useEffect(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        console.log('Initial container dimensions:', rect.width, 'x', rect.height);
        setContainerSize({ width: rect.width, height: rect.height });
      } else {
        // Fallback to viewport dimensions if container isn't measured yet
        const fallbackWidth = Math.min(window.innerWidth - 64, 1200); // Account for padding
        const fallbackHeight = Math.max(600, window.innerHeight - 200); // Account for header/nav
        console.log('Using fallback dimensions:', fallbackWidth, 'x', fallbackHeight);
        setContainerSize({ width: fallbackWidth, height: fallbackHeight });
      }
    }
  }, []);

  // Calculate grid dimensions with proper fallbacks and better error handling
  const { columnCount, rowCount, shouldUseVirtualization } = useMemo(() => {
    console.log('Calculating grid dimensions with containerSize:', containerSize);
    
    if (!exercises?.length) {
      console.log('No exercises to display');
      return { columnCount: 1, rowCount: 0, shouldUseVirtualization: false };
    }
    
    // Use minimum dimensions if container size is not available
    const width = Math.max(containerSize.width, 320); // At least one column
    const height = Math.max(containerSize.height, 400); // Minimum height
    
    const availableWidth = width - gap;
    const columns = Math.max(1, Math.floor(availableWidth / (itemWidth + gap)));
    const rows = Math.ceil(exercises.length / columns);
    
    // Only use virtualization for large lists to avoid complexity with small lists
    const useVirtualization = exercises.length > 20 && height > 0 && width > 0;
    
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

  // Resize observer for responsive grid - with better error handling
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

  // Optimized grid cell renderer with proper typing
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
          <CommonExerciseCard
            exercise={exercise}
            variant="library-manage"
            onViewDetails={() => onSelectExercise?.(exercise)}
            onEdit={() => onEditExercise?.(exercise)}
            onDelete={() => onDeleteExercise?.(exercise)}
          />
        </div>
      </div>
    );
  }, [exercises, columnCount, onSelectExercise, onEditExercise, onDeleteExercise, gap]);

  if (isLoading) {
    console.log('Showing loading skeleton');
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-48 bg-gray-800/50 rounded-lg" />
        ))}
      </div>
    );
  }

  if (!exercises?.length) {
    console.log('No exercises found, showing empty state');
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-gray-400 space-y-2">
          <p className="text-lg font-medium">No exercises found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      </div>
    );
  }

  // For small lists or when virtualization is problematic, use regular CSS Grid
  if (!shouldUseVirtualization || columnCount === 0 || rowCount === 0) {
    console.log('Using fallback CSS Grid rendering for', exercises.length, 'exercises');
    return (
      <div ref={containerRef} className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
        {exercises.map((exercise) => (
          <div key={exercise.id} className="h-48">
            <CommonExerciseCard
              exercise={exercise}
              variant="library-manage"
              onViewDetails={() => onSelectExercise?.(exercise)}
              onEdit={() => onEditExercise?.(exercise)}
              onDelete={() => onDeleteExercise?.(exercise)}
            />
          </div>
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
        itemData={{ exercises, onSelectExercise, onEditExercise, onDeleteExercise }}
        className="scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-gray-700"
      >
        {Cell}
      </Grid>
    </div>
  );
});

VirtualizedExerciseGrid.displayName = 'VirtualizedExerciseGrid';
