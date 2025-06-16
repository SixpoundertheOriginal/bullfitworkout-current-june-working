
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useDateRange } from '@/context/DateRangeContext';
import { useWeightUnit } from '@/context/WeightUnitContext';
import { WorkoutStats } from '@/types/workout-metrics';
import { workoutStatsApi } from '@/services/workoutStatsService';

interface OptimizedWorkoutStatsContextType {
  stats: WorkoutStats;
  comparisonStats?: WorkoutStats;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  isStale: boolean;
}

const OptimizedWorkoutStatsContext = createContext<OptimizedWorkoutStatsContextType | undefined>(undefined);

// Create a stable query key factory with better caching strategy
const createWorkoutStatsQueryKey = (
  userId: string | undefined, 
  dateRange: any, 
  weightUnit: string,
  type: 'primary' | 'comparison' = 'primary'
) => {
  const from = dateRange?.from?.toISOString();
  const to = dateRange?.to?.toISOString();
  return ['workout-stats-v2', userId, from, to, weightUnit, type];
};

const defaultStats: WorkoutStats = {
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

export function OptimizedWorkoutStatsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { dateRange, comparisonRange, enableComparison } = useDateRange();
  const { weightUnit } = useWeightUnit();
  const queryClient = useQueryClient();

  // Primary stats query
  const primaryQueryKey = createWorkoutStatsQueryKey(user?.id, dateRange, weightUnit, 'primary');
  const {
    data: stats,
    isLoading: primaryLoading,
    error: primaryError,
    refetch: refetchPrimary,
    isStale: primaryStale
  } = useQuery({
    queryKey: primaryQueryKey,
    queryFn: () => workoutStatsApi.fetch(user!.id, dateRange, weightUnit),
    enabled: !!user && !!dateRange,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Comparison stats query (only when enabled)
  const comparisonQueryKey = createWorkoutStatsQueryKey(user?.id, comparisonRange, weightUnit, 'comparison');
  const {
    data: comparisonStats,
    isLoading: comparisonLoading,
    error: comparisonError
  } = useQuery({
    queryKey: comparisonQueryKey,
    queryFn: () => workoutStatsApi.fetch(user!.id, comparisonRange, weightUnit),
    enabled: !!user && !!comparisonRange && enableComparison,
    staleTime: 5 * 60 * 1000, // 5 minutes for comparison data
    gcTime: 15 * 60 * 1000, // 15 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Optimized background refresh with much lower frequency
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        // Only invalidate if data is stale
        if (primaryStale) {
          queryClient.invalidateQueries({ queryKey: primaryQueryKey });
        }
      }
    }, 5 * 60 * 1000); // Reduced to 5 minutes

    return () => clearInterval(interval);
  }, [queryClient, primaryQueryKey, primaryStale]);

  const refetch = React.useCallback(() => {
    refetchPrimary();
    if (enableComparison && comparisonRange) {
      queryClient.invalidateQueries({ queryKey: comparisonQueryKey });
    }
  }, [refetchPrimary, enableComparison, comparisonRange, queryClient, comparisonQueryKey]);

  const contextValue: OptimizedWorkoutStatsContextType = useMemo(() => ({
    stats: stats || defaultStats,
    comparisonStats: enableComparison ? comparisonStats : undefined,
    loading: primaryLoading || (enableComparison && comparisonLoading),
    error: (primaryError || comparisonError) as Error | null,
    refetch,
    isStale: primaryStale
  }), [stats, comparisonStats, primaryLoading, comparisonLoading, primaryError, comparisonError, refetch, primaryStale, enableComparison]);

  return (
    <OptimizedWorkoutStatsContext.Provider value={contextValue}>
      {children}
    </OptimizedWorkoutStatsContext.Provider>
  );
}

export function useOptimizedWorkoutStatsContext(): OptimizedWorkoutStatsContextType {
  const context = useContext(OptimizedWorkoutStatsContext);
  if (!context) {
    throw new Error('useOptimizedWorkoutStatsContext must be used within an OptimizedWorkoutStatsProvider');
  }
  return context;
}
