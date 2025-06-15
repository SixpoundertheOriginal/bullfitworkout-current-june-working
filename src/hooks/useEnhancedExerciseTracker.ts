
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

  const onUpdateSet = (setId: string, updates: Partial<ExerciseSet>) => {
    setExercise(prev => ({
      ...prev,
      sets: prev.sets.map((set) => {
        if (set.id === setId) {
          const updatedSet = { ...set, ...updates };
          // Ensure volume is recalculated when weight or reps change
          if (updates.weight !== undefined || updates.reps !== undefined) {
            updatedSet.volume = updatedSet.weight * updatedSet.reps;
          }
          console.log(`Updated set ${setId}:`, updatedSet);
          return updatedSet;
        }
        return set;
      })
    }));
  };

  const onToggleCompletion = (setId: string) => {
    setExercise(prev => ({
      ...prev,
      sets: prev.sets.map((set) => 
        set.id === setId ? { ...set, completed: !set.completed } : set
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

  const onDeleteSet = (setId: string) => {
    setExercise(prev => ({
      ...prev,
      sets: prev.sets.filter((set) => set.id !== setId)
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
