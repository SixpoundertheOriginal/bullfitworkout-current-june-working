
import React, { useState, useEffect } from "react";
import { Dumbbell, TrendingUp } from "lucide-react";
import { MetricCard } from "./metrics/MetricCard";
import { UnifiedTimerDisplay } from "./timers/UnifiedTimerDisplay";
import { useWeightUnit } from "@/context/WeightUnitContext";
import { formatWeightWithUnit } from "@/utils/unitConversion";
import { cn } from "@/lib/utils";
import { useTrainingTimers } from "@/hooks/useTrainingTimers";

interface WorkoutMetricsProps {
  exerciseCount: number;
  completedSets: number;
  totalSets: number;
  totalVolume: number;
  totalReps: number;
  className?: string;
}

export const WorkoutMetrics = ({
  exerciseCount,
  completedSets,
  totalSets,
  totalVolume,
  totalReps,
  className
}: WorkoutMetricsProps) => {
  const { weightUnit } = useWeightUnit();
  const { workoutTimer, restTimer } = useTrainingTimers();

  const completionPercentage = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  // Mock functions for card interactions
  const handleExerciseCardClick = () => {
    console.log('Exercise card clicked - could show exercise list');
  };

  const handleSetsCardClick = () => {
    console.log('Sets card clicked - could show detailed progress');
  };

  return (
    <div className={cn("relative w-full space-y-4", className)}>
      {/* Unified Timer Display */}
      <UnifiedTimerDisplay 
        workoutTimer={workoutTimer}
        restTimer={restTimer}
      />

      {/* Exercise Metrics Cards */}
      <div className="overflow-x-auto pb-2 sm:pb-0">
        <div className="grid grid-cols-2 gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-gray-900/40 backdrop-blur-md border border-white/5 min-w-[300px]">
          {/* Exercise Count Card */}
          <MetricCard
            icon={Dumbbell}
            value={exerciseCount}
            label="Exercises"
            tooltip="Number of different exercises in your current workout. Variety helps target different muscle groups effectively."
            onClick={handleExerciseCardClick}
            variant="exercises"
            className="touch-target"
          />

          {/* Sets Card with progress and footer */}
          <MetricCard
            icon={TrendingUp}
            value={`${completedSets}/${totalSets}`}
            label="Sets"
            tooltip={`${Math.round(completionPercentage)}% of your workout completed. Keep pushing to reach your goals!`}
            progressValue={completionPercentage}
            onClick={handleSetsCardClick}
            variant="sets"
            className="touch-target"
            footerLeft={`${totalReps} reps`}
            footerRight={formatWeightWithUnit(totalVolume, weightUnit, 0) + ' vol'}
          />
        </div>
      </div>
    </div>
  );
};
