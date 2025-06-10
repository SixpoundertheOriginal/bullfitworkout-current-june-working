
import { useMemo } from 'react';

interface ExerciseSet {
  id: number;
  weight: number;
  reps: number;
  duration: string;
  completed: boolean;
  volume: number;
}

interface Exercise {
  id: string;
  name: string;
  lastWorkout?: {
    weight: number;
    reps: number;
    daysAgo: number;
  };
  sets: ExerciseSet[];
}

export const useExerciseValidation = (exercise: Exercise) => {
  const metrics = useMemo(() => {
    const completedSets = exercise.sets.filter(set => set.completed).length;
    const totalSets = exercise.sets.length;
    const progressPercentage = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
    const totalVolume = exercise.sets
      .filter(set => set.completed)
      .reduce((sum, set) => sum + set.volume, 0);
    
    return {
      completedSets,
      totalSets,
      progressPercentage,
      totalVolume
    };
  }, [exercise.sets]);

  const validateInput = (value: string, field: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) {
      return { isValid: false, error: `Invalid ${field}` };
    }
    if (field === 'reps' && numValue > 1000) {
      return { isValid: false, error: 'Reps too high' };
    }
    if (field === 'weight' && numValue > 1000) {
      return { isValid: false, error: 'Weight too high' };
    }
    return { isValid: true, error: null };
  };

  return {
    metrics,
    validateInput
  };
};
