
import React, { useEffect, useRef } from 'react';
import { Timer, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface TopRestTimerProps {
  isActive: boolean;
  onComplete: () => void;
  resetSignal: number;
  onTimeUpdate?: (time: number) => void;
  onManualStart?: () => void;
}

export const TopRestTimer = ({ 
  isActive, 
  onComplete, 
  resetSignal,
  onTimeUpdate,
  onManualStart
}: TopRestTimerProps) => {
  const [elapsedTime, setElapsedTime] = React.useState(0);
  const [isTimerActive, setIsTimerActive] = React.useState(false);
  const maxTime = 300; // 5 minutes max
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickRef = useRef<number>(0);

  // This effect handles the reset signal
  useEffect(() => {
    if (resetSignal > 0) {
      console.log("Reset signal received in TopRestTimer:", resetSignal);
      clearTimerInterval();
      setElapsedTime(0);
      setIsTimerActive(true);
      startTimerInterval();
    }
  }, [resetSignal]);
  
  // This effect handles activation state changes
  useEffect(() => {
    console.log("TopRestTimer: isActive changed:", isActive);
    if (isActive) {
      setIsTimerActive(true);
      startTimerInterval();
    } else {
      setIsTimerActive(false);
      clearTimerInterval();
      setElapsedTime(0);
    }

    return () => {
      clearTimerInterval();
    };
  }, [isActive]);

  const clearTimerInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startTimerInterval = () => {
    clearTimerInterval(); // Ensure no duplicate timers
    
    lastTickRef.current = Date.now();
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const deltaSeconds = Math.floor((now - lastTickRef.current) / 1000);
      
      if (deltaSeconds >= 1) {
        lastTickRef.current = now;
        
        setElapsedTime(prev => {
          const newTime = prev + deltaSeconds;
          
          if (newTime >= maxTime) {
            clearTimerInterval();
            setIsTimerActive(false);
            if (onComplete) onComplete();
            return maxTime;
          }
          
          if (onTimeUpdate) onTimeUpdate(newTime);
          return newTime;
        });
      }
    }, 250); // Check more frequently for smoother updates
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimerInterval();
    };
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleManualStart = () => {
    console.log("Manually starting rest timer");
    clearTimerInterval();
    setElapsedTime(0);
    setIsTimerActive(true);
    startTimerInterval();
    if (onManualStart) onManualStart();
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
      
      {!isTimerActive && (
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2 bg-gray-800/50 border-gray-700 hover:bg-gray-700 text-white"
          onClick={handleManualStart}
        >
          <Play size={14} className="mr-1" /> Start
        </Button>
      )}
    </div>
  );
};
