
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExerciseCardContext } from '@/contexts/ExerciseCardContext';
import { Exercise } from '@/types/exercise';

interface ExerciseCardActionsProps {
  onSelectExercise?: (exercise: Exercise) => void;
  onAdd?: (exercise: Exercise) => void;
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exercise: Exercise) => void;
  isHovered?: boolean;
}

export const ExerciseCardActions: React.FC<ExerciseCardActionsProps> = ({
  onSelectExercise,
  onAdd,
  onEdit,
  onDelete,
  isHovered = false
}) => {
  const { exercise, variant, context } = useExerciseCardContext();

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
