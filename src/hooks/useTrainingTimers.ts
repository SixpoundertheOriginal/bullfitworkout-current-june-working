
import { useState, useEffect, useCallback, useRef } from 'react';
import { useWorkoutStore } from '@/store/workoutStore';
import { useSound } from '@/hooks/useSound';

export interface WorkoutTimer {
  elapsed: number;
  isRunning: boolean;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

export interface RestTimer {
  remaining: number;
  isActive: boolean;
  target: number;
  start: (duration?: number) => void;
  skip: () => void;
  reset: () => void;
  progress: number;
}

export interface TrainingTimers {
  workoutTimer: WorkoutTimer;
  restTimer: RestTimer;
  handleSetCompletion: (exerciseName: string, setIndex: number) => void;
}

export const useTrainingTimers = (): TrainingTimers => {
  const { 
    elapsedTime, 
    setElapsedTime, 
    handleCompleteSet,
    isActive: workoutActive,
    startTime 
  } = useWorkoutStore();
  
  const [workoutPaused, setWorkoutPaused] = useState(false);
  const [restRemaining, setRestRemaining] = useState(0);
  const [restActive, setRestActive] = useState(false);
  const [restTarget, setRestTarget] = useState(120); // 2 minutes default
  
  const workoutIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const restIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const { play: playBell } = useSound('/sounds/bell.mp3');
  const { play: playTick } = useSound('/sounds/tick.mp3');

  // Workout timer management
  useEffect(() => {
    if (workoutActive && !workoutPaused && !restActive) {
      workoutIntervalRef.current = setInterval(() => {
        if (startTime) {
          const now = Date.now();
          const start = new Date(startTime).getTime();
          const elapsed = Math.floor((now - start) / 1000);
          setElapsedTime(elapsed);
        } else {
          setElapsedTime(prev => prev + 1);
        }
      }, 1000);
    } else {
      if (workoutIntervalRef.current) {
        clearInterval(workoutIntervalRef.current);
        workoutIntervalRef.current = null;
      }
    }

    return () => {
      if (workoutIntervalRef.current) {
        clearInterval(workoutIntervalRef.current);
      }
    };
  }, [workoutActive, workoutPaused, restActive, startTime, setElapsedTime]);

  // Rest timer management
  useEffect(() => {
    if (restActive && restRemaining > 0) {
      restIntervalRef.current = setInterval(() => {
        setRestRemaining(prev => {
          if (prev <= 1) {
            setRestActive(false);
            playBell();
            return 0;
          }
          
          // Play tick sound every 10 seconds in last minute
          if (prev <= 60 && prev % 10 === 0) {
            playTick();
          }
          
          return prev - 1;
        });
      }, 1000);
    } else {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
        restIntervalRef.current = null;
      }
    }

    return () => {
      if (restIntervalRef.current) {
        clearInterval(restIntervalRef.current);
      }
    };
  }, [restActive, restRemaining, playBell, playTick]);

  // Workout timer controls
  const pauseWorkout = useCallback(() => {
    setWorkoutPaused(true);
  }, []);

  const resumeWorkout = useCallback(() => {
    setWorkoutPaused(false);
  }, []);

  const resetWorkout = useCallback(() => {
    setElapsedTime(0);
    setWorkoutPaused(false);
  }, [setElapsedTime]);

  // Rest timer controls
  const startRest = useCallback((duration: number = 120) => {
    setRestTarget(duration);
    setRestRemaining(duration);
    setRestActive(true);
    setWorkoutPaused(true); // Pause workout during rest
    playBell();
  }, [playBell]);

  const skipRest = useCallback(() => {
    setRestActive(false);
    setRestRemaining(0);
    setWorkoutPaused(false); // Resume workout
    playBell();
  }, [playBell]);

  const resetRest = useCallback(() => {
    setRestActive(false);
    setRestRemaining(0);
    if (restIntervalRef.current) {
      clearInterval(restIntervalRef.current);
      restIntervalRef.current = null;
    }
  }, []);

  // Enhanced set completion handler
  const handleSetCompletionWithRest = useCallback((exerciseName: string, setIndex: number) => {
    // Complete the set first
    handleCompleteSet(exerciseName, setIndex);
    
    // Start rest timer automatically
    startRest(restTarget);
  }, [handleCompleteSet, startRest, restTarget]);

  // Calculate rest progress percentage
  const restProgress = restTarget > 0 ? ((restTarget - restRemaining) / restTarget) * 100 : 0;

  return {
    workoutTimer: {
      elapsed: elapsedTime,
      isRunning: workoutActive && !workoutPaused && !restActive,
      pause: pauseWorkout,
      resume: resumeWorkout,
      reset: resetWorkout
    },
    restTimer: {
      remaining: restRemaining,
      isActive: restActive,
      target: restTarget,
      start: startRest,
      skip: skipRest,
      reset: resetRest,
      progress: restProgress
    },
    handleSetCompletion: handleSetCompletionWithRest
  };
};
