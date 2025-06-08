
import { useMemo, useCallback } from 'react';
import { Exercise } from '@/types/exercise';
import { useExercises } from '@/hooks/useExercises';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';

export interface ExerciseLibraryData {
  allExercises: Exercise[];
  recentExercises: Exercise[];
  suggestedExercises: Exercise[];
  isLoading: boolean;
  isError: boolean;
  refreshData: () => void;
}

export interface UseExerciseLibraryDataOptions {
  suggestionCount?: number;
  recentWorkoutCount?: number;
  trainingType?: string;
}

export const useExerciseLibraryData = ({
  suggestionCount = 20,
  recentWorkoutCount = 8,
  trainingType = ""
}: UseExerciseLibraryDataOptions = {}): ExerciseLibraryData => {
  const { exercises: allExercises, isLoading, isError } = useExercises();
  const { workouts } = useWorkoutHistory();

  // Extract recently used exercises with error handling
  const recentExercises = useMemo(() => {
    if (!workouts?.length || !Array.isArray(allExercises)) return [];
    
    const exerciseMap = new Map<string, Exercise>();
    
    workouts.slice(0, recentWorkoutCount).forEach(workout => {
      const exerciseNames = new Set<string>();
      
      if (workout?.exerciseSets && Array.isArray(workout.exerciseSets)) {
        workout.exerciseSets.forEach(set => {
          if (set?.exercise_name) {
            exerciseNames.add(set.exercise_name);
          }
        });
      }
      
      exerciseNames.forEach(name => {
        const exercise = allExercises.find(e => e?.name === name);
        if (exercise && !exerciseMap.has(exercise.id)) {
          exerciseMap.set(exercise.id, exercise);
        }
      });
    });
    
    return Array.from(exerciseMap.values());
  }, [workouts, allExercises, recentWorkoutCount]);

  // Generate suggested exercises based on training type
  const suggestedExercises = useMemo(() => {
    if (!Array.isArray(allExercises)) return [];
    
    if (trainingType) {
      const trainingTypeLower = trainingType.toLowerCase();
      return allExercises.filter(exercise => 
        exercise?.primary_muscle_groups?.some(muscle => 
          muscle.toLowerCase().includes(trainingTypeLower)
        ) ||
        exercise?.name?.toLowerCase().includes(trainingTypeLower)
      ).slice(0, suggestionCount);
    }
    
    // Default suggestions - compound exercises and popular movements
    return allExercises.filter(exercise => 
      exercise?.is_compound || 
      exercise?.primary_muscle_groups?.some(muscle => 
        ['chest', 'back', 'legs', 'shoulders'].includes(muscle.toLowerCase())
      )
    ).slice(0, suggestionCount);
  }, [allExercises, trainingType, suggestionCount]);

  const refreshData = useCallback(() => {
    // Since useExercises doesn't expose refetch, we can trigger a refresh
    // by invalidating the query cache or implement a different refresh mechanism
    console.log('Refresh data requested - implementing cache invalidation if needed');
    // For now, this is a no-op until we have proper refetch functionality
  }, []);

  return {
    allExercises: Array.isArray(allExercises) ? allExercises : [],
    recentExercises,
    suggestedExercises,
    isLoading,
    isError,
    refreshData
  };
};
