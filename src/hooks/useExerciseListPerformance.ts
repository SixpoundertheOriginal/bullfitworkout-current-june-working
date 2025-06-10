
import { useCallback, useRef, useEffect } from 'react';
import { Exercise } from '@/types/exercise';
import { exerciseCardPool } from '@/services/exerciseCardPool';
import { useCleanup } from '@/hooks/useCleanup';

export interface ExerciseListPerformanceOptions {
  exercises: Exercise[];
  onHover?: (exercise: Exercise) => void;
}

export const useExerciseListPerformance = ({
  exercises,
  onHover
}: ExerciseListPerformanceOptions) => {
  const pooledCards = useRef<Map<string, string>>(new Map());
  const { registerCleanup } = useCleanup('exercise-list-performance');

  // Register cleanup for pooled cards
  useEffect(() => {
    registerCleanup(() => {
      pooledCards.current.forEach((cardId) => {
        exerciseCardPool.releaseCard(cardId);
      });
      pooledCards.current.clear();
    });
  }, [registerCleanup]);

  // Clean up pooled cards when exercises change
  useEffect(() => {
    return () => {
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

  const handleItemHover = useCallback((exercise: Exercise) => {
    onHover?.(exercise);
  }, [onHover]);

  return {
    getCardForExercise,
    releaseCardForExercise,
    handleItemHover
  };
};
