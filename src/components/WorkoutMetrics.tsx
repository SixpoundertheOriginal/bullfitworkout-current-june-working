
import React, { useEffect } from "react";
import { Timer, Dumbbell, BarChart3, Clock, Play } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { TopRestTimer } from "./TopRestTimer";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { CircularProgress } from "@/components/ui/circular-progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
    <div className={className}>
      <div className="grid grid-cols-4 gap-3 p-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "relative group flex flex-col items-center justify-center p-4 rounded-2xl border border-white/5 backdrop-blur-xl transition-all duration-300",
                "bg-gradient-to-br from-sky-500/10 to-blue-500/10",
                "hover:from-sky-500/20 hover:to-blue-500/20 hover:scale-[1.02]"
              )}>
                <div className="relative">
                  <CircularProgress value={100} size={48} className="text-sky-500/20">
                    <Clock className="text-sky-400 absolute inset-0 m-auto" size={24} />
                    <div className="absolute -right-1 -top-1 w-2 h-2 bg-sky-500 rounded-full animate-pulse" />
                  </CircularProgress>
                </div>
                <span className="text-xl font-mono text-white font-medium mt-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  {formatTime(time)}
                </span>
                <span className="text-sm text-gray-400 font-medium mt-1">Time</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-gray-900/95 border-gray-800">
              <p>Tracked since {formattedStartTime}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "relative group flex flex-col items-center justify-center p-4 rounded-2xl border border-white/5 backdrop-blur-xl transition-all duration-300",
                "bg-gradient-to-br from-emerald-500/10 to-teal-500/10",
                "hover:from-emerald-500/20 hover:to-teal-500/20 hover:scale-[1.02]"
              )}>
                <div className="relative">
                  <CircularProgress 
                    value={exerciseCount > 0 ? 100 : 0} 
                    size={48} 
                    className="text-emerald-500/20"
                  >
                    <Dumbbell className="text-emerald-400 absolute inset-0 m-auto" size={24} />
                  </CircularProgress>
                </div>
                <span className="text-xl font-mono text-white font-medium mt-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  {exerciseCount}
                </span>
                <span className="text-sm text-gray-400 font-medium mt-1">Exercises</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-gray-900/95 border-gray-800">
              <p>Active exercises in your workout</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "relative group flex flex-col items-center justify-center p-4 rounded-2xl border border-white/5 backdrop-blur-xl transition-all duration-300",
                "bg-gradient-to-br from-violet-500/10 to-purple-500/10",
                "hover:from-violet-500/20 hover:to-purple-500/20 hover:scale-[1.02]"
              )}>
                <div className="relative">
                  <CircularProgress 
                    value={totalSets > 0 ? (completedSets / totalSets) * 100 : 0} 
                    size={48} 
                    className="text-violet-500/20"
                  >
                    <BarChart3 className="text-violet-400 absolute inset-0 m-auto" size={24} />
                  </CircularProgress>
                </div>
                <span className="text-xl font-mono text-white font-medium mt-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  {completedSets}/{totalSets}
                </span>
                <span className="text-sm text-gray-400 font-medium mt-1">Sets</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-gray-900/95 border-gray-800">
              <p>{`${((completedSets / totalSets) * 100).toFixed(0)}% sets completed`}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "relative group flex flex-col items-center justify-center p-4 rounded-2xl border border-white/5 backdrop-blur-xl transition-all duration-300",
                "bg-gradient-to-br from-orange-500/10 to-red-500/10",
                "hover:from-orange-500/20 hover:to-red-500/20 hover:scale-[1.02]"
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
                        "text-orange-400 absolute inset-0 m-auto",
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
                    className="mt-2 bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20 text-orange-100 transition-all duration-300"
                  >
                    <Play size={14} className="mr-1" /> Start Timer
                  </Button>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-gray-900/95 border-gray-800">
              <p>Rest timer auto-starts after each set</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <div className="px-4 py-2">
        <div className="flex justify-between text-xs font-medium mb-1">
          <span className="text-gray-400">Progress</span>
          <span 
            className={cn(
              "transition-colors duration-300",
              completionPercentage >= 75 ? "text-emerald-400" :
              completionPercentage >= 50 ? "text-teal-400" :
              completionPercentage >= 25 ? "text-sky-400" :
              "text-violet-400"
            )}
          >
            {Math.round(completionPercentage)}%
          </span>
        </div>
        <div className="relative">
          <Progress 
            value={completionPercentage} 
            className={cn(
              "h-2 bg-gray-800/50 overflow-hidden rounded-full transition-all duration-300",
              "[&>div]:bg-gradient-to-r",
              completionPercentage >= 75 ? "[&>div]:from-teal-500 [&>div]:to-emerald-500" :
              completionPercentage >= 50 ? "[&>div]:from-sky-500 [&>div]:to-teal-500" :
              completionPercentage >= 25 ? "[&>div]:from-violet-500 [&>div]:to-sky-500" :
              "[&>div]:from-violet-500 [&>div]:to-fuchsia-500"
            )}
          />
          
          <div className="absolute top-1/2 -translate-y-1/2 w-full flex justify-between px-1 pointer-events-none">
            {Array.from({ length: totalSets }).map((_, index) => {
              const isCompleted = index < completedSets;
              const position = `${(index / (totalSets - 1)) * 100}%`;
              
              return (
                <div 
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300 transform",
                    isCompleted ? 
                      cn(
                        "bg-white shadow-lg scale-100",
                        index === completedSets - 1 && "animate-pulse"
                      ) : 
                      "bg-gray-700 scale-75"
                  )}
                  style={{
                    position: 'absolute',
                    left: position,
                    transform: `translate(-50%, -50%) scale(${isCompleted ? 1 : 0.75})`
                  }}
                />
              );
            })}
          </div>
        </div>
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
