
import React from 'react';
import { UnifiedTimerDisplay } from '@/components/timers/UnifiedTimerDisplay';
import { useWorkoutTimer } from '@/hooks/useWorkoutStoreSelectors';
import { useTrainingTimers } from '@/hooks/useTrainingTimers';

export const OptimizedTimerHeader = React.memo(() => {
  const { elapsedTime, restTimerActive, currentRestTime, restTimerResetSignal, restTimerTargetDuration } = useWorkoutTimer();
  const { workoutTimer, restTimer } = useTrainingTimers();

  return (
    <UnifiedTimerDisplay 
      workoutTimer={workoutTimer}
      restTimer={restTimer}
    />
  );
});

OptimizedTimerHeader.displayName = 'OptimizedTimerHeader';
