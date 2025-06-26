
import React from 'react';
import { Timer, Bell, BellRing } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriorityTimerDisplayProps {
  workoutTime: string;
  restTime?: string;
  isRestActive?: boolean;
  restProgress?: number; // 0-100 for progress, >100 for overtime
  isOvertime?: boolean;
  onRestTimerClick?: () => void;
  className?: string;
}

export const PriorityTimerDisplay: React.FC<PriorityTimerDisplayProps> = ({
  workoutTime,
  restTime,
  isRestActive = false,
  restProgress = 0,
  isOvertime = false,
  onRestTimerClick,
  className
}) => {
  const getRestTimerColor = () => {
    if (isOvertime) return 'text-red-400';
    if (restProgress > 80) return 'text-orange-400';
    if (restProgress > 50) return 'text-yellow-400';
    return 'text-blue-400';
  };

  const getRestTimerBgColor = () => {
    if (isOvertime) return 'bg-red-500/20';
    if (restProgress > 80) return 'bg-orange-500/20';
    if (restProgress > 50) return 'bg-yellow-500/20';
    return 'bg-blue-500/20';
  };

  return (
    <div className={cn(
      "flex items-center justify-between",
      className
    )}>
      {/* Primary Workout Timer */}
      <div className="flex items-center space-x-3">
        <div className="p-3 bg-purple-500/20 rounded-2xl">
          <Timer className="h-6 w-6 text-purple-400" />
        </div>
        <div>
          <div className="text-2xl font-mono font-bold text-white">
            {workoutTime}
          </div>
          <div className="text-sm text-gray-400">
            Workout Time
          </div>
        </div>
      </div>

      {/* Enhanced Rest Timer (when active) */}
      {isRestActive && restTime && (
        <div 
          className={cn(
            "flex items-center space-x-3 cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95",
            "p-2 rounded-xl hover:bg-gray-800/50"
          )}
          onClick={onRestTimerClick}
        >
          <div>
            <div className={cn(
              "text-xl font-mono font-bold text-right transition-colors duration-300",
              getRestTimerColor(),
              isOvertime && "animate-pulse"
            )}>
              {isOvertime && '+'}
              {restTime}
            </div>
            <div className="text-sm text-gray-400 text-right">
              {isOvertime ? 'Overtime' : 'Rest Time'}
            </div>
            
            {/* Progress bar */}
            <div className="w-16 h-1 bg-gray-700 rounded-full mt-1 overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-1000 ease-out",
                  isOvertime ? 'bg-red-500' : 'bg-blue-500'
                )}
                style={{ 
                  width: isOvertime ? '100%' : `${Math.min(restProgress, 100)}%` 
                }}
              />
            </div>
            
            {/* Tap hint */}
            <div className="text-xs text-gray-500 text-right mt-1">
              Tap to adjust
            </div>
          </div>
          
          <div className={cn(
            "p-2 rounded-xl transition-all duration-300",
            getRestTimerBgColor()
          )}>
            {isOvertime ? (
              <BellRing className="w-3 h-3 text-red-400 animate-bounce" />
            ) : (
              <div className={cn(
                "w-3 h-3 rounded-full transition-colors duration-300",
                getRestTimerColor().replace('text-', 'bg-'),
                restProgress > 90 && "animate-pulse"
              )} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
