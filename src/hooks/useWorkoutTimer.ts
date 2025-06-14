
import { useEffect, useRef } from 'react';
import { useWorkoutStore } from '@/store/workoutStore';

export function useWorkoutTimer() {
  const { isActive, setElapsedTime, elapsedTime } = useWorkoutStore();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Validate and sanitize elapsed time to prevent overflow
  const validateElapsedTime = (time: number): number => {
    // Maximum 24 hours (86400 seconds)
    const MAX_WORKOUT_TIME = 86400;
    
    if (time > MAX_WORKOUT_TIME) {
      console.warn('[WorkoutStore] Timer reset due to excessive value:', time);
      return 0;
    }
    
    return Math.max(0, Math.floor(time));
  };

  // Enhanced timer with proper cleanup and validation
  useEffect(() => {
    if (isActive) {
      // Set start time if not already set
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now() - (elapsedTime * 1000);
      }
      
      const updateTimer = () => {
        if (startTimeRef.current) {
          const currentTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
          const validatedTime = validateElapsedTime(currentTime);
          
          // Only update if time has changed and is valid
          if (validatedTime !== elapsedTime) {
            setElapsedTime(validatedTime);
          }
        }
      };
      
      // Use more efficient timing
      timerRef.current = setInterval(updateTimer, 1000);
      
      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };
    } else {
      // Reset start time when inactive
      startTimeRef.current = null;
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isActive, setElapsedTime]); // Removed elapsedTime from deps to prevent recreation

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return { isActive };
}
