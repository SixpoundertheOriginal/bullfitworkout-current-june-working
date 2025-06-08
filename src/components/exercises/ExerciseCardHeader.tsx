
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExerciseCardContext } from '@/contexts/ExerciseCardContext';

interface ExerciseCardHeaderProps {
  onFavorite?: () => void;
}

export const ExerciseCardHeader: React.FC<ExerciseCardHeaderProps> = ({
  onFavorite
}) => {
  const { exercise, variant, isFavorited } = useExerciseCardContext();

  const getDifficultyBadgeColor = (difficulty?: string) => {
    const colorMap = {
      'beginner': "bg-emerald-900/30 text-emerald-400 border-emerald-500/30",
      'intermediate': "bg-amber-900/30 text-amber-400 border-amber-500/30",
      'advanced': "bg-red-900/30 text-red-400 border-red-500/30",
      'expert': "bg-purple-900/30 text-purple-400 border-purple-500/30"
    };
    return colorMap[difficulty as keyof typeof colorMap] || colorMap.beginner;
  };

  return (
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1 min-w-0">
        <h3 className={cn(
          "font-semibold text-white leading-tight truncate",
          variant === 'premium' ? "text-lg mb-1" : "text-base",
          variant === 'minimal' && "text-sm"
        )}>
          {exercise.name}
        </h3>
        
        {(variant === 'premium' || variant === 'compact') && exercise.description && (
          <p className={cn(
            "text-gray-400 leading-relaxed",
            variant === 'premium' ? "text-sm line-clamp-2" : "text-xs line-clamp-1"
          )}>
            {exercise.description}
          </p>
        )}
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        {variant === 'premium' && onFavorite && (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-8 w-8 p-0 transition-colors duration-200",
              isFavorited 
                ? "text-red-400 hover:text-red-300" 
                : "text-gray-400 hover:text-red-400"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onFavorite();
            }}
          >
            <Heart className={cn("w-4 h-4", isFavorited && "fill-current")} />
          </Button>
        )}

        {exercise.difficulty && variant !== 'minimal' && (
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs font-medium px-2 py-1",
              getDifficultyBadgeColor(exercise.difficulty)
            )}
          >
            {exercise.difficulty}
          </Badge>
        )}
      </div>
    </div>
  );
};
