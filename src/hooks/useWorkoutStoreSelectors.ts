
import { useWorkoutStore } from '@/store/workoutStore';
import { useMemo } from 'react';

// Timer-specific selector - only subscribes to timer-related state
export const useWorkoutTimer = () => {
  const result = useWorkoutStore(
    (state) => ({
      elapsedTime: state.elapsedTime ?? 0,
      restTimerActive: state.restTimerActive ?? false,
      currentRestTime: state.currentRestTime ?? 0,
      restTimerResetSignal: state.restTimerResetSignal ?? 0,
      restTimerTargetDuration: state.restTimerTargetDuration ?? 60,
    })
  );
  
  return useMemo(() => result, [
    result.elapsedTime,
    result.restTimerActive,
    result.currentRestTime,
    result.restTimerResetSignal,
    result.restTimerTargetDuration
  ]);
};

// Exercise-specific selector - only subscribes to exercise-related state
export const useWorkoutExercises = () => {
  return useWorkoutStore(
    (state) => ({
      exercises: state.exercises ?? {},
      isActive: state.isActive ?? false,
      workoutStatus: state.workoutStatus ?? 'idle',
    })
  );
};

// Session metadata selector - for session info that rarely changes
export const useWorkoutSession = () => {
  const result = useWorkoutStore(
    (state) => ({
      sessionId: state.sessionId ?? null,
      trainingConfig: state.trainingConfig ?? null,
      needsRecovery: state.needsRecovery ?? false,
      recoveryData: state.recoveryData ?? null,
    })
  );
  
  return useMemo(() => result, [
    result.sessionId,
    result.trainingConfig,
    result.needsRecovery,
    result.recoveryData
  ]);
};

// Actions selector - for workout actions
export const useWorkoutActions = () => {
  const result = useWorkoutStore(
    (state) => ({
      resetWorkout: state.resetWorkout ?? (() => {}),
      setTrainingConfig: state.setTrainingConfig ?? (() => {}),
      startWorkout: state.startWorkout ?? (() => {}),
      updateLastActiveRoute: state.updateLastActiveRoute ?? (() => {}),
      completeSet: state.completeSet ?? (() => {}),
      removeExercise: state.removeExercise ?? (() => {}),
      addExercise: state.addExercise ?? (() => {}),
      stopRestTimer: state.stopRestTimer ?? (() => {}),
      resetRestTimer: state.resetRestTimer ?? (() => {}),
      performRecovery: state.performRecovery ?? (() => {}),
      clearRecovery: state.clearRecovery ?? (() => {}),
    })
  );
  
  return useMemo(() => result, [
    result.resetWorkout,
    result.setTrainingConfig,
    result.startWorkout,
    result.updateLastActiveRoute,
    result.completeSet,
    result.removeExercise,
    result.addExercise,
    result.stopRestTimer,
    result.resetRestTimer,
    result.performRecovery,
    result.clearRecovery
  ]);
};
