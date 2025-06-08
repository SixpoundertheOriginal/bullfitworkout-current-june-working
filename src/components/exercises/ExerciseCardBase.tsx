
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useExerciseCardContext } from '@/contexts/ExerciseCardContext';

interface ExerciseCardBaseProps {
  children: React.ReactNode;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onClick?: () => void;
}

export const ExerciseCardBase: React.FC<ExerciseCardBaseProps> = ({
  children,
  onMouseEnter,
  onMouseLeave,
  onClick
}) => {
  const { variant, className } = useExerciseCardContext();
  const [isHovered, setIsHovered] = useState(false);

  const getCardStyles = () => {
    switch (variant) {
      case 'premium':
        return "group relative bg-gray-900/90 border-gray-800 hover:border-purple-500/50 transition-all duration-300 ease-out cursor-pointer hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1 backdrop-blur-sm overflow-hidden";
      case 'compact':
        return "bg-gray-800/50 border-gray-700/50 hover:border-gray-700 hover:bg-gray-800/70 transition-all duration-200";
      case 'minimal':
        return "bg-gray-900/30 border-gray-800/30 hover:bg-gray-900/50 transition-all duration-200";
      default:
        return "bg-gray-900/50 border-gray-800";
    }
  };

  const getPadding = () => {
    switch (variant) {
      case 'premium': return 'p-4';
      case 'compact': return 'p-3';
      case 'minimal': return 'p-2';
      default: return 'p-4';
    }
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    onMouseEnter?.();
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    onMouseLeave?.();
  };

  return (
    <Card
      className={cn(getCardStyles(), className)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
    >
      {variant === 'premium' && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
      
      <CardContent className={cn(getPadding(), "relative z-10")}>
        <div className="flex flex-col gap-3 h-full">
          {children}
        </div>
      </CardContent>
    </Card>
  );
};
