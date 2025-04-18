
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

  React.useEffect(() => {
    if (isActive) {
      // Reset timer state when it becomes active again
      setElapsedTime(0);
      setIsTimerActive(true);
    }
  }, [isActive]);

  React.useEffect(() => {
    if (isTimerActive && isActive) {
      timerRef.current = setTimeout(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [elapsedTime, isTimerActive, isActive]);

  if (!isActive) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/90 backdrop-blur-sm border border-gray-800 rounded-lg">
      <Timer size={16} className="text-purple-400" />
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
      />
    </div>
  );
};
