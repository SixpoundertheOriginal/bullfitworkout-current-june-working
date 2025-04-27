
import React from "react";
import { WorkoutOverviewSection } from "./WorkoutOverviewSection";
import { ExerciseVolumeChart } from '@/components/metrics/ExerciseVolumeChart';
import { MuscleFocusChart } from '@/components/metrics/MuscleFocusChart';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkoutStats } from "@/hooks/useWorkoutStats";
import { useWeightUnit } from "@/context/WeightUnitContext";

interface InsightsDashboardProps {
  stats: WorkoutStats;
  className?: string;
}

export function InsightsDashboard({ stats, className = "" }: InsightsDashboardProps) {
  const { weightUnit } = useWeightUnit();
  
  // Convert exercise history data for volume chart
  const exerciseData = stats.exerciseVolumeHistory?.reduce((acc, exercise) => {
    acc[exercise.exercise_name] = [{
      weight: exercise.volume_history[exercise.volume_history.length - 1] || 0,
      reps: 1,
      completed: true
    }];
    return acc;
  }, {} as Record<string, any[]>) || {};

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Section */}
      <WorkoutOverviewSection stats={stats} />
      
      {/* Exercise Volume and Muscle Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Exercise Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ExerciseVolumeChart
              exercises={exerciseData}
              weightUnit={weightUnit}
            />
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Muscle Focus</CardTitle>
          </CardHeader>
          <CardContent>
            <MuscleFocusChart muscleGroups={stats.muscleFocus} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
