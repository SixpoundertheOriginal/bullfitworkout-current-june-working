
import React, { useEffect, useRef } from "react";
import { Timer, Dumbbell, BarChart3 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { TopRestTimer } from "./TopRestTimer";

interface WorkoutMetricsProps {
  time: number;
  exerciseCount: number;
  completedSets: number;
  totalSets: number;
  showRestTimer: boolean;
  onRestTimerComplete: () => void;
  className?: string;
}

export const WorkoutMetrics = ({ 
  time, 
  exerciseCount, 
  completedSets, 
  totalSets,
  showRestTimer,
  onRestTimerComplete,
  className 
}: WorkoutMetricsProps) => {
  // Add a ref to track previous showRestTimer state
  const prevShowRestTimerRef = useRef(showRestTimer);
  
  // Add a reset counter to force timer resets
  const [resetCounter, setResetCounter] = React.useState(0);
  
  // Effect to detect changes in showRestTimer
  useEffect(() => {
    // Log state changes for debugging
    if (prevShowRestTimerRef.current !== showRestTimer) {
      console.log(`Rest timer state changed: ${prevShowRestTimerRef.current} -> ${showRestTimer}`);
      
      // If timer becomes active, increment the reset counter
      if (showRestTimer) {
        setResetCounter(prev => prev + 1);
        console.log(`New rest timer activation at: ${new Date().toISOString()}`);
      }
    }
    
    // Update the ref
    prevShowRestTimerRef.current = showRestTimer;
  }, [showRestTimer]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const completionPercentage = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  return (
    <div className={className}>
      <div className="grid grid-cols-4 bg-gray-900/95 backdrop-blur-sm p-4 rounded-md shadow-lg">
        <div className="flex flex-col items-center">
          <div className="relative">
            <Timer className="text-purple-400 mb-1" size={20} />
            <div className="absolute -right-1 -top-1 w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
          </div>
          <span className="text-lg font-mono transition-all duration-300 ease-in-out">{formatTime(time)}</span>
          <span className="text-xs text-gray-400 font-medium">Time</span>
        </div>
        
        <div className="flex flex-col items-center">
          <Dumbbell className="text-purple-400 mb-1" size={20} />
          <span className="text-lg font-mono transition-all duration-300 ease-in-out">{exerciseCount}</span>
          <span className="text-xs text-gray-400 font-medium">Exercises</span>
        </div>
        
        <div className="flex flex-col items-center">
          <BarChart3 className="text-purple-400 mb-1" size={20} />
          <div className="flex items-baseline">
            <span className="text-lg font-mono transition-all duration-300 ease-in-out">{completedSets}</span>
            <span className="text-xs text-gray-500">/</span>
            <span className="text-sm text-gray-500">{totalSets}</span>
          </div>
          <span className="text-xs text-gray-400 font-medium">Sets</span>
        </div>

        <div className="flex flex-col items-center">
          <TopRestTimer 
            isActive={showRestTimer} 
            onComplete={onRestTimerComplete}
            resetSignal={resetCounter} 
          />
        </div>
      </div>
      
      <div className="px-4 py-2 mt-1">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Progress</span>
          <span>{Math.round(completionPercentage)}%</span>
        </div>
        <Progress 
          value={completionPercentage} 
          className="h-1.5 bg-gray-800 [&>div]:bg-gradient-to-r [&>div]:from-purple-600 [&>div]:to-pink-500"
        />
      </div>
    </div>
  );
};
