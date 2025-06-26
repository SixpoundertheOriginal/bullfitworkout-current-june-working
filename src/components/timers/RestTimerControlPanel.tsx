
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Pause, SkipForward, RotateCcw, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RestTimer } from '@/hooks/useTrainingTimers';

interface RestTimerControlPanelProps {
  restTimer: RestTimer;
  className?: string;
  compact?: boolean;
}

export const RestTimerControlPanel: React.FC<RestTimerControlPanelProps> = ({
  restTimer,
  className,
  compact = false
}) => {
  const [customDuration, setCustomDuration] = useState(restTimer.target);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleQuickAdjust = (adjustment: number) => {
    const newDuration = Math.max(15, restTimer.target + adjustment);
    restTimer.setDuration(newDuration);
    setCustomDuration(newDuration);
  };

  const handleCustomDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      setCustomDuration(value);
    }
  };

  const handleCustomDurationApply = () => {
    restTimer.setDuration(customDuration);
  };

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickAdjust(-15)}
          className="h-8 w-8 p-0 bg-gray-800 border-gray-600 hover:bg-gray-700"
        >
          <Minus className="w-3 h-3" />
        </Button>
        
        <div className="text-center">
          <div className={cn(
            'font-mono text-sm font-bold',
            restTimer.isOvertime ? 'text-red-400' : 'text-white'
          )}>
            {restTimer.isOvertime ? `+${formatTime(restTimer.overtimeSeconds)}` : formatTime(restTimer.remaining)}
          </div>
          <div className="text-xs text-gray-400">
            {restTimer.isOvertime ? 'Overtime' : 'Rest'}
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickAdjust(15)}
          className="h-8 w-8 p-0 bg-gray-800 border-gray-600 hover:bg-gray-700"
        >
          <Plus className="w-3 h-3" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={restTimer.skip}
          className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700"
        >
          <SkipForward className="w-3 h-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4 p-4 bg-gray-900 rounded-xl border border-gray-700', className)}>
      {/* Timer Display */}
      <div className="text-center">
        <div className={cn(
          'text-3xl font-mono font-bold mb-2',
          restTimer.isOvertime ? 'text-red-400 animate-pulse' : 'text-white'
        )}>
          {restTimer.isOvertime ? `+${formatTime(restTimer.overtimeSeconds)}` : formatTime(restTimer.remaining)}
        </div>
        <div className="text-sm text-gray-400">
          Target: {formatTime(restTimer.target)} | {restTimer.isOvertime ? 'Overtime' : 'Rest Time'}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
          <div 
            className={cn(
              'h-full transition-all duration-1000',
              restTimer.isOvertime ? 'bg-red-500' : 'bg-blue-500'
            )}
            style={{ 
              width: restTimer.isOvertime ? '100%' : `${Math.min(restTimer.progress, 100)}%` 
            }}
          />
        </div>
      </div>

      {/* Quick Adjustment Controls */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickAdjust(-30)}
          className="bg-gray-800 border-gray-600 hover:bg-gray-700"
        >
          -30s
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickAdjust(-15)}
          className="bg-gray-800 border-gray-600 hover:bg-gray-700"
        >
          -15s
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickAdjust(15)}
          className="bg-gray-800 border-gray-600 hover:bg-gray-700"
        >
          +15s
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickAdjust(30)}
          className="bg-gray-800 border-gray-600 hover:bg-gray-700"
        >
          +30s
        </Button>
      </div>

      {/* Custom Duration Input */}
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={customDuration}
          onChange={handleCustomDurationChange}
          placeholder="Custom duration (seconds)"
          className="bg-gray-800 border-gray-600 text-white"
        />
        <Button
          variant="outline"
          onClick={handleCustomDurationApply}
          className="bg-gray-800 border-gray-600 hover:bg-gray-700"
        >
          Apply
        </Button>
      </div>

      {/* Main Controls */}
      <div className="flex items-center justify-center gap-3">
        <Button
          variant="outline"
          onClick={restTimer.reset}
          className="bg-gray-800 border-gray-600 hover:bg-gray-700"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
        <Button
          variant="outline"
          onClick={restTimer.skip}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <SkipForward className="w-4 h-4 mr-2" />
          Skip Rest
        </Button>
      </div>
    </div>
  );
};
