
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StartTrainingButtonProps {
  trainingType?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link' | 'gradient' | 'icon-circle' | 'nav-action';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  label?: string;
  forceReset?: boolean;
  onClick?: () => void;
  workoutType?: string;
  duration?: number;
}

export const StartTrainingButton = ({
  trainingType = 'strength',
  variant = 'default',
  size = 'default',
  className = '',
  label = 'Start Training',
  forceReset = true,
  onClick
}: StartTrainingButtonProps) => {
  const navigate = useNavigate();
  
  const handleStartClick = () => {
    if (onClick) {
      onClick();
      return;
    }
    
    navigate(`/training-session?type=${trainingType}${forceReset ? '&reset=true' : ''}`, {
      state: { trainingType }
    });
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      className={cn(
        "gap-2 transition-all duration-300 ease-in-out",
        className
      )}
      onClick={handleStartClick}
    >
      <Dumbbell className="h-4 w-4" />
      {label}
    </Button>
  );
};
