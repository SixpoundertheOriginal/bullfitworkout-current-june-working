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
import { calculateTotalVolume } from "@/utils/exerciseUtils";
import { useWeightUnit } from "@/context/WeightUnitContext";
import { createBackwardCompatibleStats } from '@/utils/metricsTransition';
import { useDateRange } from '@/context/DateRangeContext';
import { WorkoutVolumeOverTimeChart } from '@/components/metrics/WorkoutVolumeOverTimeChart';
import { WorkoutDensityOverTimeChart } from '@/components/metrics/WorkoutDensityOverTimeChart';
import { useProcessWorkoutMetrics } from '@/hooks/useProcessWorkoutMetrics';

const Overview = React.memo(() => {
  const { user } = useAuth();
  const { weightUnit } = useWeightUnit();
  const { dateRange } = useDateRange();
  const [userWeight, setUserWeight] = useState<number | null>(null);
  const [userWeightUnit, setUserWeightUnit] = useState<string | null>(null);
  
  // Fetch workout stats using the hook
  const { 
    stats, 
    loading, 
    refetch, 
    workouts, 
    ...metricsData 
  } = useWorkoutStats();
  
  console.log("Overview page rendering. Stats loaded:", !loading, "Workout count:", workouts?.length || 0);
  
  // Create backward compatible stats object with null checks
  const legacyStats = useMemo(() => {
    return metricsData ? createBackwardCompatibleStats(metricsData) : null;
  }, [metricsData]);
  
  // Process workout metrics using our dedicated hook
  const {
    volumeOverTimeData,
    densityOverTimeData,
    volumeStats,
    densityStats,
    hasVolumeData,
    hasDensityData
  } = useProcessWorkoutMetrics(workouts, weightUnit);
  
  useEffect(() => {
    const storedWeight = localStorage.getItem('userWeight');
    const storedUnit = localStorage.getItem('userWeightUnit');
    
    if (storedWeight) setUserWeight(Number(storedWeight));
    if (storedUnit) setUserWeightUnit(storedUnit);
    
    // If date range changes, refetch stats
    if (dateRange && refetch) {
      refetch();
    }
  }, [dateRange, refetch]);
  
  // Default empty time patterns to avoid type errors
  const defaultTimePatterns = useMemo(() => ({
    daysFrequency: {},
    durationByTimeOfDay: { morning: 0, afternoon: 0, evening: 0, night: 0 }
  }), []);
  
  // Use default values if stats or timePatterns is undefined
  const timePatterns = useMemo(() => (
    stats?.timePatterns || defaultTimePatterns
  ), [stats?.timePatterns, defaultTimePatterns]);
  
  const durationByTimeOfDay = useMemo(() => (
    timePatterns.durationByTimeOfDay
  ), [timePatterns.durationByTimeOfDay]);
  
  // Create skeleton loaders for consistent heights
  const VolumeChartSkeleton = () => (
    <div className="h-[300px] w-full flex items-center justify-center bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
      <Skeleton className="w-3/4 h-[200px] rounded-lg" />
    </div>
  );
  
  const StatCardSkeleton = () => (
    <Card className="bg-gray-900 border-gray-800 min-h-[100px] overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Skeleton className="h-4 w-4 mr-2" /> 
          <Skeleton className="h-6 w-32" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-4 w-32" />
      </CardContent>
    </Card>
  );
  
  const ChartSkeleton = () => (
    <Card className="bg-gray-900 border-gray-800 min-h-[300px] overflow-hidden">
      <CardHeader>
        <CardTitle>
          <Skeleton className="h-6 w-32" />
        </CardTitle>
      </CardHeader>
      <CardContent className="h-[250px] flex items-center justify-center">
        <Skeleton className="w-3/4 h-3/4 rounded-lg" />
      </CardContent>
    </Card>
  );
  
  // Function to check if data is valid
  const hasWorkoutTypes = useMemo(() => stats?.workoutTypes && Array.isArray(stats.workoutTypes) && stats.workoutTypes.length > 0, [stats?.workoutTypes]);
  const hasMuscleFocus = useMemo(() => stats?.muscleFocus && Object.keys(stats.muscleFocus).length > 0, [stats?.muscleFocus]);
  const hasDaysFrequency = useMemo(() => Object.keys(timePatterns.daysFrequency).length > 0, [timePatterns.daysFrequency]);
  const hasTimeOfDay = useMemo(() => Object.values(durationByTimeOfDay).some(v => v > 0), [durationByTimeOfDay]);
  const hasExerciseHistory = useMemo(() => stats?.exerciseVolumeHistory && stats.exerciseVolumeHistory.length > 0, [stats?.exerciseVolumeHistory]);
  
  return (
    <div className="container mx-auto py-6 px-4 overflow-x-hidden overflow-y-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
        <div className="md:col-span-8">
          <div className="min-h-[300px] h-[300px] overflow-hidden w-full">
            {loading ? (
              <VolumeChartSkeleton />
            ) : (
              <WorkoutVolumeOverTimeChart data={volumeOverTimeData} height={300} className="h-full" />
            )}
          </div>
        </div>
        
        <div className="md:col-span-4 grid grid-cols-1 gap-4">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <Card className="bg-gray-900 border-gray-800 min-h-[100px] overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center"><Users2 className="mr-2 h-4 w-4" /> Total Workouts</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">{stats?.totalWorkouts || 0}</div>
                  <p className="text-sm text-gray-500">All time</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-800 min-h-[100px] overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center"><Flame className="mr-2 h-4 w-4" /> Total Volume</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">
                    {volumeStats.total ? Math.round(volumeStats.total).toLocaleString() : "0"}
                  </div>
                  <p className="text-sm text-gray-500">Total weight lifted</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-900 border-gray-800 min-h-[100px] overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center"><Activity className="mr-2 h-4 w-4" /> Avg Density</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">
                    {densityStats.avgOverallDensity ? densityStats.avgOverallDensity.toFixed(1) : "0"}
                  </div>
                  <p className="text-sm text-gray-500">{weightUnit}/min</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {loading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <Card className="bg-gray-900 border-gray-800 min-h-[300px] overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Workout Types</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] overflow-hidden">
                {hasWorkoutTypes ? (
                  <WorkoutTypeChart workoutTypes={stats.workoutTypes} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No workout type data available
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800 min-h-[300px] overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Muscle Group Focus</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] overflow-hidden">
                {hasMuscleFocus ? (
                  <MuscleGroupChart muscleFocus={stats.muscleFocus} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No muscle group data available
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      <div className="min-h-[250px] h-[250px] mb-6 overflow-hidden w-full">
        {loading ? (
          <VolumeChartSkeleton />
        ) : (
          <WorkoutDensityOverTimeChart data={densityOverTimeData} height={250} />
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {loading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <Card className="bg-gray-900 border-gray-800 min-h-[300px] overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Workout Days</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] overflow-hidden">
                {hasDaysFrequency ? (
                  <WorkoutDaysChart daysFrequency={timePatterns.daysFrequency} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No workout days data available
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800 min-h-[300px] overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Time of Day</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] overflow-hidden">
                {hasTimeOfDay ? (
                  <TimeOfDayChart durationByTimeOfDay={durationByTimeOfDay} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No time of day data available
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <Card className="bg-gray-900 border-gray-800 min-h-[300px] overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Top Exercises</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] overflow-y-auto overflow-x-hidden">
                {hasExerciseHistory ? (
                  <TopExercisesTable exerciseVolumeHistory={stats.exerciseVolumeHistory} />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No exercise history data available
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800 min-h-[300px] overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Workout Density</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px] overflow-hidden">
                {metricsData && legacyStats ? (
                  <WorkoutDensityChart
                    totalTime={stats?.totalDuration || 0}
                    activeTime={legacyStats.activeTime || stats?.totalDuration * 0.6 || 0} 
                    restTime={legacyStats.restTime || stats?.totalDuration * 0.4 || 0}
                    totalVolume={legacyStats.totalVolume || 0}
                    weightUnit={weightUnit}
                    overallDensity={metricsData.densityMetrics?.overallDensity}
                    activeOnlyDensity={metricsData.densityMetrics?.activeOnlyDensity}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">
                    No density data available
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
});

Overview.displayName = 'Overview';

export default React.memo(Overview);
