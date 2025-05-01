import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import { useWorkoutStats } from "@/hooks/useWorkoutStats";
import { BarChart3, Dumbbell, Flame, User2, Users2 } from "lucide-react";
import { WorkoutTypeChart } from "@/components/metrics/WorkoutTypeChart";
import { MuscleGroupChart } from "@/components/metrics/MuscleGroupChart";
import { TimeOfDayChart } from "@/components/metrics/TimeOfDayChart";
import { WorkoutDaysChart } from "@/components/metrics/WorkoutDaysChart";
import { TopExercisesTable } from "@/components/metrics/TopExercisesTable";
import { WorkoutDensityChart } from "@/components/metrics/WorkoutDensityChart";
import { calculateTotalVolume } from "@/utils/exerciseUtils";
import { useWeightUnit } from "@/context/WeightUnitContext";
import { createBackwardCompatibleStats } from '@/utils/metricsTransition';

const Overview = () => {
  const { user } = useAuth();
  const { weightUnit } = useWeightUnit();
  const [userWeight, setUserWeight] = useState<number | null>(null);
  const [userWeightUnit, setUserWeightUnit] = useState<string | null>(null);
  
  // Fetch workout stats using the hook
  const { stats, loading, refetch, ...metrics } = useWorkoutStats();
  
  // Create backward compatible stats object with null checks
  const legacyStats = metrics ? createBackwardCompatibleStats(metrics) : null;
  
  useEffect(() => {
    const storedWeight = localStorage.getItem('userWeight');
    const storedUnit = localStorage.getItem('userWeightUnit');
    
    if (storedWeight) setUserWeight(Number(storedWeight));
    if (storedUnit) setUserWeightUnit(storedUnit);
  }, []);
  
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
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Workout Overview</h1>
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle><Skeleton className="h-6 w-full" /></CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center"><Users2 className="mr-2 h-4 w-4" /> Total Workouts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stats?.totalWorkouts || 0}</div>
                <p className="text-sm text-gray-500">All time</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center"><Dumbbell className="mr-2 h-4 w-4" /> Total Exercises</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{stats?.totalExercises || 0}</div>
                <p className="text-sm text-gray-500">Different exercises</p>
              </CardContent>
            </Card>
            
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center"><Flame className="mr-2 h-4 w-4" /> Total Volume</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{getTotalVolume()}</div>
                <p className="text-sm text-gray-500">Total weight lifted</p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
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
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
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
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
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
          </div>
        </>
      )}
    </div>
  );
};

export default Overview;
