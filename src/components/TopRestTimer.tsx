
import React from 'react';
import { Timer } from 'lucide-react';
import { RestTimerControls } from './RestTimerControls';

interface TopRestTimerProps {
  isActive: boolean;
  onComplete: () => void;
}

export const TopRestTimer = ({ isActive, onComplete }: TopRestTimerProps) => {
  const [elapsedTime, setElapsedTime] = React.useState(0);
  const [isTimerActive, setIsTimerActive] = React.useState(true);
  const maxTime = 300; // 5 minutes max
  const timerRef = React.useRef<NodeJS.Timeout>();
  
  // Key change: We need to track the previous isActive state to detect changes
  const prevIsActiveRef = React.useRef(isActive);
  
  // Add a timeActivatedAt ref to track when the timer was last activated
  const timeActivatedAtRef = React.useRef<number | null>(null);

  console.log(`TopRestTimer render - isActive: ${isActive}, prevIsActive: ${prevIsActiveRef.current}`);

  // Reset timer whenever it becomes active or when isActive changes from false to true
  React.useEffect(() => {
    console.log(`TopRestTimer effect - isActive changed to: ${isActive}`);
    
    // If timer is becoming active
    if (isActive) {
      // Reset the timer regardless of previous state
      setElapsedTime(0);
      setIsTimerActive(true);
      timeActivatedAtRef.current = Date.now();
      console.log('Timer reset and activated at:', new Date().toISOString());
    } else if (!isActive) {
      // Clear the timer when it becomes inactive
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setElapsedTime(0);
      timeActivatedAtRef.current = null;
      console.log('Timer deactivated');
    }
    
    // Update the previous isActive ref
    prevIsActiveRef.current = isActive;
  }, [isActive]);

  React.useEffect(() => {
    if (isTimerActive && isActive) {
      timerRef.current = setTimeout(() => {
        if (elapsedTime < maxTime) {
          setElapsedTime(prev => prev + 1);
        }
      }, 1000);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [elapsedTime, isTimerActive, isActive, maxTime]);

  if (!isActive) {
    return (
      <div className="flex items-center gap-2">
        <Timer size={20} className="text-purple-400 mb-1" />
        <span className="text-xs text-gray-400 font-medium">Rest</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <Timer size={20} className="text-purple-400 mb-1 animate-pulse" />
      <RestTimerControls
        elapsedTime={elapsedTime}
        maxTime={maxTime}
        isActive={isTimerActive}
        onPause={() => setIsTimerActive(false)}
        onResume={() => setIsTimerActive(true)}
        onReset={() => setElapsedTime(0)}
        onSkip={() => {
          setElapsedTime(0);
          onComplete();
        }}
        compact={true}
      />
      <span className="text-xs text-gray-400 font-medium">Rest</span>
    </div>
  );
};
