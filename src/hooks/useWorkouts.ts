
import { useState, useEffect } from 'react';

interface WorkoutSet {
  weight: number;
  reps: number;
}

interface Workout {
  id: string;
  name: string;
  created_at: string;
  duration?: number;
  exercises?: Record<string, WorkoutSet[]>;
}

export const useWorkouts = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading workouts
    const timer = setTimeout(() => {
      setWorkouts([]);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return {
    workouts,
    isLoading,
    error: null
  };
};
