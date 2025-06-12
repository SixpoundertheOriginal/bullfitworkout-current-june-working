
import { useState, useEffect } from 'react';
import { Exercise } from '@/types/exercise';

interface ExerciseInput {
  name: string;
  description: string;
  primary_muscle_groups: string[];
  secondary_muscle_groups: string[];
  equipment_type: string[];
  difficulty: string;
  movement_pattern: string;
  is_compound: boolean;
  instructions: {
    steps: string;
    form: string;
  };
  user_id: string;
}

export const useExercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    // Mock loading exercises
    const timer = setTimeout(() => {
      setExercises([]);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const createExercise = (exerciseData: ExerciseInput, options: {
    onSuccess: (data: Exercise) => void;
    onError: (error: Error) => void;
  }) => {
    setIsPending(true);
    
    // Mock creation
    setTimeout(() => {
      const newExercise: Exercise = {
        id: Date.now().toString(),
        name: exerciseData.name,
        description: exerciseData.description,
        primary_muscle_groups: exerciseData.primary_muscle_groups,
        secondary_muscle_groups: exerciseData.secondary_muscle_groups,
        equipment_type: exerciseData.equipment_type,
        difficulty: exerciseData.difficulty,
        movement_pattern: exerciseData.movement_pattern,
        is_compound: exerciseData.is_compound,
        instructions: exerciseData.instructions
      };
      
      setExercises(prev => [...prev, newExercise]);
      setIsPending(false);
      options.onSuccess(newExercise);
    }, 1000);
  };

  return {
    exercises,
    isLoading,
    createExercise,
    isPending,
    error,
    isError
  };
};
