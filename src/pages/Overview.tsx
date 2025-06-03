// src/pages/Overview.tsx

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
              {Math.round(volumeStats.total).toLocaleString()} {weightUnit}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader><CardTitle>Avg Volume Rate</CardTitle></CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              {densityStats.avgOverallDensity.toFixed(1)} {weightUnit}/min
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Other charts with lazy loading */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {chartConfigs.map(({ title, renderComponent, data }, idx) => (
          <LazyLoadWrapper key={idx}>
            <Card className="bg-gray-900 border-gray-800 min-h-[300px] overflow-hidden">
              <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
              <CardContent className="h-[250px] flex items-center justify-center">
                {loading
                  ? <Skeleton className="w-3/4 h-3/4 rounded-lg" />
                  : hasData(data)
                    ? renderComponent(data)
                    : <div className="text-gray-500">No data available</div>
                }
              </CardContent>
            </Card>
          </LazyLoadWrapper>
        ))}
      </div>

      {/* Density over time with lazy loading */}
      <LazyLoadWrapper>
        <Card className="bg-card min-h-[250px] overflow-hidden">
          <CardHeader><CardTitle>Volume Rate Over Time</CardTitle></CardHeader>
          <CardContent className="h-[250px]">
            {loading
              ? <Skeleton className="w-full h-full" />
              : hasData(densityOverTimeData)
                ? <WorkoutDensityOverTimeChart data={densityOverTimeData} height={250} />
                : <div className="flex items-center justify-center h-full text-gray-500">No density data available</div>
            }
          </CardContent>
        </Card>
      </LazyLoadWrapper>
    </div>
  );
};

export default React.memo(Overview);
