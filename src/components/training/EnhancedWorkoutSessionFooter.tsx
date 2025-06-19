
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
        'fixed bottom-0 left-0 right-0 z-50 bg-neutral/90 backdrop-blur-md border-t border-slate-700/50',
        'p-4',
        'pb-[calc(1rem+env(safe-area-inset-bottom))]' // Proper safe area handling
      )}
    >
      <div className="mx-auto flex w-full max-w-md items-center justify-between gap-4">
        <ActionButton
          variant="secondary"
          size="md"
          icon={Plus}
          onClick={onAddExercise}
          className="flex-1"
          aria-label="Add Exercise"
        >
          Add Exercise
        </ActionButton>
        
        <ActionButton
          variant="primary"
          size="md"
          icon={CheckCircle}
          onClick={handleFinishClick}
          disabled={!hasExercises || isSaving}
          loading={isSaving}
          className="flex-1"
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
