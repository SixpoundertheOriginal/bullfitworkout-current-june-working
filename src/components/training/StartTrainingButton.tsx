
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dumbbell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StartTrainingButtonProps {
  trainingType?: string;
  variant?: 'default' | 'outline' | 'primary' | 'secondary';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  label?: string;
  forceReset?: boolean;
}

export const StartTrainingButton = ({
  trainingType = 'strength',
  variant = 'default',
  size = 'default',
  className = '',
  label = 'Start Training',
  forceReset = true
}: StartTrainingButtonProps) => {
  const navigate = useNavigate();
  
  const handleStartClick = () => {
    navigate(`/training-session?type=${trainingType}${forceReset ? '&reset=true' : ''}`, {
      state: { trainingType }
    });
  };
  
  return (
    <Button
      variant={variant}
      size={size}
      className={cn("gap-2", className)}
      onClick={handleStartClick}
    >
      <Dumbbell className="h-4 w-4" />
      {label}
    </Button>
  );
};
