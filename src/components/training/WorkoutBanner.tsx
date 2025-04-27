
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Timer, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkoutState } from '@/hooks/useWorkoutState';
import { cn } from '@/lib/utils';

export function WorkoutBanner() {
  const navigate = useNavigate();
  const { exercises, elapsedTime, trainingConfig } = useWorkoutState();
  
  const isWorkoutActive = Object.keys(exercises).length > 0 && elapsedTime > 0;
  
  if (!isWorkoutActive) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn(
      "fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-purple-600/90 to-pink-500/90",
      "backdrop-blur-sm border-b border-white/10 animate-fade-in"
    )}>
      <div className="max-w-screen-xl mx-auto px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Timer className="h-4 w-4 text-white" />
          <span className="text-sm font-medium text-white">
            {formatTime(elapsedTime)}
          </span>
          <span className="text-sm text-white/80">
            {trainingConfig?.trainingType || "Workout"}
          </span>
        </div>
        
        <Button
          size="sm"
          variant="ghost"
          className="text-white hover:text-white hover:bg-white/20"
          onClick={() => navigate('/training-session')}
        >
          <Play className="h-4 w-4 mr-2" />
          Return to Workout
        </Button>
      </div>
    </div>
  );
}
