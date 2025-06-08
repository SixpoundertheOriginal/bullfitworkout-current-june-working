
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
  
  // Grid configuration
  const itemWidth = 320;
  const itemHeight = 180;
  const gap = 16;

  // Calculate grid dimensions
  const { columnCount, rowCount } = useMemo(() => {
    if (!containerSize.width || !exercises.length) return { columnCount: 1, rowCount: 0 };
    
    const availableWidth = containerSize.width - gap;
    const columns = Math.max(1, Math.floor(availableWidth / (itemWidth + gap)));
    const rows = Math.ceil(exercises.length / columns);
    
    return { columnCount: columns, rowCount: rows };
  }, [containerSize.width, exercises.length]);

  // Resize observer for responsive grid
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      setContainerSize({ width, height });
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Grid cell renderer
  const Cell = useCallback(({ columnIndex, rowIndex, style }: any) => {
    const exerciseIndex = rowIndex * columnCount + columnIndex;
    const exercise = exercises[exerciseIndex];

    if (!exercise) return null;

    return (
      <div
        style={{
          ...style,
          padding: gap / 2,
        }}
      >
        <CommonExerciseCard
          exercise={exercise}
          variant="library-manage"
          onViewDetails={() => onSelectExercise?.(exercise)}
          onEdit={() => onEditExercise?.(exercise)}
          onDelete={() => onDeleteExercise?.(exercise)}
          className="h-full"
        />
      </div>
    );
  }, [exercises, columnCount, onSelectExercise, onEditExercise, onDeleteExercise]);

  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-44 bg-gray-800" />
        ))}
      </div>
    );
  }

  if (!exercises.length) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-lg mb-2">No exercises found</p>
        <p className="text-sm">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`w-full h-full ${className}`}>
      {containerSize.width > 0 && (
        <Grid
          columnCount={columnCount}
          rowCount={rowCount}
          width={containerSize.width}
          height={containerSize.height}
          columnWidth={itemWidth + gap}
          rowHeight={itemHeight + gap}
          itemData={{ exercises, onSelectExercise, onEditExercise, onDeleteExercise }}
        >
          {Cell}
        </Grid>
      )}
    </div>
  );
});

VirtualizedExerciseGrid.displayName = 'VirtualizedExerciseGrid';
