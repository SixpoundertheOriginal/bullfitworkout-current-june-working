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
import { DateRangeFilter } from "@/components/date-filters/DateRangeFilter";
import { DateRangeBadge } from "@/components/date-filters/DateRangeBadge";

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

  // Create safe defaults for timePatterns
  const timePatterns = useMemo(() => {
    const defaultTimePatterns = {
      daysFrequency: {
        monday: 0,
        tuesday: 0,
        wednesday: 0,
        thursday: 0,
        friday: 0,
        saturday: 0,
        sunday: 0
      },
      durationByTimeOfDay: {
        morning: 0,
        afternoon: 0,
        evening: 0,
        night: 0
      }
    };
    
    if (!stats || !stats.timePatterns) return defaultTimePatterns;
    
    return {
      daysFrequency: stats.timePatterns.daysFrequency || defaultTimePatterns.daysFrequency,
      durationByTimeOfDay: stats.timePatterns.durationByTimeOfDay || defaultTimePatterns.durationByTimeOfDay
    };
  }, [stats]);

  // Safety check function for data
  const hasData = (value: any) => {
    if (value === undefined || value === null) return false;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return false;
  };

  // Safe access to density metrics
  const safeWorkoutTypes = useMemo(() => stats?.workoutTypes || [], [stats]);
  const safeMuscleFocus = useMemo(() => stats?.muscleFocus || {}, [stats]);
  const safeDensityMetrics = useMemo(() => {
    const defaultMetrics = {
      activeTime: 0,
      restTime: 0,
      totalVolume: 0,
      setsPerMinute: 0,
      volumePerMinute: 0,
      overallDensity: 0,
      activeOnlyDensity: 0
    };
    
    if (!metricsData || !metricsData.densityMetrics) return defaultMetrics;
    
    return {
      ...defaultMetrics,
      ...metricsData.densityMetrics
    };
  }, [metricsData]);
  
  // Safe access to exercise volume history
  const safeExerciseVolumeHistory = useMemo(() => stats?.exerciseVolumeHistory || [], [stats]);

  // Prepare chart config objects and renderer functions for each chart type
  const chartConfigs = useMemo(() => {
    // Configuration for different chart types
    return [
      {
        title: "Workout Types",
        renderComponent: (data: any) => (
          <WorkoutTypeChart data={data} />
        ),
        data: safeWorkoutTypes
      },
      {
        title: "Muscle Group Focus",
        renderComponent: (data: any) => (
          <MuscleGroupChart muscleFocus={data} />
        ),
        data: safeMuscleFocus
      },
      {
        title: "Workout Days",
        renderComponent: (data: any) => (
          <WorkoutDaysChart daysFrequency={data} />
        ),
        data: timePatterns.daysFrequency
      },
      {
        title: "Time of Day",
        renderComponent: (data: any) => (
          <TimeOfDayChart durationByTimeOfDay={data} />
        ),
        data: timePatterns.durationByTimeOfDay
      },
      {
        title: "Top Exercises",
        renderComponent: (data: any) => (
          <TopExercisesTable exerciseVolumeHistory={data} />
        ),
        data: safeExerciseVolumeHistory
      },
      {
        title: "Workout Density",
        renderComponent: (data: any) => (
          <WorkoutDensityChart
            totalTime={legacyStats?.activeTime || 0}
            activeTime={legacyStats?.activeTime || 0}
            restTime={legacyStats?.restTime || 0}
            totalVolume={volumeStats.total || 0}
            weightUnit={weightUnit}
            overallDensity={data.overallDensity}
            activeOnlyDensity={data.activeOnlyDensity}
          />
        ),
        data: safeDensityMetrics
      }
    ];
  }, [
    safeWorkoutTypes, 
    safeMuscleFocus, 
    timePatterns, 
    safeExerciseVolumeHistory, 
    safeDensityMetrics,
    legacyStats,
    volumeStats,
    weightUnit
  ]);

  return (
    <div className="container mx-auto py-6 px-4 overflow-x-hidden overflow-y-auto space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Workout Overview</h1>
        <div className="flex gap-2 items-center">
          <DateRangeBadge />
          <DateRangeFilter />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-8">
          <Card className="min-h-[300px] h-[300px] bg-card overflow-hidden">
            {loading ? <Skeleton className="w-full h-full" /> : 
              (volumeOverTimeData && volumeOverTimeData.length > 0) ? 
                <WorkoutVolumeOverTimeChart data={volumeOverTimeData} height={300} /> : 
                <div className="flex items-center justify-center h-full text-gray-500">No volume data available</div>
            }
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

      {chartConfigs.map(({ title, renderComponent, data }, idx) => (
        <Card key={idx} className="bg-gray-900 border-gray-800 min-h-[300px] overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">{title}</CardTitle>
          </CardHeader>
          <CardContent className="h-[250px] flex items-center justify-center">
            {loading ? 
              <Skeleton className="w-3/4 h-3/4 rounded-lg" /> : 
              hasData(data) ? 
                renderComponent(data) : 
                <div className="text-gray-500">No data available</div>
            }
          </CardContent>
        </Card>
      ))}

      <Card className="min-h-[250px] h-[250px] mb-6 overflow-hidden w-full">
        {loading ? 
          <Skeleton className="w-full h-full" /> : 
          (densityOverTimeData && densityOverTimeData.length > 0) ? 
            <WorkoutDensityOverTimeChart data={densityOverTimeData} height={250} /> : 
            <div className="flex items-center justify-center h-full text-gray-500">No density data available</div>
        }
      </Card>
    </div>
  );
};

export default React.memo(Overview);
