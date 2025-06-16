
import React from 'react';
import { EnterpriseGrid, GridSection } from '@/components/layouts/EnterpriseGrid';
import { ChartContainer } from '@/components/layouts/ChartContainer';
import { WorkoutVolumeOverTimeChart } from '@/components/metrics/WorkoutVolumeOverTimeChart';
import { MuscleFocusChart } from '@/components/metrics/MuscleFocusChart';
import { WorkoutTypeChart } from '@/components/metrics/WorkoutTypeChart';
import { useProcessWorkoutMetrics } from '@/hooks/useProcessWorkoutMetrics';
import { useWeightUnit } from '@/context/WeightUnitContext';
import { WorkoutTypeMetric, MuscleFocusMetric } from '@/services/overviewDataService';

interface OverviewChartsSectionProps {
  workouts: any[];
  workoutTypeData: WorkoutTypeMetric[];
  muscleFocusData: MuscleFocusMetric;
}

export const OverviewChartsSection: React.FC<OverviewChartsSectionProps> = React.memo(({ 
  workouts, 
  workoutTypeData, 
  muscleFocusData 
}) => {
  const { weightUnit } = useWeightUnit();

  // Transform workouts for metrics processing
  const workoutsForMetrics = React.useMemo(() => {
    if (!workouts || workouts.length === 0) return [];
    
    return workouts.map(workout => ({
      start_time: workout.created_at,
      duration: workout.duration || 0,
      exercises: workout.exercises ? Object.entries(workout.exercises).map(([exerciseName, sets]) => 
        sets.map(set => ({
          exercise_name: exerciseName,
          completed: set.completed ?? true,
          weight: set.weight,
          reps: set.reps,
          restTime: 0
        }))
      ).flat() : []
    }));
  }, [workouts]);

  const { volumeOverTimeData } = useProcessWorkoutMetrics(workoutsForMetrics, weightUnit);

  return (
    <EnterpriseGrid columns={4} gap="lg" minRowHeight="200px">
      <GridSection span={2} title="Workout Volume Trend">
        <ChartContainer 
          height={300}
          aspectRatio="2/1"
        >
          <WorkoutVolumeOverTimeChart 
            data={volumeOverTimeData}
            height={250}
            className="h-full"
          />
        </ChartContainer>
      </GridSection>

      <GridSection span={2} title="Muscle Focus Distribution">
        <ChartContainer height={300}>
          <MuscleFocusChart muscleGroups={muscleFocusData} />
        </ChartContainer>
      </GridSection>

      <GridSection span={1} title="Workout Types">
        <ChartContainer height={200}>
          <WorkoutTypeChart 
            workoutTypes={workoutTypeData}
            height={150}
          />
        </ChartContainer>
      </GridSection>
    </EnterpriseGrid>
  );
});

OverviewChartsSection.displayName = 'OverviewChartsSection';
