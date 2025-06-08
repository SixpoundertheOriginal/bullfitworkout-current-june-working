
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, MoreVertical, Eye } from 'lucide-react';
import { Exercise } from '@/types/exercise';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type ExerciseCardVariant = 'workout-add' | 'library-manage';

interface CommonExerciseCardProps {
  exercise: Exercise;
  variant: ExerciseCardVariant;
  onAdd?: (exercise: Exercise) => void;
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exercise: Exercise) => void;
  onViewDetails?: (exercise: Exercise) => void;
  onDuplicate?: (exercise: Exercise) => void;
}

export const CommonExerciseCard: React.FC<CommonExerciseCardProps> = ({
  exercise,
  variant,
  onAdd,
  onEdit,
  onDelete,
  onViewDetails,
  onDuplicate
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner': return 'bg-emerald-900/30 text-emerald-400 border-emerald-500/30';
      case 'intermediate': return 'bg-amber-900/30 text-amber-400 border-amber-500/30';
      case 'advanced': return 'bg-red-900/30 text-red-400 border-red-500/30';
      case 'expert': return 'bg-purple-900/30 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  return (
    <Card className="group bg-gray-900/50 border-gray-800/50 transition-all duration-200 hover:border-gray-700 hover:bg-gray-900/70 hover:shadow-lg hover:shadow-purple-500/10 h-full">
      <CardContent className="p-4 h-full flex flex-col">
        <div className="flex flex-col gap-3 flex-1">
          {/* Header */}
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-lg text-white leading-tight line-clamp-2 group-hover:text-purple-100 transition-colors">
              {exercise.name}
            </h3>
            {exercise.difficulty && (
              <Badge 
                variant="outline" 
                className={`text-xs font-medium px-2 py-1 ${getDifficultyColor(exercise.difficulty)} flex-shrink-0`}
              >
                {exercise.difficulty}
              </Badge>
            )}
          </div>
          
          {/* Description */}
          {exercise.description && (
            <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
              {exercise.description}
            </p>
          )}
          
          {/* Primary Muscle Groups */}
          {exercise.primary_muscle_groups && exercise.primary_muscle_groups.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {exercise.primary_muscle_groups.slice(0, 3).map((muscle) => (
                <Badge 
                  key={muscle} 
                  variant="secondary" 
                  className="text-xs bg-purple-900/20 text-purple-300 border-purple-500/20 px-2 py-0.5"
                >
                  {muscle}
                </Badge>
              ))}
              {exercise.primary_muscle_groups.length > 3 && (
                <Badge variant="secondary" className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5">
                  +{exercise.primary_muscle_groups.length - 3}
                </Badge>
              )}
            </div>
          )}
          
          {/* Equipment */}
          {exercise.equipment_type && exercise.equipment_type.length > 0 && (
            <div className="text-xs text-gray-500">
              <span className="font-medium">Equipment:</span> {exercise.equipment_type.slice(0, 2).join(', ')}
              {exercise.equipment_type.length > 2 && ` +${exercise.equipment_type.length - 2}`}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-end mt-auto pt-2">
            {variant === 'workout-add' && (
              <Button
                onClick={() => onAdd?.(exercise)}
                size="sm"
                variant="outline"
                className="h-9 px-4 rounded-full bg-purple-900/30 border-purple-500/30 hover:bg-purple-800/50 hover:border-purple-400/50 text-purple-300 hover:text-purple-200 transition-all duration-200"
              >
                <Plus size={16} className="mr-1" />
                Add
              </Button>
            )}
            
            {variant === 'library-manage' && (
              <div className="flex gap-2">
                <Button
                  onClick={() => onViewDetails?.(exercise)}
                  size="sm"
                  variant="outline"
                  className="h-9 px-3 rounded-full border-gray-700 hover:bg-gray-800 hover:border-gray-600 text-gray-300 hover:text-white transition-all duration-200"
                >
                  <Eye size={15} />
                </Button>
                
                <Button
                  onClick={() => onEdit?.(exercise)}
                  size="sm"
                  variant="outline"
                  className="h-9 px-3 rounded-full border-gray-700 hover:bg-gray-800 hover:border-gray-600 text-gray-300 hover:text-white transition-all duration-200"
                >
                  <Pencil size={15} />
                </Button>
                
                <Button
                  onClick={() => onDelete?.(exercise)}
                  size="sm"
                  variant="outline"
                  className="h-9 px-3 rounded-full border-red-900/30 hover:bg-red-900/30 hover:border-red-500/50 text-red-400 hover:text-red-300 transition-all duration-200"
                >
                  <Trash2 size={15} />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 px-2 rounded-full border-gray-700 hover:bg-gray-800 hover:border-gray-600 text-gray-300 hover:text-white transition-all duration-200"
                    >
                      <MoreVertical size={15} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="bg-gray-900 border-gray-800 shadow-xl"
                  >
                    <DropdownMenuItem 
                      onClick={() => onViewDetails?.(exercise)}
                      className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800 text-gray-300 hover:text-white"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDuplicate?.(exercise)}
                      className="cursor-pointer hover:bg-gray-800 focus:bg-gray-800 text-gray-300 hover:text-white"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
