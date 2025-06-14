
import { useState } from 'react';
import { ExerciseSet } from '@/types/exercise';

interface EnhancedExercise {
  id: string;
  name: string;
  sets: ExerciseSet[];
}

export const useEnhancedExerciseTracker = (exerciseName: string) => {
  const [exercise, setExercise] = useState<EnhancedExercise>({
    id: `exercise-${exerciseName}`,
    name: exerciseName,
    sets: [
      {
        id: `${exerciseName}-1`,
        weight: 0,
        reps: 0,
        duration: '0:00',
        completed: false,
        volume: 0,
        restTime: 60,
        isEditing: false
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
          id: `${exerciseName}-${prev.sets.length + 1}`,
          weight: 0,
          reps: 0,
          duration: '0:00',
          completed: false,
          volume: 0,
          restTime: 60,
          isEditing: false
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
