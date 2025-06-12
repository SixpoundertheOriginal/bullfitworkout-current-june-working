
import React from 'react';
import { Clock, Timer, SkipForward, Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { WorkoutTimer, RestTimer } from '@/hooks/useTrainingTimers';

interface UnifiedTimerDisplayProps {
  workoutTimer: WorkoutTimer;
  restTimer: RestTimer;
  className?: string;
}

export const UnifiedTimerDisplay: React.FC<UnifiedTimerDisplayProps> = ({
  workoutTimer,
  restTimer,
  className
}) => {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRestColor = (): string => {
    if (!restTimer.isActive) return 'bg-gray-600';
    
    const progressPercent = restTimer.progress;
    if (progressPercent > 80) return 'bg-red-500'; // Final 20%
    if (progressPercent > 60) return 'bg-yellow-500'; // Middle portion
    return 'bg-green-500'; // Early portion
  };

  const getTimerStatusText = (): string => {
    if (restTimer.isActive) {
      return `Rest: ${formatTime(restTimer.remaining)}`;
    }
    if (workoutTimer.isRunning) {
      return 'Workout Active';
    }
    return 'Workout Paused';
  };

  // Duration options for rest timer (in seconds)
  const durationOptions = [
    { label: '1:00', value: 60 },
    { label: '1:30', value: 90 },
    { label: '2:00', value: 120 },
    { label: '2:30', value: 150 },
    { label: '3:00', value: 180 },
    { label: '4:00', value: 240 },
    { label: '5:00', value: 300 },
  ];

  return (
    <div className={cn(
      "relative rounded-2xl bg-gray-900/40 backdrop-blur-md border border-white/5 p-4",
      className
    )}>
      {/* Main Timer Display */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Clock className="h-6 w-6 text-purple-400" />
            {workoutTimer.isRunning && (
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>
          <div>
            <div className="text-2xl font-mono font-bold text-white">
              {formatTime(workoutTimer.elapsed)}
            </div>
            <div className="text-xs text-gray-400">
              {getTimerStatusText()}
            </div>
          </div>
        </div>

        {/* Workout Timer Controls */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={workoutTimer.isRunning ? workoutTimer.pause : workoutTimer.resume}
            className="text-gray-400 hover:text-white"
          >
            {workoutTimer.isRunning ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Rest Timer Overlay */}
      {restTimer.isActive && (
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-orange-400 animate-pulse" />
              <span className="text-xl font-mono text-orange-400 font-bold">
                {formatTime(restTimer.remaining)}
              </span>
              <span className="text-sm text-gray-400">rest</span>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Duration Selector */}
              <Select value={restTimer.target.toString()} onValueChange={(value) => restTimer.setDuration(parseInt(value))}>
                <SelectTrigger className="w-16 h-8 text-xs bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map(option => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={restTimer.skip}
                className="text-orange-400 hover:text-orange-300 text-xs h-8 px-2"
              >
                <SkipForward className="h-3 w-3 mr-1" />
                Skip
              </Button>
            </div>
          </div>

          {/* Enhanced Rest Progress Bar */}
          <div className="relative">
            <Progress 
              value={restTimer.progress} 
              className="h-3 bg-gray-800"
              indicatorClassName={cn(getRestColor(), "transition-all duration-500")}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0:00</span>
              <span className="text-orange-400 font-medium">
                {Math.round(restTimer.progress)}%
              </span>
              <span>{formatTime(restTimer.target)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Rest Timer Status When Not Active */}
      {!restTimer.isActive && workoutTimer.elapsed > 0 && (
        <div className="border-t border-white/10 pt-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-500">
              <Timer className="h-4 w-4 mr-2" />
              Rest timer will auto-start after completing a set
            </div>
            
            {/* Manual Start Option */}
            <div className="flex items-center gap-2">
              <Select value={restTimer.target.toString()} onValueChange={(value) => restTimer.setDuration(parseInt(value))}>
                <SelectTrigger className="w-16 h-7 text-xs bg-gray-800 border-gray-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {durationOptions.map(option => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => restTimer.start()}
                className="text-gray-400 hover:text-white text-xs h-7 px-2"
              >
                <Play className="h-3 w-3 mr-1" />
                Start
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
