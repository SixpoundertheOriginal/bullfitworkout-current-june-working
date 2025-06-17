
import React from 'react';
import { Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PriorityTimerDisplayProps {
  workoutTime: string;
  restTime?: string;
  isRestActive?: boolean;
  onRestTimerClick?: () => void;
  className?: string;
}

export const PriorityTimerDisplay: React.FC<PriorityTimerDisplayProps> = ({
  workoutTime,
  restTime,
  isRestActive = false,
  onRestTimerClick,
  className
}) => {
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

      {/* Rest Timer (when active) */}
      {isRestActive && restTime && (
        <div 
          className="flex items-center space-x-3 cursor-pointer"
          onClick={onRestTimerClick}
        >
          <div>
            <div className="text-xl font-mono font-bold text-orange-400 text-right">
              {restTime}
            </div>
            <div className="text-sm text-gray-400 text-right">
              Rest Time
            </div>
          </div>
          <div className="p-2 bg-orange-500/20 rounded-xl">
            <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse" />
          </div>
        </div>
      )}
    </div>
  );
};
