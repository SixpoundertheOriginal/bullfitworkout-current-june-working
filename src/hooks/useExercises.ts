
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Exercise, ExerciseInput } from '@/types/exercise';
import { useAuth } from '@/context/AuthContext';
import { exerciseApi } from '@/services/DataService';

export const useExercises = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch exercises from Supabase using the centralized DataService.
  const { 
    data: supabaseExercises, 
    isLoading, 
    error,
    isError,
  } = useQuery({
    queryKey: ['exercises'],
    queryFn: exerciseApi.fetchAll,
    enabled: !!user,
  });

  // Mutation for creating a new exercise, now delegated to the DataService.
  const { mutateAsync: createExercise, isPending } = useMutation<Exercise, Error, ExerciseInput>({
    mutationFn: (newExercise: ExerciseInput) => {
      if (!user) {
        throw new Error('User must be authenticated to create exercises.');
      }
      return exerciseApi.create(newExercise, user);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });

  // Mutation for seeding the database, now delegated to the DataService.
  const { mutateAsync: seedDatabase, isPending: isSeeding } = useMutation({
    mutationFn: exerciseApi.seed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });

  return {
    exercises: supabaseExercises || [],
    isLoading,
    createExercise,
    isPending,
    error,
    isError,
    seedDatabase,
    isSeeding,
  };
};
