
import { supabase } from '@/integrations/supabase/client';
import { Exercise, ExerciseInput } from '@/types/exercise';
import { transformSupabaseExerciseToAppExercise, SupabaseExerciseSchema, ExerciseSchema } from '@/types/exercise.schema';
import { exerciseDatabase } from '@/data/exercises';

// Emergency data recovery: Enhanced transformation with validation bypass
const safeTransformExercise = (supabaseExercise: any): Exercise | null => {
  try {
    // First attempt: Full validation path
    const validatedSupabaseExercise = SupabaseExerciseSchema.parse(supabaseExercise);
    const transformedExercise = transformSupabaseExerciseToAppExercise(validatedSupabaseExercise);
    return ExerciseSchema.parse(transformedExercise);
  } catch (validationError) {
    console.warn(`[DataService] Primary validation failed for exercise "${supabaseExercise?.name}", attempting recovery:`, validationError);
    
    try {
      // Emergency bypass: Skip strict validation, apply minimal transformation
      const recoveredExercise: Exercise = {
        id: supabaseExercise.id || `recovery-${Date.now()}`,
        name: supabaseExercise.name || 'Unknown Exercise',
        description: supabaseExercise.description || '',
        primary_muscle_groups: Array.isArray(supabaseExercise.primary_muscle_groups) ? supabaseExercise.primary_muscle_groups : [],
        secondary_muscle_groups: Array.isArray(supabaseExercise.secondary_muscle_groups) ? supabaseExercise.secondary_muscle_groups : [],
        equipment_type: Array.isArray(supabaseExercise.equipment_type) ? supabaseExercise.equipment_type : [],
        difficulty: supabaseExercise.difficulty || 'beginner',
        movement_pattern: supabaseExercise.movement_pattern || 'custom',
        is_compound: Boolean(supabaseExercise.is_compound),
        is_bodyweight: Array.isArray(supabaseExercise.equipment_type) ? supabaseExercise.equipment_type.includes('bodyweight') : false,
        instructions: supabaseExercise.instructions || { steps: '', form: '' },
        user_id: supabaseExercise.created_by || null,
        created_at: supabaseExercise.created_at || new Date().toISOString(),
        tips: Array.isArray(supabaseExercise.tips) ? supabaseExercise.tips : [],
        variations: Array.isArray(supabaseExercise.variations) ? supabaseExercise.variations : [],
        metadata: supabaseExercise.metadata || {},
        load_factor: supabaseExercise.metadata?.load_factor || 1.0,
        // Emergency bypass: Always set new fields to null for compatibility
        family_id: null,
        parent_exercise_id: null,
        variation_parameters: null,
      };
      
      console.log(`[DataService] ✅ Emergency recovery successful for exercise: ${recoveredExercise.name}`);
      return recoveredExercise;
    } catch (recoveryError) {
      console.error(`[DataService] ❌ Emergency recovery failed for exercise "${supabaseExercise?.name}":`, recoveryError);
      return null;
    }
  }
};

const fetchExercisesFromSupabase = async (): Promise<Exercise[]> => {
  try {
    console.log('[DataService] Fetching exercises from Supabase...');
    
    const { data: rawExercises, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name');

    if (error) {
      console.error('[DataService] Supabase fetch error:', error);
      throw error;
    }

    if (!rawExercises || rawExercises.length === 0) {
      console.log('[DataService] No exercises found in Supabase, returning empty array');
      return [];
    }

    console.log(`[DataService] Retrieved ${rawExercises.length} raw exercises from Supabase`);

    // Enhanced transformation with emergency recovery
    const transformedExercises: Exercise[] = [];
    const failedExercises: Array<{ name: string; id: string; issues: any }> = [];

    for (const rawExercise of rawExercises) {
      const transformed = safeTransformExercise(rawExercise);
      if (transformed) {
        transformedExercises.push(transformed);
      } else {
        failedExercises.push({
          name: rawExercise.name || 'Unknown',
          id: rawExercise.id || 'No ID',
          issues: 'Complete transformation failure'
        });
      }
    }

    // Enhanced logging with recovery statistics
    const successRate = (transformedExercises.length / rawExercises.length) * 100;
    
    if (failedExercises.length > 0) {
      console.warn(`[Data Recovery Alert] ${failedExercises.length}/${rawExercises.length} exercises failed emergency recovery (${successRate.toFixed(1)}% success rate):`, failedExercises);
    } else {
      console.log(`[DataService] ✅ All ${transformedExercises.length} exercises successfully loaded (100% success rate)`);
    }

    return transformedExercises;

  } catch (error) {
    console.error('[DataService] Critical error in fetchExercisesFromSupabase:', error);
    
    // Ultimate fallback: Return local exercise database
    console.log('[DataService] 🚨 Activating ultimate fallback to local exercise database');
    return exerciseDatabase || [];
  }
};

const createExercise = async (exerciseData: ExerciseInput, user: any): Promise<Exercise> => {
  try {
    console.log('[DataService] Creating new exercise:', exerciseData.name);
    
    // Prepare data for Supabase insertion with emergency compatibility
    const supabaseData = {
      name: exerciseData.name,
      description: exerciseData.description || '',
      primary_muscle_groups: exerciseData.primary_muscle_groups || [],
      secondary_muscle_groups: exerciseData.secondary_muscle_groups || [],
      equipment_type: exerciseData.equipment_type || [],
      difficulty: exerciseData.difficulty || 'beginner',
      movement_pattern: exerciseData.movement_pattern || 'custom',
      is_compound: exerciseData.is_compound || false,
      instructions: exerciseData.instructions || { steps: '', form: '' },
      tips: exerciseData.tips || [],
      variations: exerciseData.variations || [],
      metadata: {
        ...exerciseData.metadata,
        load_factor: exerciseData.load_factor || 1.0,
      },
      created_by: user.id,
      // Set new fields to null for now (will be populated later in Phase 2)
      family_id: null,
      parent_exercise_id: null,
      variation_parameters: null,
    };

    const { data, error } = await supabase
      .from('exercises')
      .insert([supabaseData])
      .select()
      .single();

    if (error) {
      console.error('[DataService] Error creating exercise:', error);
      throw new Error(`Failed to create exercise: ${error.message}`);
    }

    console.log('[DataService] ✅ Exercise created successfully:', data.name);
    
    // Transform the returned data using our safe transformation
    const transformedExercise = safeTransformExercise(data);
    if (!transformedExercise) {
      throw new Error('Failed to transform newly created exercise');
    }
    
    return transformedExercise;

  } catch (error) {
    console.error('[DataService] Critical error creating exercise:', error);
    throw error;
  }
};

const seed = async (): Promise<void> => {
    try {
      console.log('[DataService] Seeding database with initial exercises...');
  
      // Map each exercise from the local database to a Supabase-compatible format
      const supabaseExercises = exerciseDatabase.map(exercise => ({
        id: exercise.id,
        name: exercise.name,
        description: exercise.description,
        primary_muscle_groups: exercise.primary_muscle_groups,
        secondary_muscle_groups: exercise.secondary_muscle_groups,
        equipment_type: exercise.equipment_type,
        difficulty: exercise.difficulty,
        movement_pattern: exercise.movement_pattern,
        is_compound: exercise.is_compound,
        instructions: exercise.instructions,
        tips: exercise.tips,
        variations: exercise.variations,
        metadata: exercise.metadata,
        created_by: exercise.user_id,
        created_at: exercise.created_at,
        family_id: exercise.family_id,
        parent_exercise_id: exercise.parent_exercise_id,
        variation_parameters: exercise.variation_parameters,
      }));
  
      // Insert the exercises into the Supabase table
      const { data, error } = await supabase
        .from('exercises')
        .insert(supabaseExercises);
  
      if (error) {
        console.error('[DataService] Error seeding database:', error);
        throw new Error(`Database seeding failed: ${error.message}`);
      }
  
      console.log(`[DataService] Database seeded successfully with ${supabaseExercises.length} exercises.`);
    } catch (error) {
      console.error('[DataService] Critical error during database seeding:', error);
      throw error;
    }
  };

export const exerciseApi = {
  fetchAll: fetchExercisesFromSupabase,
  create: createExercise,
  seed: seed
};
