
import { supabase } from '@/integrations/supabase/client';
import { Exercise, ExerciseInput, SupabaseExercise } from '@/types/exercise';
import { exerciseDatabase as localRawExercises } from '@/data/exercises';
import { ExerciseSchema, ExerciseInputSchema, SupabaseExerciseSchema, transformSupabaseExerciseToAppExercise } from '@/types/exercise.schema';
import { z } from 'zod';
import { User } from '@supabase/supabase-js';
import { getExerciseGroup } from '@/utils/exerciseUtils';
import { WorkoutStats } from '@/types/workout-metrics';
import { performanceMonitor } from '@/services/performanceMonitor';

// --- Exercise API ---

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
      const supabaseParseResult = SupabaseExerciseSchema.safeParse(exerciseData);
      
      if (!supabaseParseResult.success) {
        validationErrors.push({ data: exerciseData, error: supabaseParseResult.error });
        continue;
      }

      const appExerciseInput = transformSupabaseExerciseToAppExercise(supabaseParseResult.data);
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

const createExerciseInSupabase = async (newExercise: ExerciseInput, user: User): Promise<Exercise> => {
    const parsedExercise = ExerciseInputSchema.parse(newExercise);
    const { is_bodyweight, load_factor, ...restOfExercise } = parsedExercise;
    
    const exerciseToInsert = {
      ...restOfExercise,
      created_by: user.id,
      instructions: JSON.stringify(restOfExercise.instructions), 
      metadata: {
          ...restOfExercise.metadata,
          load_factor: load_factor ?? 1.0,
      }
    };
    
    const { data, error } = await supabase
      .from('exercises')
      .insert(exerciseToInsert as any)
      .select()
      .single();

    if (error) {
      console.error('Error creating exercise in Supabase:', error);
      throw error;
    }
    
    const supabaseParseResult = SupabaseExerciseSchema.safeParse(data);
    if (!supabaseParseResult.success) {
        console.error("Failed to parse created exercise from Supabase:", supabaseParseResult.error);
        throw new Error("Created exercise has invalid format.");
    }
    const transformed = transformSupabaseExerciseToAppExercise(supabaseParseResult.data);
    return ExerciseSchema.parse(transformed);
};

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

  const exercisesToSeed = localRawExercises.map((exercise) => {
    const { id, created_at, user_id, ...rest } = exercise;
    const parsedForInsert = ExerciseInputSchema.parse(rest);

    return {
        ...parsedForInsert,
        instructions: JSON.stringify(parsedForInsert.instructions),
    };
  });

  const { error: insertError } = await supabase
    .from('exercises')
    .insert(exercisesToSeed as any);

  if (insertError) {
    console.error('Error seeding exercises:', insertError);
    throw insertError;
  }
  
  return { message: 'Database seeded successfully!' };
};

export const exerciseApi = {
  fetchAll: fetchExercisesFromSupabase,
  create: createExerciseInSupabase,
  seed: seedInitialExercises,
};

// --- Workout Stats API ---

const fetchWorkoutStatsFromSupabase = async (
  userId: string,
  dateRange: any,
  weightUnit: string
): Promise<WorkoutStats> => {
  const queryStartTime = performance.now();
  
  const now = new Date();
  const defaultFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const from = dateRange?.from || defaultFrom;
  const to = dateRange?.to || now;
  const adjustedTo = new Date(to);
  adjustedTo.setDate(adjustedTo.getDate() + 1);

  const { data: workoutData, error } = await supabase
    .from('workout_sessions')
    .select('*, duration, exercises:exercise_sets(*)')
    .eq('user_id', userId)
    .gte('start_time', from.toISOString())
    .lt('start_time', adjustedTo.toISOString())
    .order('start_time', { ascending: false });

  if (error) throw error;
  
  const sessions = workoutData || [];
  const queryDuration = performance.now() - queryStartTime;
  
  if (queryDuration > 500) {
    performanceMonitor.trackQuery('workout-stats', queryDuration, false);
  }

  // ... (processing logic is the same as in the original file)
  const totalWorkouts = sessions.length;
  const totalDuration = sessions.reduce((sum, w) => sum + (w.duration || 0), 0);
  const avgDuration = totalWorkouts > 0 ? totalDuration / totalWorkouts : 0;

  let exerciseCount = 0;
  let setCount = 0;
  const typeCounts: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};
  const daysFrequency = { monday: 0, tuesday: 0, wednesday: 0, thursday: 0, friday: 0, saturday: 0, sunday: 0 };
  const durationByTimeOfDay = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  const muscleCounts: Record<string, number> = {};
  const volumeByExercise: Record<string, number> = {};

  sessions.forEach(w => {
    const t = w.training_type || 'Unknown';
    typeCounts[t] = (typeCounts[t] || 0) + 1;

    const dayKey = new Date(w.start_time)
      .toLocaleDateString('en-US', { weekday: 'long' })
      .toLowerCase();
    if (daysFrequency[dayKey] !== undefined) daysFrequency[dayKey]++;

    const hr = new Date(w.start_time).getHours();
    if (hr < 12) durationByTimeOfDay.morning += w.duration || 0;
    else if (hr < 17) durationByTimeOfDay.afternoon += w.duration || 0;
    else if (hr < 21) durationByTimeOfDay.evening += w.duration || 0;
    else durationByTimeOfDay.night += w.duration || 0;

    if (w.metadata && typeof w.metadata === 'object' && w.metadata !== null) {
      const metadataObj = w.metadata as { tags?: string[] };
      if (metadataObj.tags && Array.isArray(metadataObj.tags)) {
        metadataObj.tags.forEach(tag => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    }

    if (Array.isArray(w.exercises)) {
      const names = w.exercises.map((e: any) => e.exercise_name);
      const unique = Array.from(new Set(names));
      exerciseCount += unique.length;
      setCount += w.exercises.length;

      unique.forEach(name => {
        const muscle = getExerciseGroup(name) || 'other';
        muscleCounts[muscle] = (muscleCounts[muscle] || 0) + 1;
      });

      w.exercises.forEach((s: any) => {
        if (s.weight && s.reps && s.completed) {
          volumeByExercise[s.exercise_name] =
            (volumeByExercise[s.exercise_name] || 0) + s.weight * s.reps;
        }
      });
    }
  });

  const workoutTypes = Object.entries(typeCounts)
    .map(([type, count]) => ({ type, count, percentage: (count / totalWorkouts) * 100 }))
    .sort((a, b) => b.count - a.count);

  const tags = Object.entries(tagCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const exerciseVolumeHistory = Object.entries(volumeByExercise)
    .map(([exercise_name, volume]) => ({
      exercise_name,
      trend: 'stable' as const,
      percentChange: 0
    }))
    .sort((a, b) => b.percentChange - a.percentChange)
    .slice(0, 5);

  return {
    totalWorkouts,
    totalExercises: exerciseCount,
    totalSets: setCount,
    totalDuration,
    avgDuration: Math.round(avgDuration),
    workoutTypes,
    tags,
    recommendedType: workoutTypes[0]?.type,
    recommendedDuration: Math.round(avgDuration),
    recommendedTags: tags.slice(0, 3).map(t => t.name),
    progressMetrics: { volumeChangePercentage: 0, strengthTrend: 'stable' as const, consistencyScore: 0 },
    streakDays: 0,
    workouts: sessions,
    timePatterns: { daysFrequency, durationByTimeOfDay },
    muscleFocus: muscleCounts,
    exerciseVolumeHistory,
    lastWorkoutDate: sessions[0]?.start_time
  };
};

export const workoutStatsApi = {
  fetch: fetchWorkoutStatsFromSupabase,
};
