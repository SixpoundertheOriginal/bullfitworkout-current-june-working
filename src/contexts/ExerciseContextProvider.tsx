
import React from 'react';
import { TrainingExerciseProvider } from './TrainingExerciseContext';
import { LibraryExerciseProvider } from './LibraryExerciseContext';
import { ExerciseSearchProvider } from './ExerciseSearchContext';

interface ExerciseContextProviderProps {
  children: React.ReactNode;
}

/**
 * Root provider that combines all exercise-related contexts
 * This provides the foundation for the enterprise-scale exercise management system
 * with proper separation between training, library, and search contexts.
 */
export const ExerciseContextProvider: React.FC<ExerciseContextProviderProps> = ({ children }) => {
  return (
    <ExerciseSearchProvider>
      <LibraryExerciseProvider>
        <TrainingExerciseProvider>
          {children}
        </TrainingExerciseProvider>
      </LibraryExerciseProvider>
    </ExerciseSearchProvider>
  );
};

export default ExerciseContextProvider;
