import React, { useEffect } from "react";
import { Timer, Dumbbell, BarChart3, Clock, Play } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { TopRestTimer } from "./TopRestTimer";
import { Button } from "@/components/ui/button";
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
    if (showRestTimer) {
      setResetCounter(prev => prev + 1);
    }
  }, [showRestTimer]);

  // Listen for toast events to reset timer
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const completionPercentage = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  return (
    <div className={className}>
      <div className="grid grid-cols-4 gap-3 p-4">
        <MetricItem
          icon={<Clock className="text-sky-400" size={24} />}
          value={formatTime(time)}
          label="Time"
          backgroundClass="from-sky-500/20 to-blue-500/20"
          pulseIcon
        />
        
        <MetricItem
          icon={<Dumbbell className="text-emerald-400" size={24} />}
          value={exerciseCount.toString()}
          label="Exercises"
          backgroundClass="from-emerald-500/20 to-teal-500/20"
        />
        
        <MetricItem
          icon={<BarChart3 className="text-violet-400" size={24} />}
          value={`${completedSets}/${totalSets}`}
          label="Sets"
          backgroundClass="from-violet-500/20 to-purple-500/20"
          valueClassName="flex items-baseline gap-1 text-lg font-mono"
        />

        <div className={cn(
          "flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br border border-white/5 backdrop-blur-xl relative",
          "from-orange-500/20 to-red-500/20"
        )}>
          <div className="flex flex-col items-center">
            <Timer size={24} className={cn(
              "text-orange-400 mb-2",
              showRestTimer && "animate-pulse"
            )} />
            <TopRestTimer 
              isActive={showRestTimer} 
              onComplete={onRestTimerComplete}
              resetSignal={resetCounter}
              onTimeUpdate={onRestTimeUpdate}
              onManualStart={onManualRestStart}
            />
            <span className="text-sm text-gray-400 font-medium mt-1">Rest</span>
          </div>
          
          {!showRestTimer && (
            <Button
              variant="outline"
              size="sm"
              onClick={onManualRestStart}
              className="mt-2 bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20 text-orange-100"
            >
              <Play size={14} className="mr-1" /> Start Timer
            </Button>
          )}
        </div>
      </div>
      
      <div className="px-4 py-2">
        <div className="flex justify-between text-xs font-medium mb-1">
          <span className="text-gray-400">Progress</span>
          <span className="text-violet-400">{Math.round(completionPercentage)}%</span>
        </div>
        <Progress 
          value={completionPercentage} 
          className="h-1.5 bg-gray-800/50 overflow-hidden rounded-full [&>div]:bg-gradient-to-r [&>div]:from-violet-500 [&>div]:to-fuchsia-500"
        />
      </div>
    </div>
  );
};

interface MetricItemProps {
  icon: React.ReactNode;
  value?: string;
  label: string;
  pulseIcon?: boolean;
  valueClassName?: string;
  backgroundClass?: string;
  customContent?: React.ReactNode;
}

const MetricItem: React.FC<MetricItemProps> = ({
  icon,
  value,
  label,
  pulseIcon,
  valueClassName,
  backgroundClass,
  customContent
}) => (
  <div className={cn(
    "flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-br border border-white/5 backdrop-blur-xl",
    backgroundClass
  )}>
    <div className={cn("relative mb-2", pulseIcon && "animate-pulse")}>
      {icon}
      {pulseIcon && (
        <div className="absolute -right-1 -top-1 w-2 h-2 bg-sky-500 rounded-full animate-pulse" />
      )}
    </div>
    {customContent ? (
      customContent
    ) : (
      <>
        <span className={cn(
          "text-xl font-mono text-white font-medium bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent",
          valueClassName
        )}>
          {value}
        </span>
        <span className="text-sm text-gray-400 font-medium mt-1">{label}</span>
      </>
    )}
  </div>
);
