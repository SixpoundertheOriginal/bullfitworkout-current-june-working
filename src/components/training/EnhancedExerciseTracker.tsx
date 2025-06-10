
import React from 'react';
import { ExerciseTrackerContainer } from './ExerciseTrackerContainer';

// TypeScript Interfaces
interface ExerciseSet {
  id: number;
  weight: number;
  reps: number;
  duration: string;
  completed: boolean;
  volume: number;
}

interface Exercise {
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
  exercise: Exercise;
  onUpdateSet: (setId: number, updates: Partial<ExerciseSet>) => void;
  onToggleCompletion: (setId: number) => void;
  onAddSet: () => void;
  onDeleteSet: (setId: number) => void;
  onDeleteExercise?: (exerciseName: string) => void;
  isActive?: boolean;
}

export const EnhancedExerciseTracker: React.FC<EnhancedExerciseTrackerProps> = React.memo((props) => {
  return <ExerciseTrackerContainer {...props} />;
});

EnhancedExerciseTracker.displayName = 'EnhancedExerciseTracker';
