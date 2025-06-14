
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Exercise, ExerciseInput } from '@/types/exercise';
import { useAuth } from '@/context/AuthContext';
import { exerciseDatabase } from '@/data/exercises';

// Fetches all exercises from the Supabase 'exercises' table.
const fetchExercisesFromSupabase = async () => {
    const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching exercises from Supabase:', error);
        throw new Error(error.message);
    }
    // Casting to unknown first resolves the type incompatibility for the 'instructions' JSON field.
    return data as unknown as Exercise[];
};

// Seeds the database with initial exercises if it's empty.
const seedInitialExercises = async () => {
  const { count, error: countError } = await supabase
    .from('exercises')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('Error counting exercises:', countError);
    throw countError;
  }
  
  if (count !== null && count > 0) {
    return { message: 'Database already seeded.' };
  }

  // Remove local 'id' and 'created_at' to let Supabase auto-generate them.
  const exercisesToSeed = exerciseDatabase.map(({ id, created_at, ...rest }) => rest);

  const { error: insertError } = await supabase
    .from('exercises')
    .insert(exercisesToSeed as any); // Use `as any` to bypass strict type check mismatch.

  if (insertError) {
    console.error('Error seeding exercises:', insertError);
    throw insertError;
  }
  
  return { message: 'Database seeded successfully!' };
};


export const useExercises = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch exercises from Supabase, but only if the user is logged in.
  const { 
    data: supabaseExercises, 
    isLoading: isLoadingSupabase, 
    error: supabaseError,
    isError: isSupabaseError,
  } = useQuery({
    queryKey: ['exercises'],
    queryFn: fetchExercisesFromSupabase,
    enabled: !!user,
  });

  // Mutation for creating a new exercise in Supabase.
  const { mutateAsync: createExercise, isPending } = useMutation<Exercise, Error, ExerciseInput>({
    mutationFn: async (newExercise: ExerciseInput) => {
      if (!user) {
        throw new Error('User must be authenticated to create exercises.');
      }
      
      const exerciseToInsert = { ...newExercise, user_id: user.id };
      
      const { data, error } = await supabase
        .from('exercises')
        .insert([exerciseToInsert] as any) // Use `as any` to bypass strict type check mismatch.
        .select();

      if (error) {
        console.error('Error creating exercise in Supabase:', error);
        throw error;
      }
      
      return data[0] as Exercise; // Cast the return type to match the mutation definition.
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });

  // Mutation for seeding the database.
  const { mutateAsync: seedDatabase, isPending: isSeeding } = useMutation({
    mutationFn: seedInitialExercises,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
  });

  // Hybrid logic: return Supabase data for logged-in users, otherwise local data.
  const exercises = user ? supabaseExercises : exerciseDatabase;
  const isLoading = user ? isLoadingSupabase : false;
  const error = user ? supabaseError : null;
  const isError = user ? isSupabaseError : false;

  return {
    exercises: exercises || [],
    isLoading,
    createExercise,
    isPending,
    error,
    isError,
    seedDatabase,
    isSeeding,
  };
};
