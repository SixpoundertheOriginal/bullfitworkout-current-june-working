
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Timer, Dumbbell } from 'lucide-react';
import { useWorkoutState } from '@/hooks/useWorkoutState';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePageVisibility } from '@/hooks/usePageVisibility';

export const WorkoutBanner = () => {
  const navigate = useNavigate();
  const { 
    isActive, 
    elapsedTime, 
    exercises, 
    workoutStatus, 
    lastActiveRoute,
    explicitlyEnded,
    persistWorkoutState
  } = useWorkoutState();
  
  // Add page visibility detection
  const { isVisible } = usePageVisibility();
  
  // Local visibility state to prevent banner from flickering
  const [visible, setVisible] = useState<boolean>(false);
  
  // When the tab becomes visible again, check for workout state
  useEffect(() => {
    if (isVisible) {
      console.log('Tab visible in WorkoutBanner, checking workout state');
      persistWorkoutState?.();
    }
  }, [isVisible, persistWorkoutState]);
  
  // Determine visibility with debounce
  useEffect(() => {
    // Logic for when to show the banner
    const shouldBeVisible = 
      isActive && 
      !explicitlyEnded &&
      window.location.pathname !== '/training-session' && 
      workoutStatus !== 'saved' &&
      Object.keys(exercises).length > 0;
    
    // If it should become visible, show immediately
    if (shouldBeVisible && !visible) {
      setVisible(true);
    } 
    // If it should hide, add small delay to prevent flickering
    else if (!shouldBeVisible && visible) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isActive, window.location.pathname, workoutStatus, exercises, visible, explicitlyEnded]);
  
  // Debug logging
  useEffect(() => {
    console.log('WorkoutBanner evaluated:', { 
      isActive, 
      workoutStatus,
      currentPath: window.location.pathname,
      exerciseCount: Object.keys(exercises).length,
      elapsedTime,
      explicitlyEnded,
      visible
    });
  }, [isActive, workoutStatus, exercises, elapsedTime, explicitlyEnded, visible]);

  // Don't render anything if not visible
  if (!visible) {
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
