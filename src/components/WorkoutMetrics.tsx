
import React, { useState, useEffect } from "react";
import { Timer, Dumbbell, Clock, Play, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MetricCard } from "./metrics/MetricCard";
import { TopRestTimer } from "./TopRestTimer";
import { CircularProgress } from "@/components/ui/circular-progress";
import { cn } from "@/lib/utils";
import { theme } from "@/lib/theme";
import { typography } from "@/lib/typography";

interface WorkoutMetricsProps {
  time: number;
  exerciseCount: number;
  completedSets: number;
  totalSets: number;
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
  showRestTimer,
  onRestTimerComplete,
  onRestTimeUpdate,
  onManualRestStart,
  onRestTimerReset,
  restTimerResetSignal = 0,
  currentRestTime,
  className
}: WorkoutMetricsProps) => {
  const [resetCounter, setResetCounter] = useState(0);
  
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

  useEffect(() => {
    const handleToastReset = () => {
      if (showRestTimer) {
        setResetCounter(prev => prev + 1);
      }
    };

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement && 
                (node.classList.contains('toast') || 
                 node.getAttribute('role') === 'status' || 
                 node.getAttribute('data-sonner-toast') === 'true')) {
              if (node.textContent && node.textContent.includes("logged successfully")) {
                handleToastReset();
              }
            }
          });
        }
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => observer.disconnect();
  }, [showRestTimer]);

  const startTime = new Date();
  startTime.setSeconds(startTime.getSeconds() - time);
  const formattedStartTime = startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const completionPercentage = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  // Mock functions for card interactions - you can connect these to actual detail views
  const handleTimeCardClick = () => {
    console.log('Time card clicked - could show workout timeline');
  };

  const handleExerciseCardClick = () => {
    console.log('Exercise card clicked - could show exercise list');
  };

  const handleSetsCardClick = () => {
    console.log('Sets card clicked - could show detailed progress');
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Horizontal scroll container for mobile */}
      <div className="overflow-x-auto pb-2 sm:pb-0">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-4 rounded-2xl bg-gray-900/40 backdrop-blur-md border border-white/5 min-w-[320px]">
          {/* Time Card with enhanced styling */}
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

          {/* Enhanced Rest Timer Card */}
          <div className={cn(
            "group relative flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl border border-white/10 backdrop-blur-xl transition-all duration-300",
            "bg-gradient-to-br from-orange-600/20 via-orange-800/10 to-orange-900/20 hover:from-orange-600/30 hover:to-orange-900/30",
            "hover:scale-[1.02] hover:shadow-lg hover:shadow-orange-500/20",
            "min-w-[80px] w-full touch-target",
            "relative overflow-hidden"
          )}>
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-500/5 opacity-80" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative mb-1 sm:mb-2 rounded-full bg-orange-500/20 shadow-inner flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center transition-all duration-300 group-hover:scale-110">
                <CircularProgress
                  value={showRestTimer ? 100 : 0}
                  size={32}
                  className="text-orange-500/30"
                >
                  <Timer
                    size={16}
                    className={cn(
                      "text-orange-300 absolute inset-0 m-auto transition-all duration-300",
                      showRestTimer && "animate-pulse",
                      "group-hover:drop-shadow-lg"
                    )}
                  />
                </CircularProgress>
              </div>
              
              <TopRestTimer
                isActive={showRestTimer}
                onComplete={onRestTimerComplete}
                resetSignal={resetCounter}
                onTimeUpdate={onRestTimeUpdate}
                onManualStart={onManualRestStart}
                currentRestTime={currentRestTime}
                className="scale-90 sm:scale-100"
              />

              {!showRestTimer && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onManualRestStart}
                  className="mt-1 sm:mt-2 bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20 text-orange-300 transition-all duration-300 text-xs font-medium scale-90 sm:scale-100 hover:scale-100 sm:hover:scale-105"
                >
                  <Play size={12} className="mr-1" /> Start Timer
                </Button>
              )}
            </div>

            {/* Interactive indicator */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-2 h-2 bg-orange-300/50 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
