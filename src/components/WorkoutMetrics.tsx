
import React, { useState, useEffect } from "react";
import { Timer, Dumbbell, Clock, Play } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { MetricCard } from "./metrics/MetricCard";
import { TopRestTimer } from "./TopRestTimer";
import { CircularProgress } from "@/components/ui/circular-progress";
import { cn } from "@/lib/utils";
import { theme } from "@/lib/theme";

interface WorkoutMetricsProps {
  time: number;
  exerciseCount: number;
  completedSets: number;
  totalSets: number;
  showRestTimer: boolean;
  onRestTimerComplete: () => void;
  onRestTimeUpdate?: (time: number) => void;
  onManualRestStart?: () => void;
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
  className 
}: WorkoutMetricsProps) => {
  const [resetCounter, setResetCounter] = useState(0);
  
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

  return (
    <div className={cn("relative", className)}>
      <div className="grid grid-cols-4 gap-3 p-4">
        <MetricCard
          icon={Clock}
          value={formatTime(time)}
          label="Time"
          tooltip={`Tracked since ${formattedStartTime}`}
          gradientClass="from-sky-500/5 to-blue-500/5 hover:from-sky-500/10 hover:to-blue-500/10"
          valueClass="text-sky-600 font-semibold"
          labelClass="text-gray-500"
        />
        
        <MetricCard
          icon={Dumbbell}
          value={exerciseCount}
          label="Exercises"
          tooltip="Active exercises in your workout"
          gradientClass="from-emerald-500/5 to-teal-500/5 hover:from-emerald-500/10 hover:to-teal-500/10"
          valueClass="text-emerald-600 font-semibold"
          labelClass="text-gray-500"
        />
        
        <MetricCard
          icon={Timer}
          value={`${completedSets}/${totalSets}`}
          label="Sets"
          tooltip={`${Math.round(completionPercentage)}% sets completed`}
          progressValue={completionPercentage}
          gradientClass="from-violet-500/5 to-purple-500/5 hover:from-violet-500/10 hover:to-purple-500/10"
          valueClass="text-violet-600 font-semibold"
          labelClass="text-gray-500"
        />
        
        <div className={cn(
          "relative group flex flex-col items-center justify-center p-4 rounded-2xl border border-white/5 backdrop-blur-xl transition-all duration-300",
          "bg-gradient-to-br from-orange-500/5 to-red-500/5",
          "hover:from-orange-500/10 hover:to-red-500/10 hover:scale-[1.02]"
        )}>
          <div className="relative">
            <CircularProgress 
              value={showRestTimer ? 100 : 0} 
              size={48} 
              className="text-orange-500/20"
            >
              <Timer 
                size={24} 
                className={cn(
                  "text-orange-500 absolute inset-0 m-auto",
                  showRestTimer && "animate-pulse"
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
          />
          
          {!showRestTimer && (
            <Button
              variant="outline"
              size="sm"
              onClick={onManualRestStart}
              className="mt-2 bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20 text-orange-600 transition-all duration-300"
            >
              <Play size={14} className="mr-1" /> Start Timer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
