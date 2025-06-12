
import { useState } from 'react';
import { ExerciseSet } from '@/types/exercise';

interface EnhancedExercise {
  name: string;
  sets: ExerciseSet[];
}

export const useEnhancedExerciseTracker = (exerciseName: string) => {
  const [exercise, setExercise] = useState<EnhancedExercise>({
    name: exerciseName,
    sets: [
      {
        id: 1,
        weight: 0,
        reps: 0,
        duration: '0',
        completed: false,
        volume: 0
      }
    ]
  });
  const [isActive, setIsActive] = useState(false);

  const onUpdateSet = (setIndex: number, updates: Partial<ExerciseSet>) => {
    setExercise(prev => ({
      ...prev,
      sets: prev.sets.map((set, index) => 
        index === setIndex ? { ...set, ...updates } : set
      )
    }));
  };

  const onToggleCompletion = (setIndex: number) => {
    setExercise(prev => ({
      ...prev,
      sets: prev.sets.map((set, index) => 
        index === setIndex ? { ...set, completed: !set.completed } : set
      )
    }));
  };

  const onAddSet = () => {
    setExercise(prev => ({
      ...prev,
      sets: [
        ...prev.sets,
        {
          id: prev.sets.length + 1,
          weight: 0,
          reps: 0,
          duration: '0',
          completed: false,
          volume: 0
        }
      ]
    }));
  };

  const onDeleteSet = (setIndex: number) => {
    setExercise(prev => ({
      ...prev,
      sets: prev.sets.filter((_, index) => index !== setIndex)
    }));
  };

  const onSetActive = () => {
    setIsActive(true);
  };

  return {
    exercise,
    isActive,
    onUpdateSet,
    onToggleCompletion,
    onAddSet,
    onDeleteSet,
    onSetActive
  };
};
