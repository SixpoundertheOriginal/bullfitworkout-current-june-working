
import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { CircularGradientButton } from '@/components/CircularGradientButton';
import { cn } from '@/lib/utils';
import { useWorkoutStore } from '@/store/workoutStore';
import { toast } from '@/hooks/use-toast';

interface TrainingStartButtonProps {
  onStartClick?: () => void;
  className?: string;
  label?: string;
  size?: number;
  forceReset?: boolean;
  trainingType?: string;
}

/**
 * A reusable button component for starting workout sessions
 * Uses React.memo with custom equality check for performance
 */
export const TrainingStartButton = React.memo<TrainingStartButtonProps>(({
  onStartClick,
  className = '',
  label = 'Start Training',
  size = 120,
  forceReset = false,
  trainingType = 'strength'
}) => {
  const navigate = useNavigate();
  const { isActive, startWorkout, updateLastActiveRoute } = useWorkoutStore();
  
  const handleStartClick = useCallback(() => {
    // If there's a custom handler, use it and return early
    if (onStartClick) {
      onStartClick();
      return;
    }
    
    // If force reset is true, navigate with reset parameter
    if (forceReset) {
      navigate(`/training-session?type=${trainingType}&reset=true`, {
        state: { trainingType }
      });
      return;
    }
    
    // Start workout through store and navigate
    startWorkout();
    updateLastActiveRoute('/training-session');
    
    // Navigate to training session
    navigate(`/training-session${trainingType ? `?type=${trainingType}` : ''}`, {
      state: { trainingType }
    });
    
    toast({
      title: "Workout started! Add exercises to begin"
    });
  }, [onStartClick, startWorkout, updateLastActiveRoute, navigate, forceReset, trainingType]);
  
  // Don't render button if workout is already active
  if (isActive) {
    return null;
  }
  
  return (
    <CircularGradientButton
      onClick={handleStartClick}
      className={cn("hover:scale-105 transition-transform", className)}
      icon={<Play size={40} className="text-white ml-1" />}
      size={size}
    >
      {label}
    </CircularGradientButton>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.label === nextProps.label &&
    prevProps.size === nextProps.size &&
    prevProps.className === nextProps.className &&
    prevProps.onStartClick === nextProps.onStartClick &&
    prevProps.forceReset === nextProps.forceReset &&
    prevProps.trainingType === nextProps.trainingType
  );
});

// Adding display name for debugging
TrainingStartButton.displayName = 'TrainingStartButton';
