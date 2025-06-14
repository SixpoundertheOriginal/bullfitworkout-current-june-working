import React, { useCallback, useMemo } from 'react';
import { FixedSizeGrid as Grid } from 'react-window';
import { Exercise } from '@/types/exercise';
import { UnifiedExerciseCard } from './UnifiedExerciseCard';
import { SkeletonScreen } from '@/components/performance/SkeletonScreen';
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
  // Filter out exercises that are missing an ID to prevent runtime errors and satisfy type constraints.
  const validExercises = useMemo(() => 
    (exercises || []).filter((e): e is Exercise & { id: string } => !!e?.id), 
    [exercises]
  );

  const { containerRef, gridDimensions, gridConfig } = useVirtualizedGrid({
    items: validExercises,
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
    const exercise = validExercises[exerciseIndex];

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
  }, [validExercises, columnCount, onSelectExercise, onEditExercise, onDeleteExercise, gridConfig.gap]);

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 ${className}`}>
        <SkeletonScreen variant="exercise-card" count={8} />
      </div>
    );
  }

  if (!validExercises?.length) {
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
        {validExercises.map((exercise) => (
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
        itemData={{ exercises: validExercises, onSelectExercise }}
        className="scrollbar-thin scrollbar-track-gray-900 scrollbar-thumb-gray-700"
      >
        {Cell}
      </Grid>
    </div>
  );
});

VirtualizedExerciseGrid.displayName = 'VirtualizedExerciseGrid';
