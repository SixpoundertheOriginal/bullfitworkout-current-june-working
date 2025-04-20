
import { useState, useEffect } from 'react';
import { ExerciseSet } from '@/types/exercise';
import { WorkoutMetrics } from '@/types/workout-metrics';
import { 
  calculateWorkoutMetrics, 
  getExerciseGroup, 
  calculateSetVolume,
  isIsometricExercise 
} from '@/utils/workoutMetrics';

export interface ExerciseGroupData {
  group: string;
  totalVolume: number;
  exercises: string[];
}

export const useWorkoutMetrics = (
  exercises: Record<string, ExerciseSet[]>,
  time: number,
  weightUnit: string
) => {
  const [metrics, setMetrics] = useState<WorkoutMetrics>({
    time: 0,
    exerciseCount: 0,
    completedSets: 0,
    totalSets: 0,
    performance: {
      volume: 0,
      intensity: 0,
      density: 0,
      efficiency: 0
    }
  });
  
  const [exerciseGroups, setExerciseGroups] = useState<ExerciseGroupData[]>([]);

  useEffect(() => {
    if (!exercises || Object.keys(exercises).length === 0) {
      // Return early with default values if no exercises
      return;
    }

    // Calculate standard metrics
    const updatedMetrics = calculateWorkoutMetrics(exercises, time, weightUnit);
    setMetrics(updatedMetrics);
    
    // Calculate exercise groups data
    const groupsMap: Record<string, ExerciseGroupData> = {};
    
    Object.entries(exercises).forEach(([exerciseName, sets]) => {
      const group = getExerciseGroup(exerciseName);
      if (!group) return;
      
      if (!groupsMap[group]) {
        groupsMap[group] = {
          group,
          totalVolume: 0,
          exercises: []
        };
      }
      
      // Add exercise to group
      if (!groupsMap[group].exercises.includes(exerciseName)) {
        groupsMap[group].exercises.push(exerciseName);
      }
      
      // Calculate volume for this exercise
      let exerciseVolume = 0;
      
      // For isometric exercises, handle differently
      if (isIsometricExercise(exerciseName)) {
        exerciseVolume = sets.reduce((total, set) => {
          if (set.completed) {
            return total + (set.reps > 0 ? set.reps * 10 : 0);
          }
          return total;
        }, 0);
      } else {
        // Regular exercises with weight/reps
        exerciseVolume = sets.reduce((total, set) => {
          return total + calculateSetVolume(set);
        }, 0);
      }
      
      groupsMap[group].totalVolume += exerciseVolume;
    });
    
    // Convert map to array
    setExerciseGroups(Object.values(groupsMap));
  }, [exercises, time, weightUnit]);

  return { 
    metrics, 
    exerciseGroups,
    exerciseCount: metrics.exerciseCount,
    completedSets: metrics.completedSets,
    totalSets: metrics.totalSets,
    performance: metrics.performance
  };
};
