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
}

export const TopRestTimer = ({ 
  isActive, 
  onComplete, 
  resetSignal,
  onTimeUpdate,
  onManualStart,
  defaultRestTime = 60
}: TopRestTimerProps) => {
  const [elapsedTime, setElapsedTime] = React.useState(0);
  const [isTimerActive, setIsTimerActive] = React.useState(false);
  const [currentRestTime, setCurrentRestTime] = useState(defaultRestTime);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickRef = useRef<number>(0);
  const lastResetSignalRef = useRef<number>(0);

  // This effect handles the reset signal
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

  // Update the rest time from localStorage if a set was completed
  useEffect(() => {
    const handleSetCompletedToast = (mutations: MutationRecord[]) => {
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length) {
          for (const node of mutation.addedNodes) {
            if (node instanceof HTMLElement && node.textContent && 
                node.textContent.includes('logged successfully')) {
              // Extract the current exercise name from the toast message
              const toastText = node.textContent;
              const exerciseMatch = toastText.match(/^(.+?):/);
              if (exerciseMatch && exerciseMatch[1]) {
                const exerciseName = exerciseMatch[1].trim();
                
                // Try to find the current active exercise and set in localStorage
                const user = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}')?.currentSession?.user;
                if (user?.id) {
                  const savedSession = localStorage.getItem(`workout_session_${user.id}`);
                  if (savedSession) {
                    const session = JSON.parse(savedSession);
                    if (session.exercises && session.exercises[exerciseName]) {
                      // Find the latest completed set (highest index)
                      const sets = session.exercises[exerciseName];
                      const completedSets = sets.filter((s: any) => s.completed);
                      if (completedSets.length > 0) {
                        const lastCompletedSet = completedSets[completedSets.length - 1];
                        if (lastCompletedSet && lastCompletedSet.restTime) {
                          console.log(`Found rest time from last completed set: ${lastCompletedSet.restTime}s`);
                          setCurrentRestTime(lastCompletedSet.restTime);
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
          
          // Check if we should show "complete" when target time is reached
          // but keep counting up regardless
          if (newTime >= currentRestTime && prev < currentRestTime) {
            // Only trigger complete once when crossing the threshold
            if (onComplete) onComplete();
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

  // Calculate percentage progress for visual indicator
  const progressPercentage = Math.min((elapsedTime / currentRestTime) * 100, 100);
  const showTargetTime = elapsedTime < currentRestTime;

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
            Target: {formatTime(currentRestTime)}
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
