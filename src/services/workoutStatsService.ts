
import { supabase } from '@/integrations/supabase/client';
import { WorkoutStats } from '@/types/workout-metrics';
import { DateRange } from 'react-day-picker';

// Real implementation using Supabase queries
const fetchWorkoutStats = async (userId: string, dateRange: DateRange | undefined, weightUnit: string): Promise<WorkoutStats> => {
  try {
    console.log('[WorkoutStatsService] Fetching real workout stats for user:', userId);
    
    // Build date filters
    let startDate: string | undefined;
    let endDate: string | undefined;
    
    if (dateRange?.from) {
      startDate = dateRange.from.toISOString();
    }
    if (dateRange?.to) {
      endDate = dateRange.to.toISOString();
    }

    // Fetch workout sessions with exercise sets
    let workoutQuery = supabase
      .from('workout_sessions')
      .select(`
        id,
        name,
        start_time,
        duration,
        training_type,
        notes,
        exercise_sets (
          id,
          exercise_name,
          weight,
          reps,
          completed,
          set_number,
          rest_time
        )
      `)
      .eq('user_id', userId)
      .order('start_time', { ascending: false });

    if (startDate) {
      workoutQuery = workoutQuery.gte('start_time', startDate);
    }
    if (endDate) {
      workoutQuery = workoutQuery.lte('start_time', endDate);
    }

    const { data: workouts, error } = await workoutQuery;

    if (error) {
      console.error('[WorkoutStatsService] Error fetching workouts:', error);
      throw error;
    }

    const safeWorkouts = workouts || [];
    console.log('[WorkoutStatsService] Fetched workouts:', safeWorkouts.length);

    // Calculate basic stats
    const totalWorkouts = safeWorkouts.length;
    const totalDuration = safeWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

    // Calculate exercise and sets stats
    const allSets = safeWorkouts.flatMap(w => w.exercise_sets || []);
    const totalSets = allSets.length;
    const completedSets = allSets.filter(s => s.completed).length;
    const uniqueExercises = new Set(allSets.map(s => s.exercise_name)).size;

    // Calculate workout type distribution
    const typeCount: Record<string, number> = {};
    safeWorkouts.forEach(workout => {
      const type = workout.training_type || 'General';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });

    const workoutTypes = Object.entries(typeCount).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / Math.max(totalWorkouts, 1)) * 100)
    }));

    // Calculate volume and progression metrics
    const totalVolume = allSets
      .filter(s => s.completed)
      .reduce((sum, s) => sum + (s.weight * s.reps), 0);

    // Calculate time patterns
    const daysFrequency = {
      monday: 0, tuesday: 0, wednesday: 0, thursday: 0,
      friday: 0, saturday: 0, sunday: 0
    };

    const durationByTimeOfDay = {
      morning: 0, afternoon: 0, evening: 0, night: 0
    };

    safeWorkouts.forEach(workout => {
      const date = new Date(workout.start_time);
      const dayName = date.toLocaleDateString('en-US', { weekday: 'lowercase' }) as keyof typeof daysFrequency;
      if (daysFrequency.hasOwnProperty(dayName)) {
        daysFrequency[dayName]++;
      }

      const hour = date.getHours();
      if (hour >= 6 && hour < 12) {
        durationByTimeOfDay.morning += workout.duration || 0;
      } else if (hour >= 12 && hour < 17) {
        durationByTimeOfDay.afternoon += workout.duration || 0;
      } else if (hour >= 17 && hour < 22) {
        durationByTimeOfDay.evening += workout.duration || 0;
      } else {
        durationByTimeOfDay.night += workout.duration || 0;
      }
    });

    // Calculate muscle focus from exercise names (simple heuristic)
    const muscleFocus: Record<string, number> = {};
    allSets.forEach(set => {
      const exerciseName = set.exercise_name.toLowerCase();
      let muscleGroup = 'other';
      
      if (exerciseName.includes('bench') || exerciseName.includes('chest')) {
        muscleGroup = 'chest';
      } else if (exerciseName.includes('squat') || exerciseName.includes('leg')) {
        muscleGroup = 'legs';
      } else if (exerciseName.includes('deadlift') || exerciseName.includes('back') || exerciseName.includes('row')) {
        muscleGroup = 'back';
      } else if (exerciseName.includes('curl') || exerciseName.includes('tricep') || exerciseName.includes('arm')) {
        muscleGroup = 'arms';
      } else if (exerciseName.includes('shoulder') || exerciseName.includes('press')) {
        muscleGroup = 'shoulders';
      }
      
      muscleFocus[muscleGroup] = (muscleFocus[muscleGroup] || 0) + 1;
    });

    // Exercise volume history for trends
    const exerciseVolumeHistory = Array.from(new Set(allSets.map(s => s.exercise_name)))
      .map(exerciseName => {
        const exerciseSets = allSets.filter(s => s.exercise_name === exerciseName && s.completed);
        const totalVolume = exerciseSets.reduce((sum, s) => sum + (s.weight * s.reps), 0);
        
        return {
          exercise_name: exerciseName,
          trend: 'stable' as const,
          percentChange: 0
        };
      });

    // Calculate streak (simplified)
    const streakDays = calculateWorkoutStreak(safeWorkouts);

    // Prepare workout data for compatibility
    const workoutData = safeWorkouts.map(w => ({
      id: w.id,
      name: w.name,
      start_time: w.start_time,
      duration: w.duration || 0,
      training_type: w.training_type || 'General',
      exerciseSets: w.exercise_sets || []
    }));

    const stats: WorkoutStats = {
      totalWorkouts,
      totalExercises: uniqueExercises,
      totalSets,
      totalDuration,
      avgDuration,
      workoutTypes,
      tags: [], // Could be enhanced to extract from notes/metadata
      recommendedType: workoutTypes.length > 0 ? workoutTypes[0].type : undefined,
      recommendedDuration: avgDuration,
      recommendedTags: [],
      progressMetrics: {
        volumeChangePercentage: 0, // Could be calculated with historical comparison
        strengthTrend: 'stable',
        consistencyScore: Math.min((totalWorkouts / Math.max(1, 30)) * 100, 100) // Simple consistency score
      },
      streakDays,
      workouts: workoutData,
      timePatterns: {
        daysFrequency,
        durationByTimeOfDay
      },
      muscleFocus,
      exerciseVolumeHistory,
      lastWorkoutDate: safeWorkouts.length > 0 ? safeWorkouts[0].start_time : undefined,
      efficiency: completedSets / Math.max(totalSets, 1) * 100,
      density: totalSets / Math.max(totalDuration / 60, 1), // sets per minute
      intensity: totalVolume / Math.max(totalSets, 1), // average weight per set
      totalVolume
    };

    console.log('[WorkoutStatsService] Calculated stats:', {
      totalWorkouts: stats.totalWorkouts,
      totalSets: stats.totalSets,
      totalVolume: stats.totalVolume
    });

    return stats;
  } catch (error) {
    console.error('[WorkoutStatsService] Error fetching workout stats:', error);
    throw error;
  }
};

// Helper function to calculate workout streak
const calculateWorkoutStreak = (workouts: any[]): number => {
  if (workouts.length === 0) return 0;
  
  const sortedDates = workouts
    .map(w => new Date(w.start_time).toDateString())
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  
  const uniqueDates = Array.from(new Set(sortedDates));
  
  let streak = 0;
  const today = new Date().toDateString();
  let currentDate = new Date();
  
  for (const workoutDate of uniqueDates) {
    const diffDays = Math.floor((new Date(today).getTime() - new Date(workoutDate).getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === streak) {
      streak++;
    } else if (diffDays > streak) {
      break;
    }
  }
  
  return streak;
};

export const workoutStatsApi = {
  fetch: fetchWorkoutStats
};
