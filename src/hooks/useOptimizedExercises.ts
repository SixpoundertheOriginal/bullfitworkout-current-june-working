
import { useExercises } from './useExercises';

/**
 * A wrapper around useExercises for specific components that might need
 * additional optimizations or transformations in the future.
 * Currently, it passes through the results from useExercises.
 */
export const useOptimizedExercises = () => {
  const { 
    exercises, 
    isLoading, 
    error, 
    createExercise, 
    isPending, 
    seedDatabase,
    isSeeding 
  } = useExercises();

  return {
    exercises: exercises || [],
    isLoading,
    error,
    createExercise,
    isPending,
    totalCount: exercises?.length || 0,
    seedDatabase,
    isSeeding,
  };
};
