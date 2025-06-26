import { useWorkoutStore } from '@/store/workoutStore';
import { useCallback, useEffect, useRef, useState } from 'react';
import { TimerEngine } from '@/services/TimerEngine';
import { usePageVisibility } from '@/hooks/usePageVisibility';
import { RestTimerEngine } from '@/services/RestTimerEngine';
import { useExerciseRestTime } from '@/hooks/useExerciseRestTime';

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
  isOvertime: boolean;
  overtimeSeconds: number;
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
  const { getRestTime } = useExerciseRestTime();
  const [isWorkoutTimerRunning, setIsWorkoutTimerRunning] = useState(isActive && isVisible);
  const [isRestOvertime, setIsRestOvertime] = useState(false);
  const [restOvertimeSeconds, setRestOvertimeSeconds] = useState(0);
  const [showRestNotification, setShowRestNotification] = useState(false);

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

  const onRestTick = useCallback((remainingTime: number, isOvertime: boolean, overtimeSeconds: number) => {
    setCurrentRestTime(remainingTime);
    setIsRestOvertime(isOvertime);
    setRestOvertimeSeconds(overtimeSeconds);
  }, [setCurrentRestTime]);

  const onRestEnd = useCallback(() => {
    console.log('[TrainingTimers] Rest timer finished - showing notification');
    setShowRestNotification(true);
    
    // Play notification sound or vibration if available
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
  }, []);

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

  // Enhanced rest timer with additional controls
  const restTimer: RestTimer = {
    isActive: restTimerActive,
    time: currentRestTime,
    remaining: currentRestTime,
    target: restTimerTargetDuration,
    progress: restTimerTargetDuration > 0 ? ((restTimerTargetDuration - currentRestTime) / restTimerTargetDuration) * 100 : 0,
    isOvertime: isRestOvertime,
    overtimeSeconds: restOvertimeSeconds,
    resetSignal: restTimerResetSignal,
    start: (duration: number = 60) => {
      startRestTimer(duration);
      restTimerEngineRef.current?.start(duration);
      setShowRestNotification(false);
    },
    stop: () => {
      stopRestTimer();
      restTimerEngineRef.current?.stop();
      setShowRestNotification(false);
    },
    reset: () => {
      resetRestTimer();
      restTimerEngineRef.current?.reset();
      setShowRestNotification(false);
    },
    setDuration: (duration: number) => {
      if (restTimerActive) {
        // If timer is running, restart it with the new duration
        restTimer.start(duration);
      } else {
        console.log(`Setting rest duration to ${duration}s`);
        // Update the target duration in the store
        useWorkoutStore.getState().setRestTimerTargetDuration(duration);
      }
    },
    skip: () => {
      stopRestTimer();
      restTimerEngineRef.current?.stop();
      setShowRestNotification(false);
    }
  };

  // Enhanced set completion with user's preferred rest time
  const handleSetCompletion = useCallback((exerciseName: string, setIndex: number) => {
    console.log(`[TrainingTimers] Set completion: ${exerciseName} set ${setIndex + 1}`);
    
    // Use user's preferred rest time for this exercise
    const restDuration = getRestTime(exerciseName);
    restTimer.start(restDuration);
    
    console.log(`[TrainingTimers] Rest timer started for ${restDuration}s (user preference)`);
  }, [restTimer, getRestTime]);

  const dismissRestNotification = useCallback(() => {
    setShowRestNotification(false);
  }, []);

  // Additional control functions for Phase 3
  const addRestTime = useCallback((seconds: number) => {
    if (restTimerActive) {
      const newDuration = restTimerTargetDuration + seconds;
      restTimer.setDuration(newDuration);
    }
  }, [restTimerActive, restTimerTargetDuration, restTimer]);

  const restartRestTimer = useCallback(() => {
    if (restTimerTargetDuration > 0) {
      restTimer.start(restTimerTargetDuration);
    }
  }, [restTimerTargetDuration, restTimer]);

  return {
    workoutTimer,
    restTimer,
    handleSetCompletion,
    elapsedTime,
    restTimerActive,
    currentRestTime,
    showRestNotification,
    dismissRestNotification,
    isRestOvertime,
    restOvertimeSeconds,
    addRestTime,
    restartRestTimer
  };
};
