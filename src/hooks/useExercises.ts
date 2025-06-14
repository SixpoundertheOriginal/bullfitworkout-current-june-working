
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Exercise, ExerciseInput, SupabaseExercise } from '@/types/exercise';
import { useAuth } from '@/context/AuthContext';
import { exerciseDatabase as localRawExercises } from '@/data/exercises';
import { ExerciseSchema, ExerciseInputSchema, SupabaseExerciseSchema, transformSupabaseExerciseToAppExercise } from '@/types/exercise.schema';
import { z } from 'zod';

// Fetches exercises, validates against Supabase schema, transforms, and validates against app schema.
const fetchExercisesFromSupabase = async (): Promise<Exercise[]> => {
    const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        console.error('Error fetching exercises from Supabase:', error);
        throw new Error(error.message);
    }

    if (!data) return [];
    
    const validatedExercises: Exercise[] = [];
    const validationErrors: { data: any, error: z.ZodError }[] = [];

    for (const exerciseData of data) {
      // Step 1: Parse with the forgiving Supabase schema
      const supabaseParseResult = SupabaseExerciseSchema.safeParse(exerciseData);
      
      if (!supabaseParseResult.success) {
        validationErrors.push({ data: exerciseData, error: supabaseParseResult.error });
        continue; // Skip to next exercise if initial parsing fails
      }

      // Step 2: Transform the valid Supabase data into our app's data model
      const appExerciseInput = transformSupabaseExerciseToAppExercise(supabaseParseResult.data);

      // Step 3: Validate the transformed data against our strict app schema
      const appParseResult = ExerciseSchema.safeParse(appExerciseInput);

      if (appParseResult.success) {
        validatedExercises.push(appParseResult.data);
      } else {
        validationErrors.push({ data: exerciseData, error: appParseResult.error });
      }
    }

    if (validationErrors.length > 0) {
      console.warn(
        `[Data Quality Alert] ${validationErrors.length}/${data.length} exercises failed validation or transformation.`,
        validationErrors.map(e => ({ 
            name: e.data.name, 
            id: e.data.id,
            issues: e.error.flatten().fieldErrors 
        }))
      );
    }
    
    return validatedExercises;
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
  const exercisesToSeed = localRawExercises.map((exercise) => {
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

// The local exercise data and its validation have been removed to enforce
// Supabase as the single source of truth for a scalable architecture.

export const useExercises = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch exercises from Supabase, but only if the user is logged in.
  const { 
    data: supabaseExercises, 
    isLoading, 
    error,
    isError,
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
      
      // Validate and apply defaults using the input schema.
      const parsedExercise = ExerciseInputSchema.parse(newExercise);
      // Destructure to separate client-only fields and prepare for Supabase.
      const { is_bodyweight, load_factor, ...restOfExercise } = parsedExercise;
      
      const exerciseToInsert = {
        ...restOfExercise,
        created_by: user.id, // Correct field name for Supabase.
        // Stringify instructions for Supabase's JSON column.
        instructions: JSON.stringify(restOfExercise.instructions), 
        // Embed load_factor into metadata for persistence.
        metadata: {
            ...restOfExercise.metadata,
            load_factor: load_factor ?? 1.0,
        }
      };
      
      const { data, error } = await supabase
        .from('exercises')
        .insert(exerciseToInsert as any)
        .select()
        .single(); // Expect and return a single object.

      if (error) {
        console.error('Error creating exercise in Supabase:', error);
        throw error;
      }
      
      // Use the same robust pipeline to parse the newly created exercise.
      const supabaseParseResult = SupabaseExerciseSchema.safeParse(data);
      if (!supabaseParseResult.success) {
          console.error("Failed to parse created exercise from Supabase:", supabaseParseResult.error);
          throw new Error("Created exercise has invalid format.");
      }
      const transformed = transformSupabaseExerciseToAppExercise(supabaseParseResult.data);
      // This final parse ensures the returned object is safe for app use.
      return ExerciseSchema.parse(transformed);
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

  // Data now comes exclusively from Supabase. No more local fallback.
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
