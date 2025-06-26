
import { useState, useCallback, useEffect } from 'react';

interface ExerciseRestTimePreferences {
  [exerciseName: string]: number; // seconds
}

const STORAGE_KEY = 'bullfit-exercise-rest-times';

// Smart defaults based on exercise type
const getDefaultRestTime = (exerciseName: string): number => {
  const compoundExercises = ['squat', 'deadlift', 'bench', 'row', 'press', 'pull'];
  const isCompound = compoundExercises.some(exercise => 
    exerciseName.toLowerCase().includes(exercise)
  );
  
  return isCompound ? 180 : 90; // 3 minutes for compound, 90s for isolation
};

export const useExerciseRestTime = () => {
  const [preferences, setPreferences] = useState<ExerciseRestTimePreferences>({});

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setPreferences(JSON.parse(stored));
      }
    } catch (error) {
      console.warn('Failed to load exercise rest time preferences:', error);
    }
  }, []);

  // Save preferences to localStorage whenever they change
  const savePreferences = useCallback((newPreferences: ExerciseRestTimePreferences) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPreferences));
      setPreferences(newPreferences);
    } catch (error) {
      console.warn('Failed to save exercise rest time preferences:', error);
    }
  }, []);

  // Get rest time for a specific exercise
  const getRestTime = useCallback((exerciseName: string): number => {
    return preferences[exerciseName] || getDefaultRestTime(exerciseName);
  }, [preferences]);

  // Set rest time for a specific exercise
  const setRestTime = useCallback((exerciseName: string, seconds: number) => {
    const newPreferences = {
      ...preferences,
      [exerciseName]: seconds
    };
    savePreferences(newPreferences);
  }, [preferences, savePreferences]);

  // Get all exercise preferences
  const getAllPreferences = useCallback(() => preferences, [preferences]);

  // Clear preferences for an exercise
  const clearRestTime = useCallback((exerciseName: string) => {
    const newPreferences = { ...preferences };
    delete newPreferences[exerciseName];
    savePreferences(newPreferences);
  }, [preferences, savePreferences]);

  return {
    getRestTime,
    setRestTime,
    clearRestTime,
    getAllPreferences
  };
};
