
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play } from 'lucide-react';
import { CircularGradientButton } from '@/components/CircularGradientButton';
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
    <CircularGradientButton
      onClick={handleStartClick}
      className={cn("hover:scale-105", className)}
      icon={<Play size={32} className="text-white ml-1" />}
      size={88}
    >
      {label}
    </CircularGradientButton>
  );
};
