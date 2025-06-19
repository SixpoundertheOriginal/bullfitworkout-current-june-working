
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
  console.log('[EnhancedWorkoutSessionFooter] Render state:', {
    hasExercises,
    isSaving,
    buttonDisabled: !hasExercises || isSaving
  });

  const handleFinishClick = () => {
    console.log('[EnhancedWorkoutSessionFooter] Finish button clicked');
    onFinishWorkout();
  };

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
