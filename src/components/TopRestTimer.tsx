
import React, { useEffect } from 'react';
import { Timer } from 'lucide-react';
import { RestTimerControls } from './RestTimerControls';
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
  const [isTimerActive, setIsTimerActive] = React.useState(true);
  const maxTime = 300; // 5 minutes max
  const timerRef = React.useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isActive && resetSignal > 0) {
      setElapsedTime(0);
      setIsTimerActive(true);
    }
  }, [resetSignal, isActive]);
  
  useEffect(() => {
    if (isActive) {
      setIsTimerActive(true);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setElapsedTime(0);
    }
  }, [isActive]);

  useEffect(() => {
    if (isTimerActive && isActive) {
      timerRef.current = setTimeout(() => {
        if (elapsedTime < maxTime) {
          setElapsedTime(prev => {
            const newTime = prev + 1;
            onTimeUpdate?.(newTime);
            return newTime;
          });
        }
      }, 1000);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [elapsedTime, isTimerActive, isActive, maxTime, onTimeUpdate]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isActive) {
    return (
      <div className="flex flex-col items-center gap-1">
        <Timer size={20} className="text-purple-400 mb-1" />
        <span className="text-xs text-gray-400 font-medium">Rest</span>
        <span className="text-sm font-mono text-gray-500">00:00</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <Timer size={20} className={cn(
        "text-purple-400 mb-1",
        isTimerActive && "animate-pulse"
      )} />
      <span className="text-lg font-mono text-white">
        {formatTime(elapsedTime)}
      </span>
      <span className="text-xs text-gray-400 font-medium mt-1">Rest</span>
    </div>
  );
};
