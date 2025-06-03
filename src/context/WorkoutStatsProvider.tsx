import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useDateRange } from '@/context/DateRangeContext';
import { useWeightUnit } from '@/context/WeightUnitContext';
import { getExerciseGroup } from '@/utils/exerciseUtils';
import { WorkoutStats } from '@/types/workout-metrics';
import { performanceMonitor } from '@/services/performanceMonitor';

interface WorkoutStatsContextType {
  stats: WorkoutStats;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

const WorkoutStatsContext = createContext<WorkoutStatsContextType | undefined>(undefined);

// Create a stable query key factory
const createWorkoutStatsQueryKey = (userId: string | undefined, dateRange: any, weightUnit: string) => {
  const from = dateRange?.from?.toISOString();
  const to = dateRange?.to?.toISOString();
  return ['workout-stats', userId, from, to, weightUnit];
};

// Main data fetching function
const fetchWorkoutStats = async (
  userId: string,
  dateRange: any,
  weightUnit: string
): Promise<WorkoutStats> => {
  const queryStartTime = performance.now();
  console.log('[WorkoutStatsProvider] Fetching workout stats for:', { userId, dateRange, weightUnit });
  
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
  
  // Track query performance
  performanceMonitor.trackQuery('workout-stats', queryDuration, false);
  console.log(`[WorkoutStatsProvider] Fetched ${sessions.length} sessions in ${queryDuration.toFixed(2)}ms`);

  // Process workout data into stats
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

export function WorkoutStatsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { dateRange } = useDateRange();
  const { weightUnit } = useWeightUnit();
  const queryClient = useQueryClient();

  const queryKey = createWorkoutStatsQueryKey(user?.id, dateRange, weightUnit);

  const {
    data: stats,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey,
    queryFn: () => fetchWorkoutStats(user!.id, dateRange, weightUnit),
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
    select: (data) => {
      // Track cache hit for subsequent renders
      if (data) {
        performanceMonitor.trackQuery('workout-stats-cached', 0, true);
      }
      return data;
    }
  });

  // Track background refresh
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        performanceMonitor.trackBackgroundRefresh();
        queryClient.invalidateQueries({ queryKey });
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [queryClient, queryKey]);

  const contextValue: WorkoutStatsContextType = {
    stats: stats || {
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
    },
    loading,
    error: error as Error | null,
    refetch: () => refetch()
  };

  return (
    <WorkoutStatsContext.Provider value={contextValue}>
      {children}
    </WorkoutStatsContext.Provider>
  );
}

export function useWorkoutStatsContext(): WorkoutStatsContextType {
  const context = useContext(WorkoutStatsContext);
  if (!context) {
    throw new Error('useWorkoutStatsContext must be used within a WorkoutStatsProvider');
  }
  return context;
}
