import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Exercise } from '@/types/exercise';
import { LazyExerciseCard } from './LazyExerciseCard';
import { exerciseCardPool } from '@/services/exerciseCardPool';
import { useCleanup } from '@/hooks/useCleanup';

interface VirtualizedExerciseListProps {
  exercises: Exercise[];
  variant?: 'library-manage' | 'workout-add';
  onAdd?: (exercise: Exercise) => void;
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exercise: Exercise) => void;
  onViewDetails?: (exercise: Exercise) => void;
  onDuplicate?: (exercise: Exercise) => void;
  onHover?: (exercise: Exercise) => void;
  itemHeight?: number;
  containerHeight?: number;
  overscan?: number;
}

export const VirtualizedExerciseList: React.FC<VirtualizedExerciseListProps> = ({
  exercises,
  variant = 'library-manage',
  onAdd,
  onEdit,
  onDelete,
  onViewDetails,
  onDuplicate,
  onHover,
  itemHeight = 120,
  containerHeight = 600,
  overscan = 5
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const pooledCards = useRef<Map<string, string>>(new Map());
  const { registerCleanup } = useCleanup('virtualized-exercise-list');

  const totalHeight = exercises.length * itemHeight;
  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    exercises.length
  );

  // Add overscan
  const startIndex = Math.max(0, visibleStart - overscan);
  const endIndex = Math.min(exercises.length, visibleEnd + overscan);
  const visibleExercises = exercises.slice(startIndex, endIndex);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  // Register cleanup for pooled cards
  useEffect(() => {
    registerCleanup(() => {
      // Release all pooled cards when component unmounts
      pooledCards.current.forEach((cardId) => {
        exerciseCardPool.releaseCard(cardId);
      });
      pooledCards.current.clear();
    });
  }, [registerCleanup]);

  // Clean up pooled cards when exercises change
  useEffect(() => {
    return () => {
      // Release all pooled cards when exercises change
      pooledCards.current.forEach((cardId) => {
        exerciseCardPool.releaseCard(cardId);
      });
      pooledCards.current.clear();
    };
  }, [exercises]);

  const getCardForExercise = useCallback((exercise: Exercise) => {
    let cardId = pooledCards.current.get(exercise.id);
    
    if (!cardId) {
      const pooledCard = exerciseCardPool.getCard();
      if (pooledCard) {
        cardId = pooledCard.id;
        pooledCards.current.set(exercise.id, cardId);
      }
    }
    
    return cardId;
  }, []);

  const releaseCardForExercise = useCallback((exerciseId: string) => {
    const cardId = pooledCards.current.get(exerciseId);
    if (cardId) {
      exerciseCardPool.releaseCard(cardId);
      pooledCards.current.delete(exerciseId);
    }
  }, []);

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
          {visibleExercises.map((exercise, index) => {
            const actualIndex = startIndex + index;
            getCardForExercise(exercise); // Ensure card is allocated
            
            return (
              <div
                key={exercise.id}
                style={{
                  height: itemHeight,
                  display: 'flex',
                  alignItems: 'stretch'
                }}
                onMouseEnter={() => onHover?.(exercise)}
              >
                <LazyExerciseCard
                  exercise={exercise}
                  variant={variant}
                  onAdd={onAdd ? () => onAdd(exercise) : undefined}
                  onEdit={onEdit ? () => onEdit(exercise) : undefined}
                  onDelete={onDelete ? () => onDelete(exercise) : undefined}
                  onViewDetails={onViewDetails ? () => onViewDetails(exercise) : undefined}
                  onDuplicate={onDuplicate ? () => onDuplicate(exercise) : undefined}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
