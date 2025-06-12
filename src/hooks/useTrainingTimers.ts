
import { useWorkoutStore } from '@/store/workoutStore';
import { useCallback } from 'react';

export const useTrainingTimers = () => {
  const {
    elapsedTime,
    setElapsedTime,
    restTimerActive,
    restTimerResetSignal,
    currentRestTime,
    startRestTimer,
    stopRestTimer,
    resetRestTimer,
    handleCompleteSet,
    startTime
  } = useWorkoutStore();

  // Unified timer system for workout tracking
  const workoutTimer = {
    isActive: true,
    time: elapsedTime,
    start: () => {
      console.log('Workout timer started');
    },
    pause: () => {
      console.log('Workout timer paused');
    },
    reset: () => {
      setElapsedTime(0);
    }
  };

  // Rest timer with smart duration handling
  const restTimer = {
    isActive: restTimerActive,
    time: currentRestTime,
    resetSignal: restTimerResetSignal,
    start: (duration: number = 60) => {
      startRestTimer(duration);
    },
    stop: () => {
      stopRestTimer();
    },
    reset: () => {
      resetRestTimer();
    }
  };

  // Enhanced set completion with automatic rest timer
  const handleSetCompletion = useCallback((exerciseName: string, setIndex: number) => {
    console.log(`[TrainingTimers] Set completion: ${exerciseName} set ${setIndex + 1}`);
    
    // Call the store's handleCompleteSet if it exists
    if (handleCompleteSet) {
      handleCompleteSet(exerciseName, setIndex);
    }
    
    // Auto-start rest timer based on exercise type and user preferences
    const restDuration = calculateRestDuration(exerciseName);
    restTimer.start(restDuration);
    
    console.log(`[TrainingTimers] Rest timer started for ${restDuration}s`);
  }, [handleCompleteSet, restTimer]);

  const calculateRestDuration = (exerciseName: string): number => {
    // Smart rest duration based on exercise type
    const compoundExercises = ['squat', 'deadlift', 'bench', 'row'];
    const isCompound = compoundExercises.some(exercise => 
      exerciseName.toLowerCase().includes(exercise)
    );
    
    return isCompound ? 180 : 90; // 3 minutes for compound, 90s for isolation
  };

  return {
    workoutTimer,
    restTimer,
    handleSetCompletion,
    elapsedTime,
    restTimerActive,
    currentRestTime
  };
};
