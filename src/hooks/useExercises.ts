
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Exercise, ExerciseInput } from '@/types/exercise';
import { useAuth } from '@/context/AuthContext';
import { exerciseDatabase } from '@/data/exercises';
import { ExerciseSchema, ExerciseInputSchema } from '@/types/exercise.schema';
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
        // Use the strict ExerciseSchema to parse data from Supabase.
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

  // Transform and validate local data before inserting it into Supabase.
  const exercisesToSeed = exerciseDatabase.map((exercise) => {
    const { id, created_at, user_id, ...rest } = exercise;
    // Parse with ExerciseInputSchema to ensure it matches the shape for creation
    const parsedForInsert = ExerciseInputSchema.parse(rest);

    return {
        ...parsedForInsert,
        // Supabase's JS client expects JSON objects to be stringified for 'json' columns.
        instructions: JSON.stringify(parsedForInsert.instructions),
    };
  });

  const { error: insertError } = await supabase
    .from('exercises')
    // Using `as any` here to bypass a TypeScript error. Zod's `parse` above ensures
    // the data has the correct shape with defaults, but `z.infer` doesn't reflect this
    // in the type, causing a mismatch with Supabase's strict insert types.
    .insert(exercisesToSeed as any);

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
      
      // Validate and apply defaults using the schema before preparing for insert.
      const parsedExercise = ExerciseInputSchema.parse(newExercise);
      const { instructions, ...restOfExercise } = parsedExercise;
      
      const exerciseToInsert = {
        ...restOfExercise,
        user_id: user.id,
        // Stringify instructions to match Supabase's expected format for JSON columns.
        instructions: JSON.stringify(instructions), 
      };
      
      const { data, error } = await supabase
        .from('exercises')
        // Using `as any` here to bypass a TypeScript error. Zod's `parse` above ensures
        // the data has the correct shape with defaults, but `z.infer` doesn't reflect this
        // in the type, causing a mismatch with Supabase's strict insert types.
        .insert(exerciseToInsert as any)
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
