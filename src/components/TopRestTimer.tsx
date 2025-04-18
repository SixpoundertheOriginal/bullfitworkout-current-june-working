
import React from 'react';
import { Timer } from 'lucide-react';
import { RestTimerControls } from './RestTimerControls';

interface TopRestTimerProps {
  isActive: boolean;
}

export const TopRestTimer = ({ isActive }: TopRestTimerProps) => {
  const [restTime, setRestTime] = React.useState(90);
  const [isTimerActive, setIsTimerActive] = React.useState(true);
  const timerRef = React.useRef<NodeJS.Timeout>();

  React.useEffect(() => {
    if (isActive) {
      setRestTime(90);
      setIsTimerActive(true);
    }
  }, [isActive]);

  React.useEffect(() => {
    if (isTimerActive && restTime > 0 && isActive) {
      timerRef.current = setTimeout(() => {
        setRestTime(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            if (navigator.vibrate) {
              navigator.vibrate(200);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [restTime, isTimerActive, isActive]);

  if (!isActive) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/90 backdrop-blur-sm border border-gray-800 rounded-lg">
      <Timer size={16} className="text-purple-400" />
      <RestTimerControls
        timeLeft={restTime}
        totalTime={90}
        isActive={isTimerActive}
        onPause={() => setIsTimerActive(false)}
        onResume={() => setIsTimerActive(true)}
        onReset={() => setRestTime(90)}
        onSkip={() => setRestTime(0)}
      />
    </div>
  );
};
