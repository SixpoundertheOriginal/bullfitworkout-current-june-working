
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { StopCircle, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SmartRestTimerCardProps {
  isActive: boolean;
  currentTime: number;
  targetTime?: number;
  onStart?: () => void;
  onStop?: () => void;
  onSkip?: () => void;
  className?: string;
}

export const SmartRestTimerCard: React.FC<SmartRestTimerCardProps> = ({
  isActive,
  currentTime,
  targetTime = 60,
  onStart,
  onStop,
  onSkip,
  className
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = targetTime > 0 ? Math.min((currentTime / targetTime) * 100, 100) : 0;

  return (
    <div className={cn("flex flex-col items-center justify-center space-y-3", className)}>
      {/* Circular Timer */}
      <div className="relative">
        <motion.div
          className={cn(
            "w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all duration-300",
            isActive 
              ? "border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/20" 
              : "border-gray-600 bg-gray-800/50"
          )}
          animate={isActive ? { scale: [1, 1.02, 1] } : { scale: 1 }}
          transition={{ duration: 1, repeat: isActive ? Infinity : 0 }}
        >
          {/* Progress Ring */}
          {isActive && (
            <svg className="absolute inset-0 w-20 h-20 transform -rotate-90">
              <circle
                cx="40"
                cy="40"
                r="36"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                className="text-orange-500/30"
                strokeDasharray={`${(progress / 100) * 226} 226`}
                style={{
                  transition: 'stroke-dasharray 0.3s ease-in-out',
                }}
              />
            </svg>
          )}
          
          {/* Timer Display */}
          <span 
            className={cn(
              "font-mono text-sm font-bold",
              isActive ? "text-orange-300" : "text-gray-400"
            )}
            aria-live="polite"
            aria-label={`Rest timer: ${formatTime(currentTime)}`}
          >
            {formatTime(currentTime)}
          </span>
        </motion.div>
      </div>

      {/* Label */}
      <div className="text-center">
        <span className="text-xs text-muted-foreground font-medium">
          Auto rest tracker
        </span>
      </div>

      {/* Controls - Only show when active */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="flex gap-2"
        >
          <Button
            variant="outline"
            size="sm"
            onClick={onStop}
            className="bg-red-500/10 border-red-500/30 hover:bg-red-500/20 text-red-300 text-xs px-2 py-1"
            aria-label="Stop rest timer"
          >
            <StopCircle size={12} className="mr-1" />
            Stop
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onSkip}
            className="bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 text-blue-300 text-xs px-2 py-1"
            aria-label="Skip rest timer"
          >
            <SkipForward size={12} className="mr-1" />
            Skip
          </Button>
        </motion.div>
      )}
    </div>
  );
};
