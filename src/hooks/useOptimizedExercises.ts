
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useExercises } from './useExercises';
import { Exercise, ExerciseInput } from '@/types/exercise';

/**
 * Modified hook to use local exercise data source instead of Supabase.
 * This allows the exercise library to function without a backend connection.
 */
export const useOptimizedExercises = () => {
  const queryClient = useQueryClient();
  const { 
    exercises, 
    isLoading, 
    error, 
    createExercise: createExerciseLocal,
    isPending: isLocalCreatePending,
  } = useExercises();

  // The create mutation will wrap the local create function.
  // We use mutateAsync so it can be awaited in components.
  const { mutateAsync: createExercise, isPending } = useMutation<Exercise, Error, ExerciseInput>({
    mutationFn: (newExercise: ExerciseInput) => {
      return createExerciseLocal(newExercise);
    },
    onSuccess: () => {
      // Invalidation isn't strictly necessary since useExercises updates its own state,
      // but it's good practice for potential future react-query integration.
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });

  return {
    exercises: exercises || [],
    isLoading,
    error,
    createExercise,
    isPending: isPending || isLocalCreatePending,
    totalCount: exercises?.length || 0,
  };
};
