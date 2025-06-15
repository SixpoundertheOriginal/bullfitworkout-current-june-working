
import { useWorkoutStore } from '@/store/workoutStore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TimerEngine } from '@/services/TimerEngine';
import { usePageVisibility } from '@/hooks/usePageVisibility';
import { RestTimerEngine } from '@/services/RestTimerEngine';

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
    isActive,
    elapsedTime,
    setElapsedTime,
    restTimerActive,
    restTimerResetSignal,
    currentRestTime,
    restTimerTargetDuration,
    startRestTimer,
    stopRestTimer,
    resetRestTimer,
    startWorkout,
    resetWorkout,
    setCurrentRestTime,
  } = useWorkoutStore();
  
  const { isVisible } = usePageVisibility();
  const [isWorkoutTimerRunning, setIsWorkoutTimerRunning] = useState(isActive && isVisible);

  const onWorkoutTick = useCallback((seconds: number) => {
    // This check is important to prevent unnecessary re-renders via Zustand
    if (seconds !== useWorkoutStore.getState().elapsedTime) {
      setElapsedTime(seconds);
    }
  }, [setElapsedTime]);

  const timerEngineRef = useRef<TimerEngine | null>(null);
  if (!timerEngineRef.current) {
    timerEngineRef.current = new TimerEngine(onWorkoutTick, elapsedTime);
  }

  useEffect(() => {
    const engine = timerEngineRef.current!;
    if (isActive && isVisible) {
      engine.resume();
      setIsWorkoutTimerRunning(true);
    } else {
      engine.pause();
      setIsWorkoutTimerRunning(false);
    }

    return () => {
      engine.pause();
    };
  }, [isActive, isVisible]);
  
  useEffect(() => {
    if (!isActive) {
      timerEngineRef.current?.reset();
    }
  }, [isActive]);

  const restTimerEngineRef = useRef<RestTimerEngine | null>(null);

  const onRestTick = useCallback((seconds: number) => {
    setCurrentRestTime(seconds);
  }, [setCurrentRestTime]);

  const onRestEnd = useCallback(() => {
    stopRestTimer();
    // In the future, we can trigger a notification here.
    console.log('[TrainingTimers] Rest timer finished.');
  }, [stopRestTimer]);

  if (!restTimerEngineRef.current) {
    restTimerEngineRef.current = new RestTimerEngine(onRestTick, onRestEnd);
  }
  
  useEffect(() => {
    const engine = restTimerEngineRef.current!;
    return () => {
      engine.stop();
    };
  }, []);

  // Unified timer system for workout tracking
  const workoutTimer: WorkoutTimer = {
    isActive: isActive,
    time: elapsedTime,
    isRunning: isWorkoutTimerRunning,
    elapsed: elapsedTime,
    start: () => {
      if (!isActive) startWorkout();
    },
    pause: () => {
      timerEngineRef.current?.pause();
      setIsWorkoutTimerRunning(false);
    },
    resume: () => {
      if (isActive) {
        timerEngineRef.current?.resume();
        setIsWorkoutTimerRunning(true);
      }
    },
    reset: () => {
      resetWorkout();
    },
  };

  // Rest timer with smart duration handling
  const restTimer: RestTimer = {
    isActive: restTimerActive,
    time: currentRestTime,
    remaining: currentRestTime,
    target: restTimerTargetDuration,
    progress: restTimerTargetDuration > 0 ? ((restTimerTargetDuration - currentRestTime) / restTimerTargetDuration) * 100 : 0,
    resetSignal: restTimerResetSignal,
    start: (duration: number = 60) => {
      startRestTimer(duration);
      restTimerEngineRef.current?.start(duration);
    },
    stop: () => {
      stopRestTimer();
      restTimerEngineRef.current?.stop();
    },
    reset: () => {
      resetRestTimer();
      restTimerEngineRef.current?.reset();
    },
    setDuration: (duration: number) => {
      if (restTimerActive) {
        // If timer is running, restart it with the new duration
        restTimer.start(duration);
      } else {
        // This could be enhanced to set a "next" duration, but for now we'll log it.
        // The UI will call start() with the new value anyway.
        console.log(`Setting rest duration to ${duration}s`);
      }
    },
    skip: () => {
      stopRestTimer();
      restTimerEngineRef.current?.stop();
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
