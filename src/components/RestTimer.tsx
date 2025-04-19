
import React, { useState, useEffect, useRef } from "react";
import { Timer, X, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface RestTimerProps {
  onComplete?: () => void;
  maxTime?: number;
  isVisible: boolean;
  onClose: () => void;
}

export const RestTimer = ({ 
  onComplete, 
  maxTime = 300,
  isVisible, 
  onClose 
}: RestTimerProps) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickRef = useRef<number>(0);
  
  const progressPercentage = Math.min((elapsedTime / maxTime) * 100, 100);

  useEffect(() => {
    if (isVisible) {
      setElapsedTime(0);
      setIsActive(true);
      startTimerInterval();
    } else {
      clearTimerInterval();
    }
    
    return () => {
      clearTimerInterval();
    };
  }, [isVisible, maxTime]);

  useEffect(() => {
    if (isActive) {
      startTimerInterval();
    } else {
      clearTimerInterval();
    }
    
    return () => {
      clearTimerInterval();
    };
  }, [isActive, maxTime]);

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
            setIsActive(false);
            if (onComplete) onComplete();
            return maxTime;
          }
          
          return newTime;
        });
      }
    }, 250); // Check more frequently for smoother updates
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setElapsedTime(0);
    setIsActive(true);
    
    if (isActive) {
      clearTimerInterval();
      startTimerInterval();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      "bg-gray-900 border border-gray-800 rounded-lg shadow-xl",
      "transition-all duration-300 ease-in-out",
      "animate-fade-in"
    )}>
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Timer size={18} className="text-purple-400" />
          <span className="font-medium">Rest Timer</span>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800"
        >
          <X size={16} />
        </button>
      </div>
      
      <div className="p-4">
        <div className="text-center mb-3">
          <span className="text-3xl font-mono">{formatTime(elapsedTime)}</span>
        </div>
        
        <Progress 
          value={progressPercentage} 
          className="h-2 mb-4 bg-gray-800 [&>div]:bg-purple-500"
        />
        
        <div className="flex justify-between gap-2">
          <Button 
            variant="outline" 
            className="flex-1 bg-gray-800 border-gray-700 hover:bg-gray-700"
            onClick={resetTimer}
          >
            Reset
          </Button>
          <Button 
            variant="outline" 
            className="flex-1 bg-gray-800 border-gray-700 hover:bg-gray-700"
            onClick={toggleTimer}
          >
            {isActive ? <Pause size={16} /> : <Play size={16} />}
            {isActive ? 'Pause' : 'Resume'}
          </Button>
        </div>
      </div>
    </div>
  );
};
