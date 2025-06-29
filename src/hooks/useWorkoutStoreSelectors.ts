
import { useWorkoutStore } from '@/store/workoutStore';

// Timer-specific selector - only subscribes to timer-related state
export const useWorkoutTimer = () => {
  const result = useWorkoutStore(
    (state) => {
      console.log('[useWorkoutTimer] Store state keys:', Object.keys(state));
      console.log('[useWorkoutTimer] Timer state:', {
        elapsedTime: state.elapsedTime,
        restTimerActive: state.restTimerActive,
        currentRestTime: state.currentRestTime,
        restTimerResetSignal: state.restTimerResetSignal,
        restTimerTargetDuration: state.restTimerTargetDuration,
      });
      
      return {
        elapsedTime: state.elapsedTime ?? 0,
        restTimerActive: state.restTimerActive ?? false,
        currentRestTime: state.currentRestTime ?? 0,
        restTimerResetSignal: state.restTimerResetSignal ?? 0,
        restTimerTargetDuration: state.restTimerTargetDuration ?? 60,
      };
    }
  );
  
  console.log('[useWorkoutTimer] Returning:', result);
  return result;
};

// Exercise-specific selector - only subscribes to exercise-related state
export const useWorkoutExercises = () => {
  const result = useWorkoutStore(
    (state) => {
      console.log('[useWorkoutExercises] Exercise state:', {
        exercises: state.exercises,
        isActive: state.isActive,
        workoutStatus: state.workoutStatus,
      });
      
      return {
        exercises: state.exercises ?? {},
        isActive: state.isActive ?? false,
        workoutStatus: state.workoutStatus ?? 'idle',
      };
    }
  );
  
  console.log('[useWorkoutExercises] Returning:', result);
  return result;
};

// Session metadata selector - for session info that rarely changes
export const useWorkoutSession = () => {
  const result = useWorkoutStore(
    (state) => {
      console.log('[useWorkoutSession] Session state:', {
        sessionId: state.sessionId,
        trainingConfig: state.trainingConfig,
        needsRecovery: state.needsRecovery,
        recoveryData: state.recoveryData,
      });
      
      return {
        sessionId: state.sessionId ?? null,
        trainingConfig: state.trainingConfig ?? null,
        needsRecovery: state.needsRecovery ?? false,
        recoveryData: state.recoveryData ?? null,
      };
    }
  );
  
  console.log('[useWorkoutSession] Returning:', result);
  return result;
};

// Actions selector - for workout actions
export const useWorkoutActions = () => {
  const result = useWorkoutStore(
    (state) => {
      console.log('[useWorkoutActions] Actions available:', {
        resetWorkout: typeof state.resetWorkout,
        setTrainingConfig: typeof state.setTrainingConfig,
        startWorkout: typeof state.startWorkout,
        updateLastActiveRoute: typeof state.updateLastActiveRoute,
        completeSet: typeof state.completeSet,
        removeExercise: typeof state.removeExercise,
        addExercise: typeof state.addExercise,
        stopRestTimer: typeof state.stopRestTimer,
        resetRestTimer: typeof state.resetRestTimer,
        performRecovery: typeof state.performRecovery,
        clearRecovery: typeof state.clearRecovery,
      });
      
      return {
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
      };
    }
  );
  
  console.log('[useWorkoutActions] Returning:', result);
  return result;
};
