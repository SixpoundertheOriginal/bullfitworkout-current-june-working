
import React, { useEffect, useRef, useState } from 'react';
import { Timer, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { CircularProgress } from '@/components/ui/circular-progress';

interface TopRestTimerProps {
  isActive: boolean;
  onComplete?: () => void;
  resetSignal: number;
  onTimeUpdate?: (time: number) => void;
  onManualStart?: () => void;
  defaultRestTime?: number;
  currentRestTime?: number;
}

export const TopRestTimer = ({ 
  isActive, 
  onComplete, 
  resetSignal,
  onTimeUpdate,
  onManualStart,
  defaultRestTime = 60,
  currentRestTime
}: TopRestTimerProps) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [targetTime] = useState(currentRestTime || defaultRestTime);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastResetSignalRef = useRef<number>(0);

  const clearTimerInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startTimerInterval = () => {
    if (!startTimeRef.current) {
      startTimeRef.current = Date.now();
    }

    clearTimerInterval();
    
    intervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current) / 1000);
        setElapsedTime(elapsed);
        
        if (onTimeUpdate) {
          onTimeUpdate(elapsed);
        }
      }
    }, 1000);
  };

  useEffect(() => {
    if (resetSignal > 0 && resetSignal !== lastResetSignalRef.current) {
      console.log('TopRestTimer: New reset signal received:', resetSignal);
      lastResetSignalRef.current = resetSignal;
      setElapsedTime(0);
      startTimeRef.current = Date.now();
      setIsTimerActive(true);
      startTimerInterval();
    }
  }, [resetSignal]);

  useEffect(() => {
    if (isActive) {
      setIsTimerActive(true);
      startTimerInterval();
    } else {
      setIsTimerActive(false);
      clearTimerInterval();
      setElapsedTime(0);
      startTimeRef.current = null;
    }

    return () => {
      clearTimerInterval();
    };
  }, [isActive]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <CircularProgress 
          value={(elapsedTime / targetTime) * 100}
          size={48}
          className="text-orange-500/20"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn(
              "text-sm font-mono",
              elapsedTime >= targetTime ? "text-orange-400" : "text-gray-200"
            )}>
              {formatTime(elapsedTime)}
            </span>
          </div>
        </CircularProgress>
        
        {targetTime > 0 && (
          <div className="mt-1 text-xs text-gray-400 text-center">
            Target: {formatTime(targetTime)}
          </div>
        )}
      </div>

      {!isTimerActive && onManualStart && (
        <Button
          variant="outline"
          size="sm"
          onClick={onManualStart}
          className="mt-2 bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20 text-orange-300"
        >
          <Play size={12} className="mr-1" /> Start Timer
        </Button>
      )}
    </div>
  );
};
