
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
      <div className="grid grid-cols-4 gap-2 p-4">
        <MetricItem
          icon={<Clock className="text-purple-400" size={24} />}
          value={formatTime(time)}
          label="Time"
          backgroundClass="from-purple-500/20 to-pink-500/20"
          pulseIcon
        />
        
        <MetricItem
          icon={<Dumbbell className="text-purple-400" size={24} />}
          value={exerciseCount.toString()}
          label="Exercises"
          backgroundClass="from-purple-500/20 to-pink-500/20"
        />
        
        <MetricItem
          icon={<BarChart3 className="text-purple-400" size={24} />}
          value={`${completedSets}/${totalSets}`}
          label="Sets"
          backgroundClass="from-purple-500/20 to-pink-500/20"
          valueClassName="flex items-baseline gap-1 text-lg font-mono"
        />

        <MetricItem
          icon={<Timer className="text-purple-400" size={24} />}
          customContent={
            <TopRestTimer 
              isActive={showRestTimer} 
              onComplete={onRestTimerComplete}
              resetSignal={resetCounter}
              onTimeUpdate={onRestTimeUpdate}
              onManualStart={onManualRestStart}
            />
          }
          label="Rest"
          backgroundClass="from-purple-500/20 to-pink-500/20"
        />
      </div>
      
      <div className="px-4 py-2">
        <div className="flex justify-between text-xs font-medium mb-1">
          <span className="text-gray-400">Progress</span>
          <span className="text-purple-400">{Math.round(completionPercentage)}%</span>
        </div>
        <Progress 
          value={completionPercentage} 
          className="h-1.5 bg-gray-800/50 overflow-hidden rounded-full [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-pink-500"
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
        <div className="absolute -right-1 -top-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
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
