
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWorkoutStore } from '@/store/workoutStore';
import { cn } from '@/lib/utils';
import { Dumbbell, PlayCircle, Clock } from 'lucide-react';
import { formatTime } from '@/utils/formatTime';
import { usePageVisibility } from '@/hooks/usePageVisibility';
import { toast } from "@/hooks/use-toast";
import { useDebounce } from '@/hooks/useDebounce';

export const WorkoutBanner: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isVisible } = usePageVisibility();
  const { 
    isActive, 
    exercises, 
    elapsedTime, 
    workoutStatus,
    explicitlyEnded
  } = useWorkoutStore();
  const [visible, setVisible] = useState(false);
  
  // Memoize expensive calculations to prevent re-renders
  const exerciseCount = useMemo(() => Object.keys(exercises).length, [exercises]);
  const currentPath = useMemo(() => location.pathname, [location.pathname]);
  const isTrainingRoute = useMemo(() => currentPath === '/training-session', [currentPath]);
  
  // Debounce visibility state to prevent excessive updates
  const debouncedIsActive = useDebounce(isActive, 100);
  const debouncedWorkoutStatus = useDebounce(workoutStatus, 100);
  
  // Memoize the visibility calculation - SIMPLIFIED: Remove 'saved' check
  const shouldShow = useMemo(() => {
    return debouncedIsActive && 
           !explicitlyEnded && 
           !isTrainingRoute && 
           exerciseCount > 0;
  }, [debouncedIsActive, explicitlyEnded, isTrainingRoute, exerciseCount]);
  
  // Update banner visibility with debounced values
  useEffect(() => {
    setVisible(shouldShow);
  }, [shouldShow]);
  
  // Memoized navigation handler
  const handleResumeWorkout = useCallback(() => {
    navigate('/training-session');
    
    if (exerciseCount > 0) {
      toast({
        title: "Resuming your workout",
      });
    }
  }, [navigate, exerciseCount]);
  
  if (!visible) return null;
  
  return (
    <div className={cn(
      "fixed bottom-16 inset-x-0 z-50 px-4 py-2",
      "transform transition-all duration-300 ease-in-out",
      visible ? "translate-y-0" : "translate-y-full"
    )}>
      <div 
        onClick={handleResumeWorkout}
        className="bg-gradient-to-r from-purple-900/90 to-blue-900/90 rounded-lg p-3 shadow-lg 
                   border border-blue-800/50 flex items-center justify-between cursor-pointer
                   hover:from-purple-800/90 hover:to-blue-800/90 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="bg-blue-800/60 p-2 rounded-full">
            <Dumbbell className="h-5 w-5 text-blue-200" />
          </div>
          <div>
            <h4 className="font-medium text-white">
              Active Workout
            </h4>
            <p className="text-xs text-blue-200">
              {exerciseCount} {exerciseCount === 1 ? 'exercise' : 'exercises'} in progress
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-blue-200 text-sm">
            <Clock className="h-3.5 w-3.5 mr-1" />
            {formatTime(elapsedTime)}
          </div>
          <PlayCircle className="h-6 w-6 text-blue-200" />
        </div>
      </div>
    </div>
  );
});

WorkoutBanner.displayName = 'WorkoutBanner';
