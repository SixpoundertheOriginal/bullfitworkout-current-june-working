
import React, { useEffect } from "react";
import { Timer, Dumbbell, BarChart3, Clock } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { TopRestTimer } from "./TopRestTimer";
import { toast } from "@/hooks/use-toast";

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
  const [resetCounter, setResetCounter] = React.useState(0);
  
  // Effect to reset the timer whenever showRestTimer changes to true
  useEffect(() => {
    console.log("WorkoutMetrics: showRestTimer changed to", showRestTimer);
    if (showRestTimer) {
      console.log("WorkoutMetrics: Incrementing reset counter. Current value:", resetCounter);
      setResetCounter(prev => prev + 1);
    }
  }, [showRestTimer]);

  // Listen for toast events to reset timer
  useEffect(() => {
    const handleToastReset = () => {
      // Listen for 'set-complete' toasts
      console.log("WorkoutMetrics: Checking if we need to reset timer based on toast");
      if (showRestTimer) {
        console.log("WorkoutMetrics: Resetting timer due to set complete toast");
        setResetCounter(prev => prev + 1);
      }
    };

    // Set up event listener for when sonner toast appears
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const completionPercentage = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  return (
    <div className={className}>
      <div className="grid grid-cols-4 bg-gray-900/95 backdrop-blur-sm p-4 rounded-xl border border-gray-800/40 shadow-lg">
        <MetricItem
          icon={<Clock className="text-purple-400" size={20} />}
          value={formatTime(time)}
          label="Time"
          pulseIcon
        />
        
        <MetricItem
          icon={<Dumbbell className="text-purple-400" size={20} />}
          value={exerciseCount.toString()}
          label="Exercises"
        />
        
        <MetricItem
          icon={<BarChart3 className="text-purple-400" size={20} />}
          value={`${completedSets}/${totalSets}`}
          label="Sets"
          valueClassName="flex items-baseline gap-1 text-lg font-mono"
        />

        <div className="flex flex-col items-center">
          <TopRestTimer 
            isActive={showRestTimer} 
            onComplete={onRestTimerComplete}
            resetSignal={resetCounter}
            onTimeUpdate={onRestTimeUpdate}
            onManualStart={onManualRestStart}
          />
        </div>
      </div>
      
      <div className="px-4 py-2 mt-1">
        <div className="flex justify-between text-xs font-medium mb-1">
          <span className="text-gray-400">Progress</span>
          <span className="text-purple-400">{Math.round(completionPercentage)}%</span>
        </div>
        <Progress 
          value={completionPercentage} 
          className="h-1.5 bg-gray-800 [&>div]:bg-gradient-to-r [&>div]:from-purple-600 [&>div]:to-pink-500"
        />
      </div>
    </div>
  );
};

interface MetricItemProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  pulseIcon?: boolean;
  valueClassName?: string;
}

const MetricItem: React.FC<MetricItemProps> = ({
  icon,
  value,
  label,
  pulseIcon,
  valueClassName
}) => (
  <div className="flex flex-col items-center">
    <div className={cn("relative mb-1", pulseIcon && "animate-pulse")}>
      {icon}
      {pulseIcon && (
        <div className="absolute -right-1 -top-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
      )}
    </div>
    <span className={cn(
      "text-lg font-mono text-white transition-all duration-300 ease-in-out",
      valueClassName
    )}>
      {value}
    </span>
    <span className="text-xs text-gray-400 font-medium">{label}</span>
  </div>
);
