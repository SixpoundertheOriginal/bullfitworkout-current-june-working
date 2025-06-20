
import React, { useCallback } from 'react';
import { Plus, CheckCircle } from 'lucide-react';
import { ActionButton } from '@/components/ui/ActionButton';
import { cn } from '@/lib/utils';

interface EnhancedWorkoutSessionFooterProps {
  onAddExercise: () => void;
  onFinishWorkout: () => void;
  hasExercises: boolean;
  isSaving: boolean;
}

// Custom comparison function to prevent unnecessary re-renders
const arePropsEqual = (
  prevProps: EnhancedWorkoutSessionFooterProps,
  nextProps: EnhancedWorkoutSessionFooterProps
) => {
  return (
    prevProps.hasExercises === nextProps.hasExercises &&
    prevProps.isSaving === nextProps.isSaving &&
    prevProps.onAddExercise === nextProps.onAddExercise &&
    prevProps.onFinishWorkout === nextProps.onFinishWorkout
  );
};

const EnhancedWorkoutSessionFooterComponent: React.FC<EnhancedWorkoutSessionFooterProps> = ({
  onAddExercise,
  onFinishWorkout,
  hasExercises,
  isSaving,
}) => {
  // Memoize the finish click handler to prevent recreation
  const handleFinishClick = useCallback(() => {
    onFinishWorkout();
  }, [onFinishWorkout]);

  return (
    <footer
      className={cn(
        // Fixed positioning with proper z-index
        'fixed bottom-0 left-0 right-0 z-50',
        // Background with proper opacity and backdrop blur
        'bg-gray-900/95 backdrop-blur-md border-t border-gray-700/50',
        // Mobile-first padding with safe area support
        'p-4 pb-safe-bottom',
        // Ensure visibility on all backgrounds
        'shadow-lg shadow-black/20'
      )}
    >
      <div className={cn(
        // Container with max width and centering
        'mx-auto flex w-full max-w-md items-center justify-between gap-4',
        // Mobile touch target optimization
        'min-h-[60px]'
      )}>
        <ActionButton
          variant="secondary"
          size="lg"
          icon={Plus}
          onClick={onAddExercise}
          className={cn(
            'flex-1 touch-target',
            // Mobile-optimized button styling
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
          icon={CheckCircle}
          onClick={handleFinishClick}
          disabled={!hasExercises || isSaving}
          loading={isSaving}
          className={cn(
            'flex-1 touch-target',
            // Primary button with proper contrast
            'bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50',
            'text-white border border-purple-500 hover:border-purple-400',
            'disabled:border-purple-600/50 disabled:cursor-not-allowed',
            'transition-all duration-200'
          )}
          aria-label="Finish Workout"
        >
          {isSaving ? 'Saving...' : 'Finish Workout'}
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
