
import { useMemo } from 'react';
import { useWorkoutDataContext } from '@/context/WorkoutDataProvider';
import { overviewDataService } from '@/services/overviewDataService';
import { Workout } from '@/hooks/useWorkouts';

export const useOverviewMetrics = (workouts: Workout[]) => {
  const { stats, comparisonStats, loading } = useWorkoutDataContext();

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
