
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
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumExerciseCardProps {
  exercise: Exercise;
  onSelectExercise?: (exercise: Exercise) => void;
  onAdd?: (exercise: Exercise) => void;
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
    'chest': <Target className="w-4 h-4" />,
    'back': <Activity className="w-4 h-4" />,
    'shoulders': <Zap className="w-4 h-4" />,
    'biceps': <Target className="w-4 h-4" />,
    'triceps': <Target className="w-4 h-4" />,
    'legs': <Activity className="w-4 h-4" />,
    'core': <Target className="w-4 h-4" />,
    'glutes': <Activity className="w-4 h-4" />,
    'default': <Target className="w-4 h-4" />
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

export const PremiumExerciseCard: React.FC<PremiumExerciseCardProps> = ({
  exercise,
  onSelectExercise,
  onAdd,
  onFavorite,
  isFavorited = false,
  className
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const primaryMuscles = Array.isArray(exercise.primary_muscle_groups) 
    ? exercise.primary_muscle_groups 
    : [];
  
  const equipment = Array.isArray(exercise.equipment_type) 
    ? exercise.equipment_type 
    : [];

  return (
    <Card
      className={cn(
        "group relative bg-gray-900/90 border-gray-800 hover:border-purple-500/50",
        "transition-all duration-300 ease-out cursor-pointer",
        "hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-1",
        "backdrop-blur-sm overflow-hidden",
        isHovered && "ring-1 ring-purple-500/20",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onSelectExercise?.(exercise)}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardContent className="p-4 relative z-10">
        {/* Header with title and favorite */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white text-lg leading-tight mb-1 truncate">
              {exercise.name}
            </h3>
            <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
              {exercise.description || 'No description available'}
            </p>
          </div>
          
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
              onFavorite?.(exercise);
            }}
          >
            <Heart className={cn("w-4 h-4", isFavorited && "fill-current")} />
          </Button>
        </div>

        {/* Difficulty Progress Bar */}
        <div className="mb-3">
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

        {/* Muscle Groups */}
        <div className="mb-3">
          <div className="flex flex-wrap gap-1.5">
            {primaryMuscles.slice(0, 3).map((muscle, index) => (
              <Badge
                key={index}
                variant="outline"
                className={cn(
                  "text-xs px-2 py-1 border-0 font-medium",
                  getMuscleGroupColor(muscle)
                )}
              >
                <span className="mr-1">{getMuscleGroupIcon(muscle)}</span>
                {muscle}
              </Badge>
            ))}
            {primaryMuscles.length > 3 && (
              <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
                +{primaryMuscles.length - 3}
              </Badge>
            )}
          </div>
        </div>

        {/* Equipment */}
        {equipment.length > 0 && (
          <div className="mb-4">
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

        {/* Action Buttons */}
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
          
          {onAdd && (
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
          
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0 text-gray-400 hover:text-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-800 animate-in fade-in duration-200">
            <div className="space-y-2 text-sm">
              {exercise.movement_pattern && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Pattern:</span>
                  <span className="text-gray-300 capitalize">{exercise.movement_pattern}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Type:</span>
                <span className="text-gray-300">
                  {primaryMuscles.length > 1 ? 'Compound' : 'Isolation'}
                </span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
