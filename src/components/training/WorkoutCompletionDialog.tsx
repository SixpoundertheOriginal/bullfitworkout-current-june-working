
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ActionButton } from '@/components/ui/ActionButton';
import { CheckCircle, Save, Trash2, Play } from 'lucide-react';

interface WorkoutCompletionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exerciseCount: number;
  completedSetsCount: number;
  onSaveWorkout: () => void;
  onSaveAsDraft: () => void;
  onDiscardWorkout: () => void;
  onContinueWorkout: () => void;
  isSaving: boolean;
}

export const WorkoutCompletionDialog: React.FC<WorkoutCompletionDialogProps> = ({
  open,
  onOpenChange,
  exerciseCount,
  completedSetsCount,
  onSaveWorkout,
  onSaveAsDraft,
  onDiscardWorkout,
  onContinueWorkout,
  isSaving
}) => {
  // Determine workout state for contextual options
  const hasExercises = exerciseCount > 0;
  const hasCompletedSets = completedSetsCount > 0;

  const getDialogContent = () => {
    if (!hasExercises) {
      return {
        title: "End Empty Workout?",
        description: "You haven't added any exercises to this workout session.",
        primaryAction: {
          label: "Discard Empty Workout",
          action: onDiscardWorkout,
          icon: Trash2,
          variant: "destructive" as const
        },
        secondaryAction: {
          label: "Continue Working Out",
          action: onContinueWorkout,
          icon: Play,
          variant: "secondary" as const
        }
      };
    }

    if (hasExercises && !hasCompletedSets) {
      return {
        title: "Save Incomplete Workout?",
        description: `You've added ${exerciseCount} exercise${exerciseCount > 1 ? 's' : ''} but haven't completed any sets yet.`,
        primaryAction: {
          label: "Save as Draft",
          action: onSaveAsDraft,
          icon: Save,
          variant: "primary" as const
        },
        secondaryAction: {
          label: "Discard Workout",
          action: onDiscardWorkout,
          icon: Trash2,
          variant: "outline" as const
        },
        tertiaryAction: {
          label: "Continue Working Out",
          action: onContinueWorkout,
          icon: Play,
          variant: "ghost" as const
        }
      };
    }

    return {
      title: "Save Workout?",
      description: `You've completed ${completedSetsCount} set${completedSetsCount > 1 ? 's' : ''} across ${exerciseCount} exercise${exerciseCount > 1 ? 's' : ''}.`,
      primaryAction: {
        label: "Save Workout",
        action: onSaveWorkout,
        icon: CheckCircle,
        variant: "primary" as const
      },
      secondaryAction: {
        label: "Continue Working Out",
        action: onContinueWorkout,
        icon: Play,
        variant: "secondary" as const
      }
    };
  };

  const content = getDialogContent();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-gray-900 border-gray-700">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">
            {content.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-gray-400">
            {content.description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex flex-col gap-2 sm:flex-col">
          <ActionButton
            variant={content.primaryAction.variant}
            size="lg"
            icon={content.primaryAction.icon}
            onClick={() => {
              content.primaryAction.action();
              onOpenChange(false);
            }}
            loading={isSaving}
            disabled={isSaving}
            className="w-full"
          >
            {content.primaryAction.label}
          </ActionButton>
          
          <ActionButton
            variant={content.secondaryAction.variant}
            size="lg"
            icon={content.secondaryAction.icon}
            onClick={() => {
              content.secondaryAction.action();
              onOpenChange(false);
            }}
            disabled={isSaving}
            className="w-full"
          >
            {content.secondaryAction.label}
          </ActionButton>
          
          {content.tertiaryAction && (
            <ActionButton
              variant={content.tertiaryAction.variant}
              size="lg"
              icon={content.tertiaryAction.icon}
              onClick={() => {
                content.tertiaryAction.action();
                onOpenChange(false);
              }}
              disabled={isSaving}
              className="w-full"
            >
              {content.tertiaryAction.label}
            </ActionButton>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
