
import { useCallback, useMemo } from 'react';
import { useWorkoutStore } from '@/store/workoutStore';
import { EnhancedExerciseSet } from '@/types/workout';

export interface EnhancedExercise {
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

export const useEnhancedExerciseTracker = (exerciseName: string) => {
  const { 
    exercises: storeExercises, 
    setExercises: setStoreExercises,
    activeExercise,
    setActiveExercise 
  } = useWorkoutStore();

  // Format duration helper
  const formatDuration = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  // Convert store format to enhanced format with computed volume
  const enhancedExercise = useMemo((): EnhancedExercise => {
    const storeSets = storeExercises[exerciseName] || [];
    
    return {
      id: exerciseName,
      name: exerciseName,
      lastWorkout: undefined, // TODO: Get from workout history
      sets: storeSets.map((set, index) => ({
        id: index, // Use index as numeric ID for display
        weight: set.weight || 0,
        reps: set.reps || 0,
        duration: formatDuration(set.restTime || 60),
        completed: set.completed || false,
        volume: (set.weight || 0) * (set.reps || 0) // Computed volume
      }))
    };
  }, [storeExercises, exerciseName, formatDuration]);

  // Update set handler with volume recalculation
  const handleUpdateSet = useCallback((setId: number, updates: Partial<{
    id: number;
    weight: number;
    reps: number;
    duration: string;
    completed: boolean;
    volume: number;
  }>) => {
    setStoreExercises(prev => {
      const exerciseSets = [...(prev[exerciseName] || [])];
      if (exerciseSets[setId]) {
        const updatedSet = { ...exerciseSets[setId] };
        
        // Apply updates
        if (updates.weight !== undefined) updatedSet.weight = updates.weight;
        if (updates.reps !== undefined) updatedSet.reps = updates.reps;
        if (updates.completed !== undefined) updatedSet.completed = updates.completed;
        if (updates.duration !== undefined) {
          // Convert duration string back to seconds
          const [mins, secs] = updates.duration.split(':').map(Number);
          updatedSet.restTime = (mins * 60) + secs;
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
        isEditing: false,
        volume: 0 // Will be calculated when weight/reps are set
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
