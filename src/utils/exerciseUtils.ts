
import { ExerciseSet } from '@/types/exercise';

export const calculateSetVolume = (set: ExerciseSet): number => {
  // Make sure we're working with numbers
  const weight = typeof set.weight === 'string' ? parseFloat(set.weight) : set.weight;
  const reps = typeof set.reps === 'string' ? parseInt(set.reps, 10) : set.reps;
  
  if (!set.completed || isNaN(weight) || isNaN(reps)) {
    return 0;
  }
  
  return weight * reps;
};

export const getTrendIndicator = (
  currentValue: number, 
  previousValue: number
): 'increasing' | 'decreasing' | 'stable' | 'fluctuating' => {
  if (previousValue === 0) return 'stable';
  
  const percentChange = ((currentValue - previousValue) / previousValue) * 100;
  
  if (percentChange >= 5) return 'increasing';
  if (percentChange <= -5) return 'decreasing';
  if (Math.abs(percentChange) < 5) return 'stable';
  return 'fluctuating';
};
