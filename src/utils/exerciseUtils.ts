
import { ExerciseSet } from '@/types/exercise';

export const calculateVolume = (set: ExerciseSet): number => {
  const weight = typeof set.weight === 'number' ? set.weight : 0;
  const reps = typeof set.reps === 'number' ? set.reps : 0;
  return weight * reps;
};

export const calculateTotalVolume = (sets: ExerciseSet[]): number => {
  return sets
    .filter(set => set.completed)
    .reduce((total, set) => total + calculateVolume(set), 0);
};

export const calculateMaxWeight = (sets: ExerciseSet[]): number => {
  return sets
    .filter(set => set.completed && set.weight > 0)
    .reduce((max, set) => Math.max(max, set.weight), 0);
};

export const calculateTotalReps = (sets: ExerciseSet[]): number => {
  return sets
    .filter(set => set.completed)
    .reduce((total, set) => total + set.reps, 0);
};

export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};
