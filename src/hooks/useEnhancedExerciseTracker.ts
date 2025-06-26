
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
      const now = new Date().toISOString();
      
      // Enhanced completion with analytics data
      const updates: Partial<ExerciseSet> = {
        completed: !set.completed
      };
      
      // If completing the set, capture rest timer analytics
      if (!set.completed) {
        const state = useWorkoutStore.getState();
        updates.actualRestTime = state.restTimerActive ? 
          state.restTimerTargetDuration - state.currentRestTime : 0;
        updates.targetRestTime = state.restTimerTargetDuration;
        updates.restTimerCompleted = now;
      }
      
      updateExerciseSet(exerciseName, setIndex, updates);
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
