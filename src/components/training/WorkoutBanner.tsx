
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Timer, Dumbbell } from 'lucide-react';
import { useWorkoutState } from '@/hooks/useWorkoutState';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const WorkoutBanner = () => {
  const navigate = useNavigate();
  const { 
    isActive, 
    elapsedTime, 
    exercises, 
    workoutStatus, 
    lastActiveRoute 
  } = useWorkoutState();

  // Don't show the banner if:
  // 1. No active workout
  // 2. We're already on the training session page
  // 3. The workout has been saved
  if (!isActive || 
      window.location.pathname === '/training-session' || 
      workoutStatus === 'saved') {
    return null;
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const exerciseCount = Object.keys(exercises).length;
  const [completedSets, totalSets] = Object.entries(exercises).reduce(
    ([completed, total], [exerciseName, sets]) => [
      completed + sets.filter(set => set.completed).length,
      total + sets.length
    ],
    [0, 0]
  );

  const handleResumeWorkout = () => {
    navigate(lastActiveRoute || '/training-session');
  };

  return (
    <div className="fixed bottom-16 inset-x-0 z-40 px-4 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="bg-gradient-to-br from-blue-900/90 to-purple-900/90 backdrop-blur-md rounded-lg border border-purple-700/50 shadow-lg p-3 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-800/50 p-2 rounded-full">
              <Dumbbell size={20} className="text-purple-300" />
            </div>
            <div>
              <div className="text-white font-medium text-sm">Workout in progress</div>
              <div className="flex items-center space-x-2 text-xs text-gray-300">
                <Timer size={14} />
                <span>{formatTime(elapsedTime)}</span>
                <span>•</span>
                <span>{exerciseCount} exercises</span>
                <span>•</span>
                <span>{completedSets}/{totalSets} sets</span>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={handleResumeWorkout}
            size="sm"
            className={cn(
              "ml-2 bg-purple-600 hover:bg-purple-500 text-white",
              "flex items-center gap-1 py-1.5 px-3"
            )}
          >
            <Play size={14} />
            Resume
          </Button>
        </div>
      </div>
    </div>
  );
};
