
import { useWorkoutStore } from '@/store/workoutStore';
import { useCallback, useMemo } from 'react';

/**
 * Custom hook for accessing workout state with memoized selectors
 * to prevent unnecessary re-renders
 */
export function useWorkoutState() {
  const store = useWorkoutStore();

  // Memoize the selected state values to prevent unnecessary re-renders
  const {
    isActive,
    exercises,
    elapsedTime,
    restTimerActive,
    currentRestTime,
    activeExercise,
    workoutStatus
  } = store;

  // Memoize the actions from the store
  const actions = useMemo(() => ({
    startWorkout: store.startWorkout,
    endWorkout: store.endWorkout,
    resetSession: store.resetSession,
    updateLastActiveRoute: store.updateLastActiveRoute,
    setExercises: store.setExercises,
    setElapsedTime: store.setElapsedTime,
    setRestTimerActive: store.setRestTimerActive,
    setCurrentRestTime: store.setCurrentRestTime,
    setActiveExercise: store.setActiveExercise,
    setWorkoutStatus: store.setWorkoutStatus,
    handleCompleteSet: store.handleCompleteSet,
    deleteExercise: store.deleteExercise,
  }), [store]);

  // Helper method to check if workout is in a saving state
  const isSaving = useMemo(() => 
    workoutStatus === 'saving',
  [workoutStatus]);

  // Helper to check if workout has been saved
  const isSaved = useMemo(() => 
    workoutStatus === 'saved',
  [workoutStatus]);

  // Helper to get exercise count
  const exerciseCount = useMemo(() => 
    Object.keys(exercises).length,
  [exercises]);

  return {
    // State
    isActive,
    exercises,
    elapsedTime,
    restTimerActive,
    currentRestTime,
    activeExercise,
    workoutStatus,
    
    // Computed
    isSaving,
    isSaved,
    exerciseCount,
    
    // Actions
    ...actions
  };
}
