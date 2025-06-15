
import { useWorkoutStore } from '@/store/workoutStore';
import { useCallback } from 'react';
import { ExerciseSet } from '@/types/exercise';

export const useEnhancedExerciseTracker = (exerciseName: string) => {
  const {
    exercises,
    activeExercise,
    updateExerciseSet,
    addSet,
    removeSet,
    setActiveExercise,
    stopRestTimer,
  } = useWorkoutStore();

  const exerciseData = exercises[exerciseName] || [];
  const isActive = activeExercise === exerciseName;

  const onUpdateSet = useCallback((setId: string, updates: Partial<ExerciseSet>) => {
    const setIndex = exerciseData.findIndex(s => s.id === setId);
    if (setIndex > -1) {
      updateExerciseSet(exerciseName, setIndex, updates);
    }
  }, [updateExerciseSet, exerciseData, exerciseName]);

  const onToggleCompletion = useCallback((setId: string) => {
    const setIndex = exerciseData.findIndex(s => s.id === setId);
    if (setIndex > -1) {
      const set = exerciseData[setIndex];
      updateExerciseSet(exerciseName, setIndex, { completed: !set.completed });
    }
  }, [updateExerciseSet, exerciseData, exerciseName]);

  const onAddSet = useCallback(() => {
    addSet(exerciseName);
    stopRestTimer();
  }, [addSet, stopRestTimer, exerciseName]);

  const onDeleteSet = useCallback((setId: string) => {
    const setIndex = exerciseData.findIndex(s => s.id === setId);
    if (setIndex > -1) {
      removeSet(exerciseName, setIndex);
    }
  }, [removeSet, exerciseData, exerciseName]);

  const onSetActive = useCallback(() => {
    setActiveExercise(exerciseName);
  }, [setActiveExercise, exerciseName]);

  const exercise = {
    id: `exercise-${exerciseName}`,
    name: exerciseName,
    sets: exerciseData,
  };

  return {
    exercise,
    isActive,
    onUpdateSet,
    onToggleCompletion,
    onAddSet,
    onDeleteSet,
    onSetActive,
  };
};
