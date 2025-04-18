
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
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const progressPercentage = Math.min((elapsedTime / maxTime) * 100, 100);

  useEffect(() => {
    if (isVisible) {
      setElapsedTime(0);
      setIsActive(true);
    }
  }, [isVisible]);

  useEffect(() => {
    if (isActive) {
      timerRef.current = setTimeout(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [elapsedTime, isActive]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setElapsedTime(0);
    setIsActive(true);
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
