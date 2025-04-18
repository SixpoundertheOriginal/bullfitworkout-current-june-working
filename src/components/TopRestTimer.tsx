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

  // Reset timer whenever it becomes active
  React.useEffect(() => {
    if (isActive) {
      setElapsedTime(0);
      setIsTimerActive(true);
    } else {
      // Clear the timer when it becomes inactive
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setElapsedTime(0);
    }
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
