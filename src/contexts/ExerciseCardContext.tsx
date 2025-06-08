
import React, { createContext, useContext, useMemo } from 'react';
import { Exercise, ExerciseCardVariant, ExerciseCardContextType } from '@/types/exercise';

interface ExerciseCardProviderProps {
  children: React.ReactNode;
  exercise: Exercise;
  variant: ExerciseCardVariant;
  context: 'library' | 'selection' | 'workout';
  isFavorited?: boolean;
  className?: string;
}

const ExerciseCardContext = createContext<ExerciseCardContextType | undefined>(undefined);

export const ExerciseCardProvider: React.FC<ExerciseCardProviderProps> = ({
  children,
  exercise,
  variant,
  context,
  isFavorited = false,
  className
}) => {
  const value = useMemo((): ExerciseCardContextType => ({
    exercise,
    variant,
    context,
    isFavorited,
    className,
    primaryMuscles: Array.isArray(exercise.primary_muscle_groups) 
      ? exercise.primary_muscle_groups 
      : [],
    equipment: Array.isArray(exercise.equipment_type) 
      ? exercise.equipment_type 
      : []
  }), [exercise, variant, context, isFavorited, className]);

  return (
    <ExerciseCardContext.Provider value={value}>
      {children}
    </ExerciseCardContext.Provider>
  );
};

export const useExerciseCardContext = () => {
  const context = useContext(ExerciseCardContext);
  if (!context) {
    throw new Error('useExerciseCardContext must be used within ExerciseCardProvider');
  }
  return context;
};
