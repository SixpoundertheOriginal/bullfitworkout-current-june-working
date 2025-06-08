
import React, { useState } from 'react';
import { Exercise } from '@/types/exercise';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Heart, 
  Plus, 
  Eye, 
  MoreHorizontal,
  Target,
  Zap,
  Activity,
  Pencil,
  Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

const getDifficultyColor = (difficulty?: string) => {
  switch (difficulty?.toLowerCase()) {
    case 'beginner': return 'bg-green-500';
    case 'intermediate': return 'bg-yellow-500';
    case 'advanced': return 'bg-orange-500';
    case 'expert': return 'bg-red-500';
    default: return 'bg-gray-500';
  }
};

const getDifficultyWidth = (difficulty?: string) => {
  switch (difficulty?.toLowerCase()) {
    case 'beginner': return 'w-1/4';
    case 'intermediate': return 'w-2/4';
    case 'advanced': return 'w-3/4';
    case 'expert': return 'w-full';
    default: return 'w-1/4';
  }
};

const getMuscleGroupIcon = (muscleGroup: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    'chest': <Target className="w-3 h-3" />,
    'back': <Activity className="w-3 h-3" />,
    'shoulders': <Zap className="w-3 h-3" />,
    'biceps': <Target className="w-3 h-3" />,
    'triceps': <Target className="w-3 h-3" />,
    'legs': <Activity className="w-3 h-3" />,
    'core': <Target className="w-3 h-3" />,
    'glutes': <Activity className="w-3 h-3" />,
    'default': <Target className="w-3 h-3" />
  };
  
  return iconMap[muscleGroup.toLowerCase()] || iconMap.default;
};

const getMuscleGroupColor = (muscleGroup: string) => {
  const colorMap: Record<string, string> = {
    'chest': 'text-red-400 bg-red-400/10',
    'back': 'text-blue-400 bg-blue-400/10',
    'shoulders': 'text-yellow-400 bg-yellow-400/10',
    'biceps': 'text-purple-400 bg-purple-400/10',
    'triceps': 'text-pink-400 bg-pink-400/10',
    'legs': 'text-green-400 bg-green-400/10',
    'core': 'text-orange-400 bg-orange-400/10',
    'glutes': 'text-cyan-400 bg-cyan-400/10'
  };
  
  return colorMap[muscleGroup.toLowerCase()] || 'text-gray-400 bg-gray-400/10';
};

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
  
  const primaryMuscles = Array.isArray(exercise.primary_muscle_groups) 
    ? exercise.primary_muscle_groups 
    : [];
  
  const equipment = Array.isArray(exercise.equipment_type) 
    ? exercise.equipment_type 
    : [];

  // Variant-specific styling
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

  const renderActions = () => {
    if (variant === 'minimal') {
      return (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            if (context === 'selection' && onAdd) {
              onAdd(exercise);
            } else if (onSelectExercise) {
              onSelectExercise(exercise);
            }
          }}
          size="sm"
          variant="outline"
          className="h-8 px-3 rounded-full bg-purple-900/30 border-purple-500/30 hover:bg-purple-800/50"
        >
          <Plus size={14} className="mr-1" />
          Add
        </Button>
      );
    }

    if (variant === 'compact') {
      return (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-purple-600/20 border-purple-500/30 text-purple-300 hover:bg-purple-600/30"
            onClick={(e) => {
              e.stopPropagation();
              if (context === 'selection' && onAdd) {
                onAdd(exercise);
              } else if (onSelectExercise) {
                onSelectExercise(exercise);
              }
            }}
          >
            <Plus className="w-3 h-3 mr-1" />
            {context === 'selection' ? 'Add' : 'View'}
          </Button>
        </div>
      );
    }

    // Premium variant actions
    return (
      <div className={cn(
        "flex gap-2 transition-all duration-300",
        isHovered ? "opacity-100 translate-y-0" : "opacity-70 translate-y-1"
      )}>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 bg-purple-600/20 border-purple-500/30 text-purple-300 hover:bg-purple-600/30 hover:text-purple-200"
          onClick={(e) => {
            e.stopPropagation();
            onSelectExercise?.(exercise);
          }}
        >
          <Eye className="w-3 h-3 mr-1.5" />
          View
        </Button>
        
        {context === 'selection' && onAdd && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-green-600/20 border-green-500/30 text-green-300 hover:bg-green-600/30 hover:text-green-200"
            onClick={(e) => {
              e.stopPropagation();
              onAdd(exercise);
            }}
          >
            <Plus className="w-3 h-3 mr-1.5" />
            Add
          </Button>
        )}

        {context === 'library' && (
          <>
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 text-gray-400 hover:text-gray-300"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(exercise);
                }}
              >
                <Pencil className="w-3 h-3" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 text-red-400 hover:text-red-300"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(exercise);
                }}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0 text-gray-400 hover:text-gray-300"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    );
  };

  return (
    <Card
      className={cn(getCardStyles(), className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelectExercise?.(exercise)}
    >
      {variant === 'premium' && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
      
      <CardContent className={cn(getPadding(), "relative z-10")}>
        <div className="flex flex-col gap-3 h-full">
          {/* Header */}
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
            
            {variant === 'premium' && onFavorite && (
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 ml-2 flex-shrink-0 transition-colors duration-200",
                  isFavorited 
                    ? "text-red-400 hover:text-red-300" 
                    : "text-gray-400 hover:text-red-400"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onFavorite(exercise);
                }}
              >
                <Heart className={cn("w-4 h-4", isFavorited && "fill-current")} />
              </Button>
            )}

            {exercise.difficulty && variant !== 'minimal' && (
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs font-medium px-2 py-1 flex-shrink-0",
                  exercise.difficulty === 'beginner' && "bg-emerald-900/30 text-emerald-400 border-emerald-500/30",
                  exercise.difficulty === 'intermediate' && "bg-amber-900/30 text-amber-400 border-amber-500/30",
                  exercise.difficulty === 'advanced' && "bg-red-900/30 text-red-400 border-red-500/30",
                  exercise.difficulty === 'expert' && "bg-purple-900/30 text-purple-400 border-purple-500/30"
                )}
              >
                {exercise.difficulty}
              </Badge>
            )}
          </div>

          {/* Difficulty Progress Bar - Premium only */}
          {variant === 'premium' && (
            <div className="mb-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400 font-medium">Difficulty</span>
                <span className="text-xs text-gray-300 capitalize">
                  {exercise.difficulty || 'beginner'}
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    getDifficultyColor(exercise.difficulty),
                    getDifficultyWidth(exercise.difficulty)
                  )}
                />
              </div>
            </div>
          )}

          {/* Muscle Groups */}
          <div className="mb-2">
            <div className="flex flex-wrap gap-1">
              {primaryMuscles.slice(0, variant === 'minimal' ? 2 : 3).map((muscle, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className={cn(
                    "text-xs font-medium border-0",
                    variant === 'minimal' ? "px-1 py-0.5" : "px-2 py-1",
                    getMuscleGroupColor(muscle)
                  )}
                >
                  {variant !== 'minimal' && (
                    <span className="mr-1">{getMuscleGroupIcon(muscle)}</span>
                  )}
                  {muscle}
                </Badge>
              ))}
              {primaryMuscles.length > (variant === 'minimal' ? 2 : 3) && (
                <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                  +{primaryMuscles.length - (variant === 'minimal' ? 2 : 3)}
                </Badge>
              )}
            </div>
          </div>

          {/* Equipment - Not shown in minimal variant */}
          {variant !== 'minimal' && equipment.length > 0 && (
            <div className="mb-2">
              <div className="flex flex-wrap gap-1">
                {equipment.slice(0, 2).map((item, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs bg-gray-800 text-gray-300 border-gray-700"
                  >
                    {item}
                  </Badge>
                ))}
                {equipment.length > 2 && (
                  <Badge variant="secondary" className="text-xs bg-gray-800 text-gray-300">
                    +{equipment.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-auto">
            {renderActions()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
