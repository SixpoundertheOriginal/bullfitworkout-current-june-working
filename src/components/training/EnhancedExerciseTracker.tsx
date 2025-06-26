
import React from 'react';
import { ExerciseTrackerContainer } from './ExerciseTrackerContainer';
import { ExerciseSet } from '@/store/workoutStore';

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
