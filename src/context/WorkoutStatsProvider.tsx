
import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { useDateRange } from '@/context/DateRangeContext';
import { useWeightUnit } from '@/context/WeightUnitContext';
import { WorkoutStats } from '@/types/workout-metrics';
import { workoutStatsApi } from '@/services/workoutStatsService';

interface WorkoutStatsContextType {
  stats: WorkoutStats;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

const WorkoutStatsContext = createContext<WorkoutStatsContextType | undefined>(undefined);

// Create a stable query key factory with better caching strategy
const createWorkoutStatsQueryKey = (userId: string | undefined, dateRange: any, weightUnit: string) => {
  const from = dateRange?.from?.toISOString();
  const to = dateRange?.to?.toISOString();
  return ['workout-stats-v2', userId, from, to, weightUnit]; // v2 to invalidate old cache
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
    queryFn: () => workoutStatsApi.fetch(user!.id, dateRange, weightUnit),
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes - shorter for more frequent updates
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    // Add network mode for better offline handling
    networkMode: 'online'
  });

  // Optimized background refresh - less frequent but still responsive
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible' && user) {
        queryClient.invalidateQueries({ 
          queryKey: ['workout-stats-v2', user.id],
          exact: false // Invalidate all related queries
        });
      }
    }, 10 * 60 * 1000); // 10 minutes instead of 30

    return () => clearInterval(interval);
  }, [queryClient, user]);

  // Default stats with better structure
  const defaultStats: WorkoutStats = React.useMemo(() => ({
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
    lastWorkoutDate: undefined,
    efficiency: 0,
    density: 0,
    intensity: 0,
    totalVolume: 0
  }), []);

  const contextValue: WorkoutStatsContextType = React.useMemo(() => ({
    stats: stats || defaultStats,
    loading,
    error: error as Error | null,
    refetch: () => refetch()
  }), [stats, defaultStats, loading, error, refetch]);

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
