import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useWorkoutStats } from "@/hooks/useWorkoutStats";
import { BarChart3, Dumbbell, Flame, User2, Users2, Activity } from "lucide-react";
import { WorkoutTypeChart } from "@/components/metrics/WorkoutTypeChart";
import { MuscleGroupChart } from "@/components/metrics/MuscleGroupChart";
import { TimeOfDayChart } from "@/components/metrics/TimeOfDayChart";
import { WorkoutDaysChart } from "@/components/metrics/WorkoutDaysChart";
import { TopExercisesTable } from "@/components/metrics/TopExercisesTable";
import { WorkoutDensityChart } from "@/components/metrics/WorkoutDensityChart";
import { WorkoutVolumeOverTimeChart } from '@/components/metrics/WorkoutVolumeOverTimeChart';
import { WorkoutDensityOverTimeChart } from '@/components/metrics/WorkoutDensityOverTimeChart';
import { calculateTotalVolume } from "@/utils/exerciseUtils";
import { useWeightUnit } from "@/context/WeightUnitContext";
import { useDateRange } from '@/context/DateRangeContext';
import { createBackwardCompatibleStats } from '@/utils/metricsTransition';
import { useProcessWorkoutMetrics } from '@/hooks/useProcessWorkoutMetrics';

const Overview = () => {
  const { user } = useAuth();
  const { weightUnit } = useWeightUnit();
  const { dateRange } = useDateRange();
  const [userWeight, setUserWeight] = useState<number | null>(null);
  const [userWeightUnit, setUserWeightUnit] = useState<string | null>(null);

  const { stats, loading, refetch, workouts, ...metricsData } = useWorkoutStats();
  const legacyStats = useMemo(() => metricsData ? createBackwardCompatibleStats(metricsData) : null, [metricsData]);

  const {
    volumeOverTimeData,
    densityOverTimeData,
    volumeStats,
    densityStats
  } = useProcessWorkoutMetrics(workouts, weightUnit);

  useEffect(() => {
    const storedWeight = localStorage.getItem('userWeight');
    const storedUnit = localStorage.getItem('userWeightUnit');
    if (storedWeight) setUserWeight(Number(storedWeight));
    if (storedUnit) setUserWeightUnit(storedUnit);
    if (dateRange && refetch) refetch();
  }, [dateRange, refetch]);

  const timePatterns = useMemo(() => stats?.timePatterns || {
    daysFrequency: {},
    durationByTimeOfDay: { morning: 0, afternoon: 0, evening: 0, night: 0 }
  }, [stats?.timePatterns]);

  const hasData = (value: any) => Array.isArray(value) ? value.length > 0 : Object.keys(value || {}).length > 0;

  return (
    <div className="container mx-auto py-6 px-4 overflow-x-hidden overflow-y-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8">
          <Card className="min-h-[300px] h-[300px] bg-card overflow-hidden">
            {loading ? <Skeleton className="w-full h-full" /> : <WorkoutVolumeOverTimeChart data={volumeOverTimeData} height={300} />}
          </Card>
        </div>
        <div className="md:col-span-4 space-y-4">
          {[{
            icon: <Users2 className="mr-2 h-4 w-4" />, label: "Total Workouts", value: stats?.totalWorkouts || 0
          }, {
            icon: <Flame className="mr-2 h-4 w-4" />, label: "Total Volume", value: Math.round(volumeStats.total || 0).toLocaleString()
          }, {
            icon: <Activity className="mr-2 h-4 w-4" />, label: "Avg Density", value: `${densityStats.avgOverallDensity?.toFixed(1) || 0} ${weightUnit}/min`
          }].map((stat, idx) => (
            <Card key={idx} className="bg-gray-900 border-gray-800 min-h-[100px] overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center">{stat.icon}{stat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {[{
        title: "Workout Types",
        Component: WorkoutTypeChart,
        data: stats?.workoutTypes
      }, {
        title: "Muscle Group Focus",
        Component: MuscleGroupChart,
        data: stats?.muscleFocus
      }, {
        title: "Workout Days",
        Component: WorkoutDaysChart,
        data: timePatterns.daysFrequency
      }, {
        title: "Time of Day",
        Component: TimeOfDayChart,
        data: timePatterns.durationByTimeOfDay
      }, {
        title: "Top Exercises",
        Component: TopExercisesTable,
        data: stats?.exerciseVolumeHistory
      }, {
        title: "Workout Density",
        Component: WorkoutDensityChart,
        data: metricsData.densityMetrics
      }].map(({ title, Component, data }, idx) => (
        <Card key={idx} className="bg-gray-900 border-gray-800 min-h-[300px] overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{title}</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] flex items-center justify-center">
            {loading ? <Skeleton className="w-3/4 h-3/4 rounded-lg" /> : hasData(data) ? <Component {...{ [title.replace(/\s/g, '').toLowerCase()]: data }} /> : <div className="text-gray-500">No data available</div>}
          </CardContent>
        </Card>
      ))}

      <Card className="min-h-[250px] h-[250px] mb-6 overflow-hidden w-full">
        {loading ? <Skeleton className="w-full h-full" /> : <WorkoutDensityOverTimeChart data={densityOverTimeData} height={250} />}
      </Card>
    </div>
  );
};

export default React.memo(Overview);
