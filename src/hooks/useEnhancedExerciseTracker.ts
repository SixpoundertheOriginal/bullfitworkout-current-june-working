import { useCallback, useMemo } from 'react';
import { useWorkoutStore } from '@/store/workoutStore';

export interface EnhancedExerciseSet {
  id: number;
  weight: number;
  reps: number;
  duration: string;
  completed: boolean;
  volume: number;
}

export interface EnhancedExercise {
  id: string;
  name: string;
  lastWorkout?: {
    weight: number;
    reps: number;
    daysAgo: number;
  };
  sets: EnhancedExerciseSet[];
}

export const useEnhancedExerciseTracker = (exerciseName: string) => {
  const { 
    exercises: storeExercises, 
    setExercises: setStoreExercises,
    activeExercise,
    setActiveExercise 
  } = useWorkoutStore();

  // Format duration helper - moved before useMemo to avoid temporal dead zone
  const formatDuration = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Convert store format to enhanced format
  const enhancedExercise = useMemo((): EnhancedExercise => {
    const storeSets = storeExercises[exerciseName] || [];
    
    return {
      id: exerciseName,
      name: exerciseName,
      lastWorkout: undefined, // TODO: Get from workout history
      sets: storeSets.map((set, index) => ({
        id: index,
        weight: set.weight || 0,
        reps: set.reps || 0,
        duration: formatDuration(set.restTime || 60),
        completed: set.completed || false,
        volume: (set.weight || 0) * (set.reps || 0)
      }))
    };
  }, [storeExercises, exerciseName, formatDuration]);

  // Update set handler
  const handleUpdateSet = useCallback((setId: number, updates: Partial<EnhancedExerciseSet>) => {
    setStoreExercises(prev => {
      const exerciseSets = [...(prev[exerciseName] || [])];
      if (exerciseSets[setId]) {
        const updatedSet = { ...exerciseSets[setId] };
        
        if (updates.weight !== undefined) updatedSet.weight = updates.weight;
        if (updates.reps !== undefined) updatedSet.reps = updates.reps;
        if (updates.completed !== undefined) updatedSet.completed = updates.completed;
        if (updates.volume !== undefined) {
          // Recalculate weight/reps if volume is provided
          updatedSet.weight = updates.weight || updatedSet.weight;
          updatedSet.reps = updates.reps || updatedSet.reps;
        }
        
        exerciseSets[setId] = updatedSet;
      }
      
      return {
        ...prev,
        [exerciseName]: exerciseSets
      };
    });
  }, [exerciseName, setStoreExercises]);

  // Toggle completion handler
  const handleToggleCompletion = useCallback((setId: number) => {
    setStoreExercises(prev => {
      const exerciseSets = [...(prev[exerciseName] || [])];
      if (exerciseSets[setId]) {
        exerciseSets[setId] = {
          ...exerciseSets[setId],
          completed: !exerciseSets[setId].completed
        };
      }
      
      return {
        ...prev,
        [exerciseName]: exerciseSets
      };
    });
  }, [exerciseName, setStoreExercises]);

  // Add set handler
  const handleAddSet = useCallback(() => {
    setStoreExercises(prev => {
      const exerciseSets = prev[exerciseName] || [];
      const lastSet = exerciseSets[exerciseSets.length - 1];
      
      const newSet = {
        weight: lastSet?.weight || 0,
        reps: lastSet?.reps || 0,
        restTime: lastSet?.restTime || 60,
        completed: false,
        isEditing: false
      };
      
      return {
        ...prev,
        [exerciseName]: [...exerciseSets, newSet]
      };
    });
  }, [exerciseName, setStoreExercises]);

  // Delete set handler
  const handleDeleteSet = useCallback((setId: number) => {
    setStoreExercises(prev => {
      const exerciseSets = [...(prev[exerciseName] || [])];
      exerciseSets.splice(setId, 1);
      
      return {
        ...prev,
        [exerciseName]: exerciseSets
      };
    });
  }, [exerciseName, setStoreExercises]);

  return {
    exercise: enhancedExercise,
    isActive: activeExercise === exerciseName,
    onUpdateSet: handleUpdateSet,
    onToggleCompletion: handleToggleCompletion,
    onAddSet: handleAddSet,
    onDeleteSet: handleDeleteSet,
    onSetActive: () => setActiveExercise(exerciseName)
  };
};
