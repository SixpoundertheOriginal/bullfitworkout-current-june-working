
import { useEffect } from 'react';
import { useWorkoutStore } from '@/store/workoutStore';

export function useWorkoutTimer() {
  const { isActive, setElapsedTime, elapsedTime } = useWorkoutStore();

  // Timer effect to update elapsed time with validation
  useEffect(() => {
    if (isActive) {
      const timer = setInterval(() => {
        setElapsedTime(elapsedTime + 1);
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isActive, setElapsedTime, elapsedTime]);

  return { isActive };
}
