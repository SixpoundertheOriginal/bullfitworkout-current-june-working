
import React from 'react';
import { Exercise } from '@/types/exercise';
import { useVirtualizedList } from '@/hooks/useVirtualizedList';
import { useExerciseListPerformance } from '@/hooks/useExerciseListPerformance';
import { ExerciseListItem } from './ExerciseListItem';

interface ExerciseListVirtualizerProps {
  exercises: Exercise[];
  variant: 'library-manage' | 'workout-add';
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  onAdd?: (exercise: Exercise) => void;
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exercise: Exercise) => void;
  onViewDetails?: (exercise: Exercise) => void;
  onDuplicate?: (exercise: Exercise) => void;
  onHover?: (exercise: Exercise) => void;
}

export const ExerciseListVirtualizer: React.FC<ExerciseListVirtualizerProps> = ({
  exercises,
  variant,
  itemHeight,
  containerHeight,
  overscan = 5,
  onAdd,
  onEdit,
  onDelete,
  onViewDetails,
  onDuplicate,
  onHover
}) => {
  const {
    visibleItems,
    startIndex,
    totalHeight,
    containerRef,
    handleScroll
  } = useVirtualizedList({
    items: exercises,
    itemHeight,
    containerHeight,
    overscan
  });

  const {
    getCardForExercise,
    handleItemHover
  } = useExerciseListPerformance({
    exercises,
    onHover
  });

  return (
    <div 
      ref={containerRef}
      className="overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${startIndex * itemHeight}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((exercise, index) => {
            // Ensure card is allocated for performance tracking
            getCardForExercise(exercise);
            
            return (
              <ExerciseListItem
                key={exercise.id}
                exercise={exercise}
                variant={variant}
                itemHeight={itemHeight}
                onAdd={onAdd}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewDetails={onViewDetails}
                onDuplicate={onDuplicate}
                onHover={handleItemHover}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
