
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

const Overview = () => {
  const { user } = useAuth();
  const { weightUnit } = useWeightUnit();
  const { dateRange } = useDateRange();
  const [userWeight, setUserWeight] = useState<number | null>(null);
  const [userWeightUnit, setUserWeightUnit] = useState<string | null>(null);
  
  // Fetch workout stats using the hook
  const { stats, loading, refetch, workouts, ...metrics } = useWorkoutStats();
  
  // Create backward compatible stats object with null checks
  const legacyStats = metrics ? createBackwardCompatibleStats(metrics) : null;
  
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
  
  const handleWeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newWeight = Number(event.target.value);
    setUserWeight(newWeight);
    localStorage.setItem('userWeight', String(newWeight));
  };
  
  const handleUnitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newUnit = event.target.value;
    setUserWeightUnit(newUnit);
    localStorage.setItem('userWeightUnit', newUnit);
  };
  
  const densityMetrics = metrics?.densityMetrics;
  
  // Default empty time patterns to avoid type errors
  const defaultTimePatterns = {
    daysFrequency: {},
    durationByTimeOfDay: { morning: 0, afternoon: 0, evening: 0, night: 0 }
  };
  
  // Use default values if stats or timePatterns is undefined
  const timePatterns = stats?.timePatterns || defaultTimePatterns;
  const durationByTimeOfDay = timePatterns.durationByTimeOfDay;
  
  // Prepare volume over time data
  const volumeOverTimeData = useMemo(() => {
    if (!workouts || workouts.length === 0) return [];
    
    return workouts.map(workout => {
      // Calculate volume for each workout
      let volume = 0;
      try {
        if (workout.exercises) {
          volume = Object.entries(workout.exercises).reduce((total, [exerciseName, sets]) => {
            if (!Array.isArray(sets)) return total;
            
            const setVolume = sets.reduce((setTotal, set) => {
              if (set.completed && set.weight && set.reps) {
                return setTotal + (set.weight * set.reps);
              }
              return setTotal;
            }, 0);
            
            return total + setVolume;
          }, 0);
        }
      } catch (error) {
        console.error("Error calculating workout volume:", error);
      }
      
      return {
        date: workout.start_time,
        volume: volume
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [workouts]);
  
  // Prepare density over time data
  const densityOverTimeData = useMemo(() => {
    if (!workouts || workouts.length === 0) return [];
    
    return workouts.map(workout => {
      const densityMetrics = workout.metrics?.densityMetrics || {};
      
      return {
        date: workout.start_time,
        overallDensity: densityMetrics.overallDensity || 0,
        activeOnlyDensity: densityMetrics.activeOnlyDensity || 0
      };
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [workouts]);
  
  // Safely calculate the total volume with error handling
  const getTotalVolume = () => {
    try {
      if (stats?.workouts) {
        return Math.round(calculateTotalVolume(stats.workouts)).toLocaleString();
      }
      return "0";
    } catch (error) {
      console.error("Error calculating total volume:", error);
      return "0";
    }
  };
  
  // Calculate average workout density
  const getAverageDensity = () => {
    if (!densityOverTimeData || densityOverTimeData.length === 0) return "0";
    
    const totalDensity = densityOverTimeData.reduce((sum, item) => sum + item.overallDensity, 0);
    return (totalDensity / densityOverTimeData.length).toFixed(1);
  };
  
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-6">
        <div className="md:col-span-8">
          {loading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <WorkoutVolumeOverTimeChart data={volumeOverTimeData} height={300} className="h-full" />
          )}
        </div>
        
        <div className="md:col-span-4 grid grid-cols-1 gap-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center"><Users2 className="mr-2 h-4 w-4" /> Total Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-4xl font-bold">{stats?.totalWorkouts || 0}</div>
              )}
              <p className="text-sm text-gray-500">All time</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center"><Flame className="mr-2 h-4 w-4" /> Total Volume</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-32" />
              ) : (
                <div className="text-4xl font-bold">{getTotalVolume()}</div>
              )}
              <p className="text-sm text-gray-500">Total weight lifted</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center"><Activity className="mr-2 h-4 w-4" /> Avg Density</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-4xl font-bold">{getAverageDensity()}</div>
              )}
              <p className="text-sm text-gray-500">{weightUnit}/min</p>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {loading ? (
          <>
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </>
        ) : (
          <>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Workout Types</CardTitle>
              </CardHeader>
              <CardContent>
                <WorkoutTypeChart workoutTypes={stats?.workoutTypes || []} />
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Muscle Group Focus</CardTitle>
              </CardHeader>
              <CardContent>
                <MuscleGroupChart muscleFocus={stats?.muscleFocus || {}} />
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      <div className="mb-6">
        {loading ? (
          <Skeleton className="h-80 w-full" />
        ) : (
          <WorkoutDensityOverTimeChart data={densityOverTimeData} />
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {loading ? (
          <>
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </>
        ) : (
          <>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Workout Days</CardTitle>
              </CardHeader>
              <CardContent>
                <WorkoutDaysChart daysFrequency={timePatterns.daysFrequency} />
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Time of Day</CardTitle>
              </CardHeader>
              <CardContent>
                <TimeOfDayChart durationByTimeOfDay={durationByTimeOfDay} />
              </CardContent>
            </Card>
          </>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          <>
            <Skeleton className="h-80 w-full" />
            <Skeleton className="h-80 w-full" />
          </>
        ) : (
          <>
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Top Exercises</CardTitle>
              </CardHeader>
              <CardContent>
                <TopExercisesTable exerciseVolumeHistory={stats?.exerciseVolumeHistory || []} />
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Workout Density</CardTitle>
              </CardHeader>
              <CardContent>
                {densityMetrics && legacyStats ? (
                  <WorkoutDensityChart
                    totalTime={stats?.totalDuration || 0}
                    activeTime={0}
                    restTime={0}
                    totalVolume={legacyStats.totalVolume || 0}
                    weightUnit={weightUnit}
                    overallDensity={densityMetrics.overallDensity}
                    activeOnlyDensity={densityMetrics.activeOnlyDensity}
                  />
                ) : (
                  <div className="flex items-center justify-center h-60 text-gray-500">
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
};

export default Overview;
