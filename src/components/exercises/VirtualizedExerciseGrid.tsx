import React, { useCallback, useMemo } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { Exercise } from '@/types/exercise';
import { Skeleton } from '@/components/ui/skeleton';
import { UnifiedExerciseCard } from './UnifiedExerciseCard';
import { useVirtualizedGrid } from '@/hooks/useVirtualizedGrid';

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
  const { containerRef, gridDimensions, gridConfig } = useVirtualizedGrid({
    items: exercises || [],
    className
  });

  const { columnCount, rowCount, shouldUseVirtualization } = gridDimensions;

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
          padding: gridConfig.gap / 2,
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
          />
        </div>
      </div>
    );
  }, [exercises, columnCount, onSelectExercise, onEditExercise, onDeleteExercise, gridConfig.gap]);

  if (isLoading) {
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

  // Use regular CSS Grid for smaller lists
  if (!shouldUseVirtualization || columnCount === 0 || rowCount === 0) {
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
          />
        ))}
      </div>
    );
  }

  // Use virtualized grid for large lists
  return (
    <div ref={containerRef} className={`w-full h-full ${className}`}>
      <Grid
        columnCount={columnCount}
        rowCount={rowCount}
        width={gridDimensions.containerSize.width}
        height={gridDimensions.containerSize.height}
        columnWidth={gridConfig.itemWidth + gridConfig.gap}
        rowHeight={gridConfig.itemHeight + gridConfig.gap}
        itemData={{ exercises, onSelectExercise }}
        className="scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-gray-700"
      >
        {Cell}
      </Grid>
    </div>
  );
});

VirtualizedExerciseGrid.displayName = 'VirtualizedExerciseGrid';
