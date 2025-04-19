
import React, { useEffect } from 'react';
import { Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopRestTimerProps {
  isActive: boolean;
  onComplete: () => void;
  resetSignal: number;
  onTimeUpdate?: (time: number) => void;
}

export const TopRestTimer = ({ 
  isActive, 
  onComplete, 
  resetSignal,
  onTimeUpdate 
}: TopRestTimerProps) => {
  const [elapsedTime, setElapsedTime] = React.useState(0);
  const [isTimerActive, setIsTimerActive] = React.useState(false);
  const maxTime = 300; // 5 minutes max
  const timerRef = React.useRef<NodeJS.Timeout>();

  // This effect handles the reset signal
  useEffect(() => {
    if (resetSignal > 0) {
      console.log("Reset signal received:", resetSignal);
      setElapsedTime(0);
      setIsTimerActive(true);
    }
  }, [resetSignal]);
  
  // This effect handles activation state changes
  useEffect(() => {
    console.log("isActive changed:", isActive);
    if (isActive) {
      setIsTimerActive(true);
    } else {
      setIsTimerActive(false);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setElapsedTime(0);
    }
  }, [isActive]);

  // This effect handles the timer countdown
  useEffect(() => {
    if (isTimerActive && isActive) {
      console.log("Timer is active, counting up from", elapsedTime);
      timerRef.current = setTimeout(() => {
        if (elapsedTime < maxTime) {
          setElapsedTime(prev => {
            const newTime = prev + 1;
            if (onTimeUpdate) onTimeUpdate(newTime);
            return newTime;
          });
        } else {
          onComplete();
        }
      }, 1000);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [elapsedTime, isTimerActive, isActive, maxTime, onTimeUpdate, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isActive) {
    return (
      <div className="flex flex-col items-center gap-1">
        <Timer size={20} className="text-purple-400 mb-1" />
        <span className="text-sm font-mono text-gray-400">Rest</span>
        <span className="text-lg font-mono text-white">00:00</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <Timer 
        size={20} 
        className={cn(
          "text-purple-400 mb-1",
          isTimerActive && "animate-pulse"
        )} 
      />
      <span className="text-lg font-mono text-white">
        {formatTime(elapsedTime)}
      </span>
      <span className="text-sm text-gray-400 font-medium mt-1">Rest</span>
    </div>
  );
};
