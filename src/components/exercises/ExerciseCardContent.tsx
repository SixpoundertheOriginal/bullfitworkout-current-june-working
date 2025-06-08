
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Target, Activity, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExerciseCardContext } from '@/contexts/ExerciseCardContext';

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

export const ExerciseCardContent: React.FC = () => {
  const { exercise, variant, primaryMuscles, equipment } = useExerciseCardContext();

  return (
    <>
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
    </>
  );
};
