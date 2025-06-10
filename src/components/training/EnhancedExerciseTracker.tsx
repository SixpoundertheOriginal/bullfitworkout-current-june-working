
import React from 'react';
import { ExerciseTrackerContainer } from './ExerciseTrackerContainer';
import { EnhancedExerciseSet } from '@/types/workout';

// Enhanced Exercise interface with computed volume
interface EnhancedExercise {
  id: string;
  name: string;
  lastWorkout?: {
    weight: number;
    reps: number;
    daysAgo: number;
  };
  sets: Array<{
    id: number;
    weight: number;
    reps: number;
    duration: string;
    completed: boolean;
    volume: number;
  }>;
}

interface EnhancedExerciseTrackerProps {
  exercise: EnhancedExercise;
  onUpdateSet: (setId: number, updates: Partial<{
    id: number;
    weight: number;
    reps: number;
    duration: string;
    completed: boolean;
    volume: number;
  }>) => void;
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
