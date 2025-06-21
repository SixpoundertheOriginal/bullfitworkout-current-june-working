
import React, { useCallback } from 'react';
import { Plus, CheckCircle, Square } from 'lucide-react';
import { ActionButton } from '@/components/ui/ActionButton';
import { cn } from '@/lib/utils';

interface EnhancedWorkoutSessionFooterProps {
  onAddExercise: () => void;
  onFinishWorkout: () => void;
  hasExercises: boolean;
  isSaving: boolean;
  completedSetsCount?: number;
}

// Custom comparison function to prevent unnecessary re-renders
const arePropsEqual = (
  prevProps: EnhancedWorkoutSessionFooterProps,
  nextProps: EnhancedWorkoutSessionFooterProps
) => {
  return (
    prevProps.hasExercises === nextProps.hasExercises &&
    prevProps.isSaving === nextProps.isSaving &&
    prevProps.completedSetsCount === nextProps.completedSetsCount &&
    prevProps.onAddExercise === nextProps.onAddExercise &&
    prevProps.onFinishWorkout === nextProps.onFinishWorkout
  );
};

const EnhancedWorkoutSessionFooterComponent: React.FC<EnhancedWorkoutSessionFooterProps> = ({
  onAddExercise,
  onFinishWorkout,
  hasExercises,
  isSaving,
  completedSetsCount = 0,
}) => {
  // Memoize the finish click handler to prevent recreation
  const handleFinishClick = useCallback(() => {
    onFinishWorkout();
  }, [onFinishWorkout]);

  // Contextual button text and icon based on workout state
  const getFinishButtonProps = () => {
    if (isSaving) {
      return {
        text: 'Saving...',
        icon: CheckCircle
      };
    }
    
    if (completedSetsCount > 0) {
      return {
        text: 'Complete Workout',
        icon: CheckCircle
      };
    }
    
    return {
      text: 'End Session',
      icon: Square
    };
  };

  const finishButtonProps = getFinishButtonProps();

  return (
    <footer
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50',
        'bg-gray-900/95 backdrop-blur-md border-t border-gray-700/50',
        'p-4 pb-safe-bottom',
        'shadow-lg shadow-black/20'
      )}
    >
      <div className={cn(
        'mx-auto flex w-full max-w-md items-center justify-between gap-4',
        'min-h-[60px]'
      )}>
        <ActionButton
          variant="secondary"
          size="lg"
          icon={Plus}
          onClick={onAddExercise}
          className={cn(
            'flex-1 touch-target',
            'bg-gray-700 hover:bg-gray-600 text-white',
            'border border-gray-600 hover:border-gray-500',
            'transition-all duration-200'
          )}
          aria-label="Add Exercise"
        >
          Add Exercise
        </ActionButton>
        
        <ActionButton
          variant="primary"
          size="lg"
          icon={finishButtonProps.icon}
          onClick={handleFinishClick}
          disabled={isSaving}
          loading={isSaving}
          className={cn(
            'flex-1 touch-target',
            'bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50',
            'text-white border border-purple-500 hover:border-purple-400',
            'disabled:border-purple-600/50 disabled:cursor-not-allowed',
            'transition-all duration-200'
          )}
          aria-label={finishButtonProps.text}
        >
          {finishButtonProps.text}
        </ActionButton>
      </div>
    </footer>
  );
};

// Export the memoized component
export const EnhancedWorkoutSessionFooter = React.memo(
  EnhancedWorkoutSessionFooterComponent,
  arePropsEqual
);
