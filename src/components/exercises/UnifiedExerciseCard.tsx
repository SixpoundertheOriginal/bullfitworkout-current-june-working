
import React, { useState } from 'react';
import { Exercise } from '@/types/exercise';
import { ExerciseCardProvider } from '@/contexts/ExerciseCardContext';
import { ExerciseCardBase } from './ExerciseCardBase';
import { ExerciseCardHeader } from './ExerciseCardHeader';
import { ExerciseCardContent } from './ExerciseCardContent';
import { ExerciseCardActions } from './ExerciseCardActions';
import { PersonalStatsDisplay } from './PersonalStatsDisplay';
import { usePersonalStats } from '@/hooks/usePersonalStats';

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
  showPersonalStats?: boolean;
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
  showPersonalStats = true,
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Fetch personal stats for this exercise
  const { data: personalStats, isLoading: isLoadingStats } = usePersonalStats({
    exerciseId: exercise.name,
    enabled: showPersonalStats && context === 'library'
  });

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
        
        {/* Personal Stats Section */}
        {showPersonalStats && context === 'library' && (
          <div className="mt-3 pt-3 border-t border-gray-700/50">
            {isLoadingStats ? (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-3 h-3 border border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                Loading stats...
              </div>
            ) : personalStats ? (
              <PersonalStatsDisplay 
                stats={personalStats} 
                variant={variant === 'minimal' ? 'compact' : 'compact'}
              />
            ) : (
              <div className="text-xs text-gray-500">
                Start training to see your stats
              </div>
            )}
          </div>
        )}
        
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
