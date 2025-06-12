
import { useState, useEffect, useCallback, useRef } from 'react';
import { useWorkoutStore } from '@/store/workoutStore';
import { useSound } from '@/hooks/useSound';
import { toast } from "@/hooks/use-toast";

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
  setDuration: (duration: number) => void;
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
  const [restTarget, setRestTarget] = useState(90); // 90 seconds default
  
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

  // Rest timer management with enhanced completion handling
  useEffect(() => {
    if (restActive && restRemaining > 0) {
      restIntervalRef.current = setInterval(() => {
        setRestRemaining(prev => {
          if (prev <= 1) {
            setRestActive(false);
            setWorkoutPaused(false); // Resume workout when rest ends
            playBell();
            
            // Show completion toast
            toast({
              title: "Rest complete!",
              description: "Time to crush your next set 💪",
            });
            
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

  // Enhanced rest timer controls
  const startRest = useCallback((duration: number = restTarget) => {
    console.log(`Starting rest timer for ${duration} seconds`);
    setRestTarget(duration);
    setRestRemaining(duration);
    setRestActive(true);
    setWorkoutPaused(true); // Pause workout during rest
    playBell();
    
    // Show start toast
    toast({
      title: "Rest timer started",
      description: `${duration}s rest period began`,
    });
  }, [restTarget, playBell]);

  const skipRest = useCallback(() => {
    console.log('Skipping rest timer');
    setRestActive(false);
    setRestRemaining(0);
    setWorkoutPaused(false); // Resume workout
    playBell();
    
    toast({
      title: "Rest skipped",
      description: "Back to work! 🔥",
    });
  }, [playBell]);

  const resetRest = useCallback(() => {
    setRestActive(false);
    setRestRemaining(0);
    if (restIntervalRef.current) {
      clearInterval(restIntervalRef.current);
      restIntervalRef.current = null;
    }
  }, []);

  const setRestDuration = useCallback((duration: number) => {
    setRestTarget(duration);
    // If timer is active, update remaining time too
    if (restActive) {
      setRestRemaining(duration);
    }
  }, [restActive]);

  // Enhanced set completion handler with auto-start
  const handleSetCompletionWithRest = useCallback((exerciseName: string, setIndex: number) => {
    console.log(`Set completion triggered for ${exerciseName}, set ${setIndex + 1}`);
    
    // Complete the set first
    handleCompleteSet(exerciseName, setIndex);
    
    // Auto-start rest timer immediately
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
      progress: restProgress,
      setDuration: setRestDuration
    },
    handleSetCompletion: handleSetCompletionWithRest
  };
};
