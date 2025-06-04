
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Play, RotateCcw, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ManualTimerCardProps {
  isActive: boolean;
  currentTime: number;
  onStart?: () => void;
  onStop?: () => void;
  onReset?: () => void;
  className?: string;
}

export const ManualTimerCard: React.FC<ManualTimerCardProps> = ({
  isActive,
  currentTime,
  onStart,
  onStop,
  onReset,
  className
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-3", className)}>
      {/* Timer Display */}
      <div className={cn(
        "bg-muted/40 rounded-xl px-4 py-3 transition-all duration-300",
        isActive && "bg-blue-500/10 ring-1 ring-blue-500/30"
      )}>
        <span 
          className={cn(
            "font-mono text-lg font-bold",
            isActive ? "text-blue-300" : "text-white"
          )}
          aria-live="polite"
          aria-label={`Manual timer: ${formatTime(currentTime)}`}
        >
          {formatTime(currentTime)}
        </span>
      </div>

      {/* Label */}
      <div className="text-center">
        <span className="text-xs text-muted-foreground font-medium">
          Manual
        </span>
        {isActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-2 h-2 bg-blue-400 rounded-full mt-1 mx-auto animate-pulse"
          />
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={isActive ? onStop : onStart}
          className={cn(
            "bg-muted hover:scale-105 transition-transform text-xs px-3 py-1.5",
            isActive 
              ? "hover:bg-red-500/20 text-red-300" 
              : "hover:bg-green-500/20 text-green-300"
          )}
          aria-label={isActive ? "Pause manual timer" : "Start manual timer"}
        >
          {isActive ? (
            <>
              <Pause size={12} className="mr-1" />
              Pause
            </>
          ) : (
            <>
              <Play size={12} className="mr-1" />
              Start
            </>
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={currentTime === 0}
          className="bg-muted hover:scale-105 transition-transform hover:bg-orange-500/20 text-orange-300 text-xs px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Reset manual timer"
        >
          <RotateCcw size={12} className="mr-1" />
          Reset
        </Button>
      </div>
    </div>
  );
};
