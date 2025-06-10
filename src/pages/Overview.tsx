
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useWorkoutStatsContext } from "@/context/WorkoutStatsProvider";
import { WorkoutTypeChart } from "@/components/metrics/WorkoutTypeChart";
import { MuscleGroupChart } from "@/components/metrics/MuscleGroupChart";
import { TimeOfDayChart } from "@/components/metrics/TimeOfDayChart";
import { WorkoutDaysChart } from "@/components/metrics/WorkoutDaysChart";
import { TopExercisesTable } from "@/components/metrics/TopExercisesTable";
import { WorkoutVolumeOverTimeChart } from '@/components/metrics/WorkoutVolumeOverTimeChart';
import { WorkoutDensityOverTimeChart } from '@/components/metrics/WorkoutDensityOverTimeChart';
import { useWeightUnit } from "@/context/WeightUnitContext";
import { useProcessWorkoutMetrics } from '@/hooks/useProcessWorkoutMetrics';
import { LazyLoadWrapper } from '@/components/common/LazyLoadWrapper';
import { WorkoutRegressionPanel } from '@/components/dev/WorkoutRegressionPanel';

const Overview: React.FC = () => {
  const { weightUnit } = useWeightUnit();
  const { stats, loading } = useWorkoutStatsContext();
  
  // Process raw metrics using the centralized data
  const {
    volumeOverTimeData,
    densityOverTimeData,
    volumeStats,
    densityStats
  } = useProcessWorkoutMetrics(stats.workouts, weightUnit);

  // Simple data‐exists guard
  const hasData = (v: any) => v != null && ((Array.isArray(v) && v.length > 0) || (typeof v === 'object' && Object.keys(v).length > 0));

  // Chart configurations - memoized for performance
  const chartConfigs = useMemo(() => ([
    {
      title: "Workout Types",
      renderComponent: (data: any) => <WorkoutTypeChart workoutTypes={data} height={250} />,
      data: stats.workoutTypes || []
    },
    {
      title: "Muscle Focus",
      renderComponent: (data: any) => <MuscleGroupChart muscleFocus={data} height={250} />,
      data: stats.muscleFocus || {}
    },
    {
      title: "Workout Days",
      renderComponent: (data: any) => <WorkoutDaysChart daysFrequency={data} height={250} />,
      data: stats.timePatterns?.daysFrequency || {}
    },
    {
      title: "Time of Day",
      renderComponent: (data: any) => <TimeOfDayChart durationByTimeOfDay={data} height={250} />,
      data: stats.timePatterns?.durationByTimeOfDay || {}
    },
    {
      title: "Top Exercises",
      renderComponent: (data: any) => <TopExercisesTable exerciseVolumeHistory={data} />,
      data: stats.exerciseVolumeHistory || []
    }
  ]), [stats, weightUnit]);

  return (
    <div className="container mx-auto py-6 px-4 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Workout Overview</h1>
      </div>

      {/* Volume over time with lazy loading */}
      <LazyLoadWrapper>
        <Card className="bg-card min-h-[300px] overflow-hidden">
          <CardHeader><CardTitle>Volume Over Time</CardTitle></CardHeader>
          <CardContent className="h-[300px]">
            {loading
              ? <Skeleton className="w-full h-full" />
              : hasData(volumeOverTimeData)
                ? <WorkoutVolumeOverTimeChart data={volumeOverTimeData} height={300} />
                : <div className="flex items-center justify-center h-full text-gray-500">No volume data available</div>
            }
          </CardContent>
        </Card>
      </LazyLoadWrapper>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader><CardTitle>Total Workouts</CardTitle></CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.totalWorkouts || 0}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader><CardTitle>Total Volume</CardTitle></CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {(stats.totalVolume || 0).toLocaleString()} {weightUnit}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader><CardTitle>Average Duration</CardTitle></CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.avgDuration || 0} min</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {chartConfigs.map((config) => (
          <LazyLoadWrapper key={config.title}>
            <Card className="bg-card min-h-[300px] overflow-hidden">
              <CardHeader><CardTitle>{config.title}</CardTitle></CardHeader>
              <CardContent className="h-[300px]">
                {loading
                  ? <Skeleton className="w-full h-full" />
                  : hasData(config.data)
                    ? config.renderComponent(config.data)
                    : <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
                }
              </CardContent>
            </Card>
          </LazyLoadWrapper>
        ))}
      </div>

      {/* Development regression panel */}
      <WorkoutRegressionPanel />
    </div>
  );
};

export default Overview;
