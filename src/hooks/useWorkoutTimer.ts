
import { useEffect } from 'react';
import { useWorkoutStore } from '@/store/workoutStore';

export function useWorkoutTimer() {
  const { isActive, setElapsedTime, elapsedTime } = useWorkoutStore();

  // Timer effect to update elapsed time with validation
  useEffect(() => {
    if (isActive) {
      const timer = setInterval(() => {
        setElapsedTime(prev => {
          // Add validation to prevent timer corruption
          const newTime = prev + 1;
          const MAX_WORKOUT_HOURS = 24;
          const MAX_SECONDS = MAX_WORKOUT_HOURS * 60 * 60; // 86400 seconds
          
          // Reset timer if it gets corrupted or exceeds reasonable limits
          if (newTime > MAX_SECONDS) {
            console.warn('[WorkoutTimer] Timer reset due to excessive value:', newTime);
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isActive, setElapsedTime]);

  return { isActive };
}
