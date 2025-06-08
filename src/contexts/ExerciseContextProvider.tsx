
import React from 'react';
import { TrainingExerciseProvider } from './TrainingExerciseContext';
import { LibraryExerciseProvider } from './LibraryExerciseContext';
import { ExerciseSearchProvider } from './ExerciseSearchContext';

interface ExerciseContextProviderProps {
  children: React.ReactNode;
}

/**
 * Enterprise-scale exercise context provider
 * Provides foundation for millions of users with proper separation between
 * training, library, and search contexts for optimal performance and scalability
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
