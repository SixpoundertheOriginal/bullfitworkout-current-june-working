
import React from 'react';
import { ExerciseTrackerContainer } from './ExerciseTrackerContainer';
import { ExerciseSet } from '@/types/exercise';

// Use the canonical ExerciseSet type to ensure all properties are present
// and handler signatures use string IDs.
interface EnhancedExercise {
  id: string;
  name: string;
  lastWorkout?: {
    weight: number;
    reps: number;
    daysAgo: number;
  };
  sets: ExerciseSet[];
}

interface EnhancedExerciseTrackerProps {
  exercise: EnhancedExercise;
  onUpdateSet: (setId: string, updates: Partial<ExerciseSet>) => void;
  onToggleCompletion: (setId: string) => void;
  onAddSet: () => void;
  onDeleteSet: (setId: string) => void;
  onDeleteExercise?: (exerciseName: string) => void;
  isActive?: boolean;
}

export const EnhancedExerciseTracker: React.FC<EnhancedExerciseTrackerProps> = React.memo((props) => {
  return <ExerciseTrackerContainer {...props} />;
});

EnhancedExerciseTracker.displayName = 'EnhancedExerciseTracker';
