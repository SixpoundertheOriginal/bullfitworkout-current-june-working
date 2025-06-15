
import React from 'react';
import { Plus, CheckCircle } from 'lucide-react';
import { ActionButton } from '@/components/ui/ActionButton';
import { cn } from '@/lib/utils';

interface EnhancedWorkoutSessionFooterProps {
  onAddExercise: () => void;
  onFinishWorkout: () => void;
  hasExercises: boolean;
  isSaving: boolean;
}

export const EnhancedWorkoutSessionFooter: React.FC<EnhancedWorkoutSessionFooterProps> = ({
  onAddExercise,
  onFinishWorkout,
  hasExercises,
  isSaving,
}) => {
  return (
    <footer
      className={cn(
        'fixed bottom-0 left-0 right-0 z-40 bg-neutral/90 backdrop-blur-md border-t border-slate-700/50',
        'p-4', // Base padding
        'pb-[calc(1rem+env(safe-area-inset-bottom))]' // Override bottom padding to include safe area
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
          onClick={onFinishWorkout}
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
