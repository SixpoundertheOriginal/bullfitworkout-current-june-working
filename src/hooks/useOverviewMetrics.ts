
import { useMemo } from 'react';
import { useOptimizedWorkoutStatsContext } from '@/context/OptimizedWorkoutStatsProvider';
import { useWorkouts } from '@/hooks/useWorkouts';
import { overviewDataService } from '@/services/overviewDataService';

export const useOverviewMetrics = () => {
  const { workouts } = useWorkouts();
  const { stats, comparisonStats, loading } = useOptimizedWorkoutStatsContext();

  const overviewMetrics = useMemo(() => {
    return overviewDataService.calculateOverviewMetrics(workouts, comparisonStats);
  }, [workouts, comparisonStats]);

  const workoutTypeData = useMemo(() => {
    return overviewDataService.calculateWorkoutTypeData(workouts);
  }, [workouts]);

  const muscleFocusData = useMemo(() => {
    return overviewDataService.calculateMuscleFocusData(workouts);
  }, [workouts]);

  return {
    overviewMetrics,
    workoutTypeData,
    muscleFocusData,
    loading,
    stats
  };
};
