
import React, { useState, useEffect } from "react";
import { Timer, Dumbbell, Clock, TrendingUp, Weight, Repeat } from "lucide-react";
import { MetricCard } from "./metrics/MetricCard";
import { TimerContainer } from "./timers/TimerContainer";
import { useWeightUnit } from "@/context/WeightUnitContext";
import { formatWeightWithUnit } from "@/utils/unitConversion";
import { cn } from "@/lib/utils";

interface WorkoutMetricsProps {
  time: number;
  exerciseCount: number;
  completedSets: number;
  totalSets: number;
  totalVolume: number;
  totalReps: number;
  showRestTimer: boolean;
  onRestTimerComplete: () => void;
  onRestTimeUpdate?: (time: number) => void;
  onManualRestStart?: () => void;
  onRestTimerReset?: () => void;
  restTimerResetSignal?: number;
  currentRestTime?: number;
  className?: string;
}

export const WorkoutMetrics = ({
  time,
  exerciseCount,
  completedSets,
  totalSets,
  totalVolume,
  totalReps,
  showRestTimer,
  onRestTimerComplete,
  onRestTimeUpdate,
  onManualRestStart,
  onRestTimerReset,
  restTimerResetSignal = 0,
  currentRestTime,
  className
}: WorkoutMetricsProps) => {
  const { weightUnit } = useWeightUnit();
  const [resetCounter, setResetCounter] = useState(0);
  const [manualTimerTime, setManualTimerTime] = useState(0);
  const [isManualTimerActive, setIsManualTimerActive] = useState(false);
  
  // Use the external reset signal
  useEffect(() => {
    if (restTimerResetSignal > 0) {
      setResetCounter(restTimerResetSignal);
    }
  }, [restTimerResetSignal]);

  useEffect(() => {
    if (showRestTimer) {
      setResetCounter(prev => prev + 1);
    }
  }, [showRestTimer]);

  // Manual timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isManualTimerActive) {
      interval = setInterval(() => {
        setManualTimerTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isManualTimerActive]);

  const startTime = new Date();
  startTime.setSeconds(startTime.getSeconds() - time);
  const formattedStartTime = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const completionPercentage = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  // Mock functions for card interactions
  const handleTimeCardClick = () => {
    console.log('Time card clicked - could show workout timeline');
  };

  const handleExerciseCardClick = () => {
    console.log('Exercise card clicked - could show exercise list');
  };

  const handleSetsCardClick = () => {
    console.log('Sets card clicked - could show detailed progress');
  };

  const handleVolumeCardClick = () => {
    console.log('Volume card clicked - could show volume breakdown');
  };

  const handleRepsCardClick = () => {
    console.log('Reps card clicked - could show reps analysis');
  };

  // Timer handlers
  const handleSmartTimerStop = () => {
    onRestTimerComplete();
  };

  const handleSmartTimerSkip = () => {
    onRestTimerComplete();
  };

  const handleManualTimerStart = () => {
    setIsManualTimerActive(true);
  };

  const handleManualTimerStop = () => {
    setIsManualTimerActive(false);
  };

  const handleManualTimerReset = () => {
    setIsManualTimerActive(false);
    setManualTimerTime(0);
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Metrics Cards */}
      <div className="overflow-x-auto pb-2 sm:pb-0">
        <div className="grid grid-cols-5 gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-gray-900/40 backdrop-blur-md border border-white/5 min-w-[400px]">
          {/* Time Card */}
          <MetricCard
            icon={Clock}
            value={formatTime(time)}
            label="Duration"
            tooltip={`Workout started at ${formattedStartTime}. Track your session duration and stay consistent with your training schedule.`}
            onClick={handleTimeCardClick}
            variant="time"
            className="touch-target"
          />

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

          {/* Sets Card with progress */}
          <MetricCard
            icon={TrendingUp}
            value={`${completedSets}/${totalSets}`}
            label="Sets"
            tooltip={`${Math.round(completionPercentage)}% of your workout completed. Keep pushing to reach your goals!`}
            progressValue={completionPercentage}
            onClick={handleSetsCardClick}
            variant="sets"
            className="touch-target"
          />

          {/* Volume Card */}
          <MetricCard
            icon={Weight}
            value={formatWeightWithUnit(totalVolume, weightUnit, 0)}
            label="Volume"
            tooltip={`Total tonnage (weight × reps) for all completed sets. Higher volume typically leads to better muscle growth and strength gains.`}
            onClick={handleVolumeCardClick}
            variant="default"
            className="touch-target"
          />

          {/* Reps Card */}
          <MetricCard
            icon={Repeat}
            value={totalReps}
            label="Reps"
            tooltip={`Total repetitions completed across all exercises. Tracking reps helps monitor workout density and training volume.`}
            onClick={handleRepsCardClick}
            variant="default"
            className="touch-target"
          />
        </div>
      </div>

      {/* Timer Section */}
      <div className="mt-4">
        <div className="rounded-2xl bg-gray-900/40 backdrop-blur-md border border-white/5">
          <TimerContainer
            smartTimerActive={showRestTimer}
            smartTimerCurrentTime={currentRestTime || 0}
            smartTimerTargetTime={60}
            onSmartTimerStart={onManualRestStart}
            onSmartTimerStop={handleSmartTimerStop}
            onSmartTimerSkip={handleSmartTimerSkip}
            manualTimerActive={isManualTimerActive}
            manualTimerCurrentTime={manualTimerTime}
            onManualTimerStart={handleManualTimerStart}
            onManualTimerStop={handleManualTimerStop}
            onManualTimerReset={handleManualTimerReset}
          />
        </div>
      </div>
    </div>
  );
};
