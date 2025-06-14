
import { supabase } from '@/integrations/supabase/client';
import { Exercise, ExerciseInput, SupabaseExercise } from '@/types/exercise';
import { exerciseDatabase as localRawExercises } from '@/data/exercises';
import { ExerciseSchema, ExerciseInputSchema, SupabaseExerciseSchema, transformSupabaseExerciseToAppExercise } from '@/types/exercise.schema';
import { z } from 'zod';
import { User } from '@supabase/supabase-js';
import { getExerciseGroup } from '@/utils/exerciseUtils';
import { WorkoutStats } from '@/types/workout-metrics';
import { performanceMonitor } from '@/services/performanceMonitor';
import { PersonalStats, PersonalMilestone } from '@/types/personal-analytics';
import { subDays, differenceInDays, parseISO } from 'date-fns';

// --- START: Types from workoutHistoryService ---
export interface WorkoutHistoryFilters {
  limit?: number;
  offset?: number;
  startDate?: string | null;
  endDate?: string | null;
  trainingTypes?: string[];
}

export interface EnhancedWorkoutSession {
  id: string;
  name: string;
  start_time: string;
  duration: number;
  training_type: string;
  created_at: string;
  end_time: string;
  is_historical: boolean;
  logged_at: string;
  metadata: any;
  notes: string;
  updated_at: string;
  user_id: string;
  exerciseSets: Array<{
    exercise_name: string;
    id: string;
  }>;
}
// --- END: Types from workoutHistoryService ---


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

// --- Workout History API ---

const getWorkoutHistory = async (filters: WorkoutHistoryFilters = { limit: 30 }) => {
  try {
    const countQuery = supabase
      .from('workout_sessions')
      .select('id', { count: 'exact', head: true });
      
    if (filters.startDate) {
      countQuery.gte('start_time', filters.startDate);
    }
    
    if (filters.endDate) {
      countQuery.lte('start_time', filters.endDate);
    }
    
    if (filters.trainingTypes && filters.trainingTypes.length > 0) {
      countQuery.in('training_type', filters.trainingTypes);
    }
    
    const { count, error: countError } = await countQuery;
    
    if (countError) throw countError;
    
    let query = supabase
      .from('workout_sessions')
      .select('*')
      .order('start_time', { ascending: false });
      
    if (filters.limit) {
      query = query.limit(filters.limit);
    }
    
    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 30) - 1);
    }
    
    if (filters.startDate) {
      query = query.gte('start_time', filters.startDate);
    }
    
    if (filters.endDate) {
      query = query.lte('start_time', filters.endDate);
    }
    
    if (filters.trainingTypes && filters.trainingTypes.length > 0) {
      query = query.in('training_type', filters.trainingTypes);
    }
    
    const { data, error: workoutsError } = await query;
    
    if (workoutsError) throw workoutsError;
    
    const exerciseCountData: Record<string, { exercises: number; sets: number }> = {};
    
    if (data) {
      // Fetch exercise sets for all workouts in one batch
      const workoutIds = data.map(w => w.id);
      const { data: allExerciseSets, error: exerciseSetsError } = await supabase
        .from('exercise_sets')
        .select('workout_id, exercise_name, id')
        .in('workout_id', workoutIds);
        
      if (exerciseSetsError) throw exerciseSetsError;
      
      // Group exercise sets by workout
      const exerciseSetsByWorkout: Record<string, Array<{exercise_name: string, id: string}>> = {};
      (allExerciseSets || []).forEach(set => {
        if (!exerciseSetsByWorkout[set.workout_id]) {
          exerciseSetsByWorkout[set.workout_id] = [];
        }
        exerciseSetsByWorkout[set.workout_id].push({
          exercise_name: set.exercise_name,
          id: set.id
        });
      });
      
      // Create enhanced workout objects with exercise sets
      const enhancedWorkouts: EnhancedWorkoutSession[] = data.map(workout => ({
        ...workout,
        exerciseSets: exerciseSetsByWorkout[workout.id] || []
      }));
      
      // Calculate exercise counts
      enhancedWorkouts.forEach(workout => {
        const exerciseNames = new Set(workout.exerciseSets.map(set => set.exercise_name));
        exerciseCountData[workout.id] = {
          exercises: exerciseNames.size,
          sets: workout.exerciseSets.length
        };
      });
      
      return {
        workouts: enhancedWorkouts,
        exerciseCounts: exerciseCountData,
        totalCount: count || 0
      };
    }
    
    return {
      workouts: [] as EnhancedWorkoutSession[],
      exerciseCounts: exerciseCountData,
      totalCount: count || 0
    };
  } catch (err) {
    console.error('Error fetching workout history:', err);
    throw err;
  }
};

interface WorkoutSet {
  weight: number;
  reps: number;
  completed?: boolean;
}

const getWorkoutDetails = async (workoutIds: string[]) => {
  if (workoutIds.length === 0) return {};

  const { data: allSets, error } = await supabase
    .from('exercise_sets')
    .select('workout_id, exercise_name, weight, reps, completed')
    .in('workout_id', workoutIds);
  
  if (error) throw error;

  const setsByWorkout: Record<string, { exercise_name: string | null; weight: number | null; reps: number | null; completed: boolean | null }[]> = {};
  (allSets || []).forEach(set => {
    if (!setsByWorkout[set.workout_id]) {
      setsByWorkout[set.workout_id] = [];
    }
    setsByWorkout[set.workout_id].push(set);
  });
  
  const workoutsWithDetails: Record<string, { exercises: Record<string, WorkoutSet[]> }> = {};
  workoutIds.forEach(id => {
    const workoutSets = setsByWorkout[id] || [];
    const exercises: Record<string, WorkoutSet[]> = {};
    workoutSets.forEach(set => {
      const exerciseName = set.exercise_name || 'Unknown Exercise';
      if (!exercises[exerciseName]) {
        exercises[exerciseName] = [];
      }
      exercises[exerciseName].push({ weight: set.weight || 0, reps: set.reps || 0, completed: set.completed ?? true });
    });
    workoutsWithDetails[id] = { exercises };
  });

  return workoutsWithDetails;
};

export const workoutHistoryApi = {
  fetch: getWorkoutHistory,
  fetchDetails: getWorkoutDetails,
};

// --- Personal Stats API ---

function calculateTrend(exerciseSets: any[]): 'increasing' | 'decreasing' | 'stable' | 'new' {
  if (exerciseSets.length < 3) return 'new';

  const recentSets = exerciseSets.slice(-6);
  if (recentSets.length < 6) return 'stable';

  const firstHalf = recentSets.slice(0, 3);
  const secondHalf = recentSets.slice(3, 6);

  const firstHalfAvg = firstHalf.reduce((sum, set) => sum + (set.weight * set.reps), 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, set) => sum + (set.weight * set.reps), 0) / secondHalf.length;

  const improvement = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

  if (improvement > 5) return 'increasing';
  if (improvement < -5) return 'decreasing';
  return 'stable';
}

function calculateProgressPercentage(exerciseSets: any[]): number {
  if (exerciseSets.length < 2) return 0;

  const thirtyDaysAgo = subDays(new Date(), 30);
  const recentSets = exerciseSets.filter(set => 
    parseISO(set.created_at) >= thirtyDaysAgo
  );

  if (recentSets.length < 2) return 0;

  const firstVolume = recentSets[0].weight * recentSets[0].reps;
  const lastVolume = recentSets[recentSets.length - 1].weight * recentSets[recentSets.length - 1].reps;

  return Math.round(((lastVolume - firstVolume) / firstVolume) * 100);
}

function determineReadyToProgress(exerciseSets: any[], daysSinceLastPerformed: number): boolean {
  if (exerciseSets.length < 3) return false;
  if (daysSinceLastPerformed > 14) return false;

  const lastThreeSets = exerciseSets.slice(-3);
  const volumes = lastThreeSets.map(set => set.weight * set.reps);
  const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
  
  return volumes.every(vol => Math.abs((vol - avgVolume) / avgVolume) < 0.05);
}

function generateMilestones(exerciseSets: any[]): PersonalMilestone[] {
  const milestones: PersonalMilestone[] = [];

  if (exerciseSets.length === 1) {
    milestones.push({
      type: 'first_time',
      value: 1,
      date: exerciseSets[0].created_at,
      description: 'First time performing this exercise'
    });
  }

  const totalVolume = exerciseSets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
  const volumeMilestones = [1000, 5000, 10000, 25000, 50000, 100000];
  
  volumeMilestones.forEach(milestone => {
    if (totalVolume >= milestone) {
      milestones.push({
        type: 'volume_milestone',
        value: milestone,
        date: new Date().toISOString(),
        description: `Reached ${milestone.toLocaleString()} total volume`
      });
    }
  });

  const sessions = new Set(exerciseSets.map(set => set.workout_id)).size;
  const consistencyMilestones = [5, 10, 25, 50, 100];
  
  consistencyMilestones.forEach(milestone => {
    if (sessions >= milestone) {
      milestones.push({
        type: 'consistency',
        value: milestone,
        date: new Date().toISOString(),
        description: `Completed ${milestone} sessions`
      });
    }
  });

  return milestones.slice(-5);
}

async function fetchPersonalStats(userId: string, exerciseId: string): Promise<PersonalStats | null> {
  if (!userId || !exerciseId) return null;

  const { data: exerciseSets, error: setsError } = await supabase
    .from('exercise_sets')
    .select(`
      *,
      workout_sessions!inner(*)
    `)
    .eq('exercise_name', exerciseId)
    .eq('workout_sessions.user_id', userId)
    .order('created_at', { ascending: true });

  if (setsError) throw setsError;

  if (!exerciseSets || exerciseSets.length === 0) {
    return {
      exerciseId,
      userId,
      totalSessions: 0,
      totalVolume: 0,
      personalBest: null,
      lastPerformed: null,
      averageWeight: 0,
      averageReps: 0,
      trend: 'new',
      progressPercentage: 0,
      daysSinceLastPerformed: 0,
      isReadyToProgress: false,
      milestones: []
    };
  }

  const totalSessions = new Set(exerciseSets.map(set => set.workout_id)).size;
  const totalVolume = exerciseSets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
  const averageWeight = exerciseSets.reduce((sum, set) => sum + set.weight, 0) / exerciseSets.length;
  const averageReps = exerciseSets.reduce((sum, set) => sum + set.reps, 0) / exerciseSets.length;

  const personalBest = exerciseSets.reduce((best, set) => {
    const volume = set.weight * set.reps;
    const bestVolume = best ? best.weight * best.reps : 0;
    
    if (volume > bestVolume) {
      return {
        weight: set.weight,
        reps: set.reps,
        date: set.created_at
      };
    }
    return best;
  }, null as { weight: number; reps: number; date: string } | null);

  const lastPerformed = exerciseSets[exerciseSets.length - 1]?.created_at || null;
  const daysSinceLastPerformed = lastPerformed 
    ? differenceInDays(new Date(), parseISO(lastPerformed))
    : 0;

  const trend = calculateTrend(exerciseSets);
  const progressPercentage = calculateProgressPercentage(exerciseSets);
  const isReadyToProgress = determineReadyToProgress(exerciseSets, daysSinceLastPerformed);
  const milestones = generateMilestones(exerciseSets);

  return {
    exerciseId,
    userId,
    totalSessions,
    totalVolume,
    personalBest,
    lastPerformed,
    averageWeight,
    averageReps,
    trend,
    progressPercentage,
    daysSinceLastPerformed,
    isReadyToProgress,
    milestones
  };
}

async function fetchMultiplePersonalStats(userId: string, exerciseIds: string[]): Promise<Record<string, PersonalStats | null>> {
  if (!userId || exerciseIds.length === 0) return {};

  const statsPromises = exerciseIds.map(async (exerciseId) => {
    const stats = await fetchPersonalStats(userId, exerciseId);
    return [exerciseId, stats] as const;
  });

  const results = await Promise.all(statsPromises);
  return Object.fromEntries(results.filter(([_, stats]) => stats !== null));
}

export const personalStatsApi = {
  fetch: fetchPersonalStats,
  fetchMultiple: fetchMultiplePersonalStats
};

// --- Calendar API ---

const fetchWorkoutDatesForMonth = async (userId: string, year: number, month: number) => {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('id, start_time')
    .eq('user_id', userId)
    .gte('start_time', startDate.toISOString())
    .lte('start_time', endDate.toISOString());
  
  if (error) throw error;
  
  const workoutDates: { [date: string]: number; } = {};
  
  (data || []).forEach(workout => {
    const dateStr = workout.start_time.split('T')[0];
    workoutDates[dateStr] = (workoutDates[dateStr] || 0) + 1;
  });
  
  return workoutDates;
};

const fetchWorkoutsForDayWithSets = async (userId: string, date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const { data: workouts, error: workoutsError } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString())
        .order('start_time', { ascending: false });

    if (workoutsError) throw workoutsError;
    if (!workouts || workouts.length === 0) {
        return { workouts: [], setsByWorkout: {} };
    }

    const workoutIds = workouts.map(w => w.id);
      
    const { data: sets, error: setsError } = await supabase
        .from('exercise_sets')
        .select('*')
        .in('workout_id', workoutIds);
    
    if (setsError) throw setsError;

    const setsByWorkout: Record<string, any[]> = {};
    (sets || []).forEach(set => {
        if (!setsByWorkout[set.workout_id]) {
            setsByWorkout[set.workout_id] = [];
        }
        setsByWorkout[set.workout_id].push(set);
    });

    return { workouts, setsByWorkout };
};

export const calendarApi = {
  fetchWorkoutDatesForMonth,
  fetchWorkoutsForDayWithSets,
};
