
import React from 'react';
import { SmartRestTimerCard } from './SmartRestTimerCard';
import { ManualTimerCard } from './ManualTimerCard';
import { cn } from '@/lib/utils';

interface TimerContainerProps {
  // Smart Rest Timer Props
  smartTimerActive: boolean;
  smartTimerCurrentTime: number;
  smartTimerTargetTime?: number;
  onSmartTimerStart?: () => void;
  onSmartTimerStop?: () => void;
  onSmartTimerSkip?: () => void;
  
  // Manual Timer Props
  manualTimerActive: boolean;
  manualTimerCurrentTime: number;
  onManualTimerStart?: () => void;
  onManualTimerStop?: () => void;
  onManualTimerReset?: () => void;
  
  className?: string;
}

export const TimerContainer: React.FC<TimerContainerProps> = ({
  smartTimerActive,
  smartTimerCurrentTime,
  smartTimerTargetTime,
  onSmartTimerStart,
  onSmartTimerStop,
  onSmartTimerSkip,
  manualTimerActive,
  manualTimerCurrentTime,
  onManualTimerStart,
  onManualTimerStop,
  onManualTimerReset,
  className
}) => {
  return (
    <div className={cn("grid grid-cols-2 gap-4 p-4", className)}>
      {/* Smart Rest Timer */}
      <div className="flex justify-center">
        <SmartRestTimerCard
          isActive={smartTimerActive}
          currentTime={smartTimerCurrentTime}
          targetTime={smartTimerTargetTime}
          onStart={onSmartTimerStart}
          onStop={onSmartTimerStop}
          onSkip={onSmartTimerSkip}
        />
      </div>
      
      {/* Manual Timer */}
      <div className="flex justify-center">
        <ManualTimerCard
          isActive={manualTimerActive}
          currentTime={manualTimerCurrentTime}
          onStart={onManualTimerStart}
          onStop={onManualTimerStop}
          onReset={onManualTimerReset}
        />
      </div>
    </div>
  );
};
