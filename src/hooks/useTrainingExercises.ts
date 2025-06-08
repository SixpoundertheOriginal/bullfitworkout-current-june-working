
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Exercise } from '@/types/exercise';
import { useExercises } from '@/hooks/useExercises';

/**
 * Enterprise-grade hook for training-specific exercise operations
 * Isolated from library operations with dedicated cache management
 */
export const useTrainingExercises = () => {
  const queryClient = useQueryClient();
  const { exercises: allExercises, isLoading: isLoadingAll } = useExercises();

  // Training-specific query with separate cache
  const { data: trainingExercises, isLoading, error } = useQuery({
    queryKey: ['exercises', 'training'],
    queryFn: async (): Promise<Exercise[]> => {
      // Filter exercises suitable for training sessions
      if (!allExercises || !Array.isArray(allExercises)) return [];
      return allExercises.filter(exercise => 
        exercise && exercise.name && exercise.primary_muscle_groups?.length > 0
      );
    },
    enabled: !!allExercises,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (replaced cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false
  });

  // Optimistic add exercise to training session
  const addToTrainingSession = useMutation({
    mutationFn: async (exercise: Exercise) => {
      // Optimistic update for instant UI feedback
      queryClient.setQueryData(['exercises', 'training'], (old: Exercise[] = []) => {
        if (old.some(e => e.id === exercise.id)) return old;
        return [...old, exercise];
      });
      return exercise;
    },
    onError: () => {
      // Rollback on error
      queryClient.invalidateQueries({ queryKey: ['exercises', 'training'] });
    }
  });

  // Background refresh without disrupting UI
  const refreshTrainingExercises = async () => {
    await queryClient.refetchQueries({ 
      queryKey: ['exercises', 'training'],
      type: 'active'
    });
  };

  return {
    exercises: trainingExercises || [],
    isLoading: isLoading || isLoadingAll,
    error,
    addToTrainingSession: addToTrainingSession.mutate,
    refreshTrainingExercises,
    isAddingExercise: addToTrainingSession.isPending
  };
};
