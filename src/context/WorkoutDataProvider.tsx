
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useDateRange } from '@/context/DateRangeContext';
import { useWeightUnit } from '@/context/WeightUnitContext';
import { WorkoutStats } from '@/types/workout-metrics';
import { workoutStatsApi } from '@/services/workoutStatsService';
import { useCleanup } from '@/hooks/useCleanup';

interface WorkoutDataContextType {
  stats: WorkoutStats;
  comparisonStats?: WorkoutStats;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
  isStale: boolean;
}

const WorkoutDataContext = createContext<WorkoutDataContextType | undefined>(undefined);

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

export function WorkoutDataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const { dateRange, comparisonRange, enableComparison } = useDateRange();
  const { weightUnit } = useWeightUnit();
  const queryClient = useQueryClient();
  const { registerCleanup } = useCleanup('workout-data-provider');

  // Create stable query keys
  const primaryQueryKey = useMemo(() => [
    'workout-stats-unified',
    user?.id,
    dateRange?.from?.toISOString(),
    dateRange?.to?.toISOString(),
    weightUnit,
    'primary'
  ], [user?.id, dateRange, weightUnit]);

  const comparisonQueryKey = useMemo(() => [
    'workout-stats-unified',
    user?.id,
    comparisonRange?.from?.toISOString(),
    comparisonRange?.to?.toISOString(),
    weightUnit,
    'comparison'
  ], [user?.id, comparisonRange, weightUnit]);

  // Primary stats query - NO subscription logic
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
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Comparison stats query - NO subscription logic
  const {
    data: comparisonStats,
    isLoading: comparisonLoading,
    error: comparisonError
  } = useQuery({
    queryKey: comparisonQueryKey,
    queryFn: () => workoutStatsApi.fetch(user!.id, comparisonRange, weightUnit),
    enabled: !!user && !!comparisonRange && enableComparison,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Refetch function
  const refetch = React.useCallback(() => {
    refetchPrimary();
    if (enableComparison && comparisonRange) {
      queryClient.invalidateQueries({ queryKey: comparisonQueryKey });
    }
  }, [refetchPrimary, enableComparison, comparisonRange, queryClient, comparisonQueryKey]);

  const contextValue: WorkoutDataContextType = useMemo(() => ({
    stats: stats || defaultStats,
    comparisonStats: enableComparison ? comparisonStats : undefined,
    loading: primaryLoading || (enableComparison && comparisonLoading),
    error: (primaryError || comparisonError) as Error | null,
    refetch,
    isStale: primaryStale
  }), [stats, comparisonStats, primaryLoading, comparisonLoading, primaryError, comparisonError, refetch, primaryStale, enableComparison]);

  return (
    <WorkoutDataContext.Provider value={contextValue}>
      {children}
    </WorkoutDataContext.Provider>
  );
}

export function useWorkoutDataContext(): WorkoutDataContextType {
  const context = useContext(WorkoutDataContext);
  if (!context) {
    throw new Error('useWorkoutDataContext must be used within a WorkoutDataProvider');
  }
  return context;
}
