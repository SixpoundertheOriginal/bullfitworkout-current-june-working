
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Exercise, ExerciseInput } from '@/types/exercise';
import { useAuth } from '@/context/AuthContext';
import { exerciseDatabase } from '@/data/exercises';
import { ExerciseSchema } from '@/types/exercise.schema';
import { z } from 'zod';

// Fetches and validates exercises from Supabase.
const fetchExercisesFromSupabase = async (): Promise<Exercise[]> => {
    const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching exercises from Supabase:', error);
        throw new Error(error.message);
    }

    try {
        // Safely parse and validate the data against our schema.
        // This replaces unsafe casting and correctly handles the 'instructions' field.
        return ExerciseSchema.array().parse(data);
    } catch (e) {
        if (e instanceof z.ZodError) {
            console.error('Zod validation failed for exercises:', e.issues);
        } else {
            console.error('An unexpected error occurred during exercise parsing:', e);
        }
        throw new Error("Failed to parse exercises from the server.");
    }
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

  // Transform local data to match what Supabase expects for insertion.
  const exercisesToSeed = exerciseDatabase.map(({ id, created_at, instructions, ...rest }) => ({
      ...rest,
      // Supabase's JS client expects JSON objects to be stringified for 'json' columns.
      instructions: JSON.stringify(instructions),
  }));

  const { error: insertError } = await supabase
    .from('exercises')
    .insert(exercisesToSeed); // No more `as any` needed.

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
      
      const { instructions, ...restOfExercise } = newExercise;
      
      const exerciseToInsert = {
        ...restOfExercise,
        user_id: user.id,
        // Stringify instructions to match Supabase's expected format for JSON columns.
        instructions: JSON.stringify(instructions), 
      };
      
      const { data, error } = await supabase
        .from('exercises')
        .insert(exerciseToInsert)
        .select()
        .single(); // Use .single() to expect and return a single object

      if (error) {
        console.error('Error creating exercise in Supabase:', error);
        throw error;
      }
      
      // Safely parse the returned data to ensure it matches our app's types.
      return ExerciseSchema.parse(data);
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
