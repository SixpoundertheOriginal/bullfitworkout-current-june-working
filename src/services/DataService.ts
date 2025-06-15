
import { supabase } from '@/integrations/supabase/client';
import { Exercise, ExerciseInput, SupabaseExercise } from '@/types/exercise';
import { transformSupabaseExerciseToAppExercise, SupabaseExerciseSchema, ExerciseSchema } from '@/types/exercise.schema';
import { exerciseDatabase } from '@/data/exercises';
import { WorkoutStats } from '@/types/workout-metrics';
import { PersonalStats } from '@/types/personal-analytics';

// Enhanced type definitions for DataService APIs
export interface WorkoutHistoryFilters {
  limit?: number;
  offset?: number;
  startDate?: string;
  endDate?: string;
  trainingTypes?: string[];
}

export interface EnhancedWorkoutSession {
  id: string;
  name: string;
  start_time: string;
  duration: number;
  training_type: string;
  exerciseSets: Array<{
    exercise_name: string;
    id: string;
  }>;
}

export interface WorkoutHistoryResponse {
  workouts: EnhancedWorkoutSession[];
  exerciseCounts: Record<string, number>;
  totalCount: number;
}

export interface WorkoutDetailsResponse {
  [workoutId: string]: {
    exercises: Record<string, any[]>;
  };
}

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

// Workout Stats API
const fetchWorkoutStats = async (userId: string, dateRange: any, weightUnit: string): Promise<WorkoutStats> => {
  try {
    console.log('[DataService] Fetching workout stats for user:', userId);
    
    // Mock implementation - replace with actual Supabase queries
    return {
      totalWorkouts: 0,
      totalExercises: 0,
      totalSets: 0,
      totalDuration: 0,
      avgDuration: 0,
      workoutTypes: [],
      tags: [],
      recommendedType: undefined,
      recommendedDuration: 0,
      recommendedTags: [],
      progressMetrics: { volumeChangePercentage: 0, strengthTrend: 'stable', consistencyScore: 0 },
      streakDays: 0,
      workouts: [],
      timePatterns: {
        daysFrequency: { monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0 },
        durationByTimeOfDay: { morning: 0, afternoon: 0, evening: 0, night: 0 }
      },
      muscleFocus: {},
      exerciseVolumeHistory: [],
      lastWorkoutDate: undefined
    };
  } catch (error) {
    console.error('[DataService] Error fetching workout stats:', error);
    throw error;
  }
};

// Personal Stats API
const fetchPersonalStats = async (userId: string, exerciseId: string): Promise<PersonalStats> => {
  try {
    console.log('[DataService] Fetching personal stats for exercise:', exerciseId);
    
    // Mock implementation - replace with actual Supabase queries
    return {
      personalBest: null,
      trend: 'stable',
      isReadyToProgress: false,
      daysSinceLastPerformed: 0,
      milestones: [],
      totalSessions: 0
    };
  } catch (error) {
    console.error('[DataService] Error fetching personal stats:', error);
    throw error;
  }
};

const fetchMultiplePersonalStats = async (userId: string, exerciseIds: string[]): Promise<Record<string, PersonalStats>> => {
  try {
    console.log('[DataService] Fetching multiple personal stats for exercises:', exerciseIds);
    
    // Mock implementation - replace with actual Supabase queries
    const stats: Record<string, PersonalStats> = {};
    exerciseIds.forEach(id => {
      stats[id] = {
        personalBest: null,
        trend: 'stable',
        isReadyToProgress: false,
        daysSinceLastPerformed: 0,
        milestones: [],
        totalSessions: 0
      };
    });
    
    return stats;
  } catch (error) {
    console.error('[DataService] Error fetching multiple personal stats:', error);
    throw error;
  }
};

// Workout History API
const fetchWorkoutHistory = async (filters: WorkoutHistoryFilters): Promise<WorkoutHistoryResponse> => {
  try {
    console.log('[DataService] Fetching workout history with filters:', filters);
    
    // Mock implementation - replace with actual Supabase queries
    return {
      workouts: [],
      exerciseCounts: {},
      totalCount: 0
    };
  } catch (error) {
    console.error('[DataService] Error fetching workout history:', error);
    throw error;
  }
};

const fetchWorkoutDetails = async (workoutIds: string[]): Promise<WorkoutDetailsResponse> => {
  try {
    console.log('[DataService] Fetching workout details for IDs:', workoutIds);
    
    // Mock implementation - replace with actual Supabase queries
    const details: WorkoutDetailsResponse = {};
    workoutIds.forEach(id => {
      details[id] = { exercises: {} };
    });
    
    return details;
  } catch (error) {
    console.error('[DataService] Error fetching workout details:', error);
    throw error;
  }
};

// Calendar API
const fetchWorkoutDatesForMonth = async (userId: string, year: number, month: number): Promise<Record<string, number>> => {
  try {
    console.log('[DataService] Fetching workout dates for month:', { userId, year, month });
    
    // Mock implementation - replace with actual Supabase queries
    return {};
  } catch (error) {
    console.error('[DataService] Error fetching workout dates:', error);
    throw error;
  }
};

const fetchWorkoutsForDayWithSets = async (userId: string, date: Date): Promise<{ workouts: any[], setsByWorkout: Record<string, any[]> }> => {
  try {
    console.log('[DataService] Fetching workouts for day:', { userId, date });
    
    // Mock implementation - replace with actual Supabase queries
    return {
      workouts: [],
      setsByWorkout: {}
    };
  } catch (error) {
    console.error('[DataService] Error fetching workouts for day:', error);
    throw error;
  }
};

// Export all APIs
export const exerciseApi = {
  fetchAll: fetchExercisesFromSupabase,
  create: createExercise,
  seed: seed
};

export const workoutStatsApi = {
  fetch: fetchWorkoutStats
};

export const personalStatsApi = {
  fetch: fetchPersonalStats,
  fetchMultiple: fetchMultiplePersonalStats
};

export const workoutHistoryApi = {
  fetch: fetchWorkoutHistory,
  fetchDetails: fetchWorkoutDetails
};

export const calendarApi = {
  fetchWorkoutDatesForMonth,
  fetchWorkoutsForDayWithSets
};
