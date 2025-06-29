
import { useWorkoutStore } from '@/store/workoutStore';
import { useShallow } from 'zustand/react/shallow';

// Timer-specific selector - only subscribes to timer-related state
export const useWorkoutTimer = () => {
  return useWorkoutStore(
    (state) => ({
      elapsedTime: state.elapsedTime,
      restTimerActive: state.restTimerActive,
      currentRestTime: state.currentRestTime,
      restTimerResetSignal: state.restTimerResetSignal,
      restTimerTargetDuration: state.restTimerTargetDuration,
    }),
    useShallow
  );
};

// Exercise-specific selector - only subscribes to exercise-related state
export const useWorkoutExercises = () => {
  return useWorkoutStore(
    (state) => ({
      exercises: state.exercises,
      isActive: state.isActive,
      workoutStatus: state.workoutStatus,
    }),
    useShallow
  );
};

// Session metadata selector - for session info that rarely changes
export const useWorkoutSession = () => {
  return useWorkoutStore(
    (state) => ({
      sessionId: state.sessionId,
      trainingConfig: state.trainingConfig,
      needsRecovery: state.needsRecovery,
      recoveryData: state.recoveryData,
    }),
    useShallow
  );
};

// Actions selector - for workout actions
export const useWorkoutActions = () => {
  return useWorkoutStore(
    (state) => ({
      resetWorkout: state.resetWorkout,
      setTrainingConfig: state.setTrainingConfig,
      startWorkout: state.startWorkout,
      updateLastActiveRoute: state.updateLastActiveRoute,
      completeSet: state.completeSet,
      removeExercise: state.removeExercise,
      addExercise: state.addExercise,
      stopRestTimer: state.stopRestTimer,
      resetRestTimer: state.resetRestTimer,
      performRecovery: state.performRecovery,
      clearRecovery: state.clearRecovery,
    }),
    useShallow
  );
};
