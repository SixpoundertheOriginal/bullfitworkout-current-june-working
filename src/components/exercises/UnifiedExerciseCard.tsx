
import React, { useState } from 'react';
import { Exercise } from '@/types/exercise';
import { ExerciseCardProvider } from '@/contexts/ExerciseCardContext';
import { ExerciseCardBase } from './ExerciseCardBase';
import { ExerciseCardHeader } from './ExerciseCardHeader';
import { ExerciseCardContent } from './ExerciseCardContent';
import { ExerciseCardActions } from './ExerciseCardActions';

export type ExerciseCardVariant = 'premium' | 'compact' | 'minimal';
export type ExerciseCardContext = 'library' | 'selection' | 'workout';

interface UnifiedExerciseCardProps {
  exercise: Exercise;
  variant?: ExerciseCardVariant;
  context?: ExerciseCardContext;
  onSelectExercise?: (exercise: Exercise) => void;
  onAdd?: (exercise: Exercise) => void;
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exercise: Exercise) => void;
  onFavorite?: (exercise: Exercise) => void;
  isFavorited?: boolean;
  className?: string;
}

export const UnifiedExerciseCard: React.FC<UnifiedExerciseCardProps> = ({
  exercise,
  variant = 'premium',
  context = 'library',
  onSelectExercise,
  onAdd,
  onEdit,
  onDelete,
  onFavorite,
  isFavorited = false,
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleFavorite = () => {
    onFavorite?.(exercise);
  };

  const handleCardClick = () => {
    if (context === 'selection' && onAdd) {
      onAdd(exercise);
    } else if (onSelectExercise) {
      onSelectExercise(exercise);
    }
  };

  return (
    <ExerciseCardProvider
      exercise={exercise}
      variant={variant}
      context={context}
      isFavorited={isFavorited}
      className={className}
    >
      <ExerciseCardBase
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleCardClick}
      >
        {/* Header */}
        <ExerciseCardHeader onFavorite={handleFavorite} />
        
        {/* Content */}
        <ExerciseCardContent />
        
        {/* Actions */}
        <div className="mt-auto">
          <ExerciseCardActions
            onSelectExercise={onSelectExercise}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
            isHovered={isHovered}
          />
        </div>
      </ExerciseCardBase>
    </ExerciseCardProvider>
  );
};
