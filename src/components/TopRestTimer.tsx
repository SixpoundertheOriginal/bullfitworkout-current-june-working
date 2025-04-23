import React, { useEffect, useRef, useState } from 'react';
import { Timer, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface TopRestTimerProps {
  isActive: boolean;
  onComplete: () => void;
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
  const [elapsedTime, setElapsedTime] = React.useState(0);
  const [isTimerActive, setIsTimerActive] = React.useState(false);
  const [restDuration, setRestDuration] = useState(currentRestTime || defaultRestTime);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickRef = useRef<number>(0);
  const lastResetSignalRef = useRef<number>(0);

  useEffect(() => {
    if (currentRestTime && currentRestTime > 0) {
      console.log(`TopRestTimer: Updated rest time to ${currentRestTime}s`);
      setRestDuration(currentRestTime);
    }
  }, [currentRestTime]);

  useEffect(() => {
    if (resetSignal > 0 && resetSignal !== lastResetSignalRef.current) {
      console.log(`TopRestTimer: Reset signal received: ${resetSignal}, previous: ${lastResetSignalRef.current}`);
      lastResetSignalRef.current = resetSignal;
      clearTimerInterval();
      setElapsedTime(0); // Reset to 0 for count-up timer
      setIsTimerActive(true);
      startTimerInterval();
    }
  }, [resetSignal]);
  
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

  useEffect(() => {
    const handleSetCompletedToast = (mutations: MutationRecord[]) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length) {
          for (const node of mutation.addedNodes) {
            if (node instanceof HTMLElement && node.textContent && 
                node.textContent.includes('logged successfully')) {
              const toastText = node.textContent;
              const exerciseMatch = toastText.match(/^(.+?):/);
              if (exerciseMatch && exerciseMatch[1]) {
                const exerciseName = exerciseMatch[1].trim();
                
                const user = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}')?.currentSession?.user;
                if (user?.id) {
                  const savedSession = localStorage.getItem(`workout_session_${user.id}`);
                  if (savedSession) {
                    const session = JSON.parse(savedSession);
                    if (session.exercises && session.exercises[exerciseName]) {
                      const sets = session.exercises[exerciseName];
                      const completedSets = sets.filter((s: any) => s.completed);
                      if (completedSets.length > 0) {
                        const lastCompletedSet = completedSets[completedSets.length - 1];
                        if (lastCompletedSet && lastCompletedSet.restTime) {
                          console.log(`Found rest time from last completed set: ${lastCompletedSet.restTime}s`);
                          setRestDuration(lastCompletedSet.restTime);
                          return;
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    const observer = new MutationObserver(handleSetCompletedToast);
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => observer.disconnect();
  }, []);

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
          
          if (newTime >= restDuration && prev < restDuration) {
            if (onComplete) onComplete();
          }
          
          if (onTimeUpdate) onTimeUpdate(newTime);
          return newTime;
        });
      }
    }, 250); // Check more frequently for smoother updates
  };

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

  const progressPercentage = Math.min((elapsedTime / restDuration) * 100, 100);
  const showTargetTime = elapsedTime < restDuration;

  return (
    <div className="flex flex-col items-center">
      <Timer 
        size={20} 
        className={cn(
          "text-purple-400 mb-1",
          isTimerActive && "animate-pulse"
        )} 
      />
      <div className="flex flex-col items-center">
        <span className="text-lg font-mono text-white">
          {formatTime(elapsedTime)}
        </span>
        {showTargetTime && (
          <span className="text-xs font-mono text-gray-400">
            Target: {formatTime(restDuration)}
          </span>
        )}
      </div>
      
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
