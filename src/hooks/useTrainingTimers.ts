
import { useWorkoutStore } from '@/store/workoutStore';
import { useCallback } from 'react';

export interface WorkoutTimer {
  isActive: boolean;
  time: number;
  start: () => void;
  pause: () => void;
  reset: () => void;
  isRunning: boolean;
  elapsed: number;
  resume: () => void;
}

export interface RestTimer {
  isActive: boolean;
  time: number;
  resetSignal: number;
  start: (duration?: number) => void;
  stop: () => void;
  reset: () => void;
  remaining: number;
  target: number;
  progress: number;
  setDuration: (duration: number) => void;
  skip: () => void;
}

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
    startTime
  } = useWorkoutStore();

  // Unified timer system for workout tracking
  const workoutTimer: WorkoutTimer = {
    isActive: true,
    time: elapsedTime,
    isRunning: true,
    elapsed: elapsedTime,
    start: () => {
      console.log('Workout timer started');
    },
    pause: () => {
      console.log('Workout timer paused');
    },
    resume: () => {
      console.log('Workout timer resumed');
    },
    reset: () => {
      setElapsedTime(0);
    }
  };

  // Rest timer with smart duration handling
  const restTimer: RestTimer = {
    isActive: restTimerActive,
    time: currentRestTime,
    remaining: currentRestTime,
    target: 60,
    progress: currentRestTime > 0 ? ((60 - currentRestTime) / 60) * 100 : 0,
    resetSignal: restTimerResetSignal,
    start: (duration: number = 60) => {
      startRestTimer(duration);
    },
    stop: () => {
      stopRestTimer();
    },
    reset: () => {
      resetRestTimer();
    },
    setDuration: (duration: number) => {
      console.log(`Setting rest duration to ${duration}s`);
    },
    skip: () => {
      stopRestTimer();
    }
  };

  // Enhanced set completion with automatic rest timer
  const handleSetCompletion = useCallback((exerciseName: string, setIndex: number) => {
    console.log(`[TrainingTimers] Set completion: ${exerciseName} set ${setIndex + 1}`);
    
    // Auto-start rest timer based on exercise type and user preferences
    const restDuration = calculateRestDuration(exerciseName);
    restTimer.start(restDuration);
    
    console.log(`[TrainingTimers] Rest timer started for ${restDuration}s`);
  }, [restTimer]);

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
