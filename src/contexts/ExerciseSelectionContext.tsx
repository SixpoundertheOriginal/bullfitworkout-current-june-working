
import React, { createContext, useContext, useState, useCallback } from 'react';
import { Exercise } from '@/types/exercise';

interface ExerciseSelectionContextType {
  selectedExercises: Exercise[];
  addExercise: (exercise: Exercise) => void;
  removeExercise: (exerciseId: string) => void;
  clearSelection: () => void;
  isSelected: (exerciseId: string) => boolean;
  selectionMode: 'single' | 'multiple';
  setSelectionMode: (mode: 'single' | 'multiple') => void;
}

const ExerciseSelectionContext = createContext<ExerciseSelectionContextType | undefined>(undefined);

interface ExerciseSelectionProviderProps {
  children: React.ReactNode;
  initialMode?: 'single' | 'multiple';
}

export const ExerciseSelectionProvider: React.FC<ExerciseSelectionProviderProps> = ({
  children,
  initialMode = 'single'
}) => {
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [selectionMode, setSelectionMode] = useState<'single' | 'multiple'>(initialMode);

  const addExercise = useCallback((exercise: Exercise) => {
    setSelectedExercises(prev => {
      if (selectionMode === 'single') {
        return [exercise];
      } else {
        // Multiple mode - avoid duplicates
        const exists = prev.some(e => e.id === exercise.id);
        return exists ? prev : [...prev, exercise];
      }
    });
  }, [selectionMode]);

  const removeExercise = useCallback((exerciseId: string) => {
    setSelectedExercises(prev => prev.filter(e => e.id !== exerciseId));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedExercises([]);
  }, []);

  const isSelected = useCallback((exerciseId: string) => {
    return selectedExercises.some(e => e.id === exerciseId);
  }, [selectedExercises]);

  const value: ExerciseSelectionContextType = {
    selectedExercises,
    addExercise,
    removeExercise,
    clearSelection,
    isSelected,
    selectionMode,
    setSelectionMode
  };

  return (
    <ExerciseSelectionContext.Provider value={value}>
      {children}
    </ExerciseSelectionContext.Provider>
  );
};

export const useExerciseSelection = () => {
  const context = useContext(ExerciseSelectionContext);
  if (context === undefined) {
    throw new Error('useExerciseSelection must be used within an ExerciseSelectionProvider');
  }
  return context;
};
