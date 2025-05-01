
import { useMemo } from 'react';
import { format } from 'date-fns';
import { WeightUnit, convertWeight } from '@/utils/unitConversion';

export interface VolumeDataPoint {
  date: string;
  volume: number;
  originalDate: string;
  formattedDate: string;
}

export interface DensityDataPoint {
  date: string;
  formattedDate: string;
  overallDensity: number;
  activeOnlyDensity: number;
}

interface WorkoutWithExercises {
  start_time: string;
  exercises?: Record<string, any[]>;
  metrics?: {
    densityMetrics?: {
      overallDensity?: number;
      activeOnlyDensity?: number;
    }
  };
}

export function useProcessWorkoutMetrics(
  workouts: WorkoutWithExercises[] | null | undefined,
  weightUnit: WeightUnit
) {
  // Process volume over time data
  const volumeOverTimeData = useMemo(() => {
    if (!Array.isArray(workouts) || workouts.length === 0) {
      console.log("No workout data available for volume processing");
      return [];
    }
    
    console.log(`Processing volume data for ${workouts.length} workouts`);
    
    try {
      const data = workouts.map(workout => {
        // Calculate volume for each workout
        let volume = 0;
        
        if (workout.exercises) {
let exerciseMap: Record<string, any[]> = {};

if (Array.isArray(workout.exercises)) {
  workout.exercises.forEach(set => {
    const name = set.exercise_name || 'Unknown';
    if (!exerciseMap[name]) exerciseMap[name] = [];
    exerciseMap[name].push(set);
  });
} else if (typeof workout.exercises === 'object') {
  exerciseMap = workout.exercises;
}

          // Check if exercises is an object
          if (typeof workout.exercises === 'object' && workout.exercises !== null) {
            Object.entries(exerciseMap).forEach(([exerciseName, sets]) => {
              // Make sure sets is an array before processing
              if (Array.isArray(sets)) {
console.log(`[Metrics] 🧩 ${exerciseName} →`, sets);

               sets.forEach(set => {
  if (set.completed && set.weight && set.reps) {
    const setVolume = set.weight * set.reps;
    console.log(`[Volume] ➕ ${set.exercise_name || 'Unknown'} → ${set.weight}kg x ${set.reps} = ${setVolume}`);
    volume += setVolume;
  }
});

              }
            });
          }
        }
        
        const formattedDate = format(new Date(workout.start_time), 'MMM d');
        
        return {
          date: workout.start_time,
          volume,
          originalDate: workout.start_time,
          formattedDate
        };
      }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      console.log(`Processed ${data.length} volume data points`);
      return data;
    } catch (error) {
      console.error("Error processing volume over time data:", error);
      return [];
    }
  }, [workouts]);
  
  // Process density over time data
  const densityOverTimeData = useMemo(() => {
    if (!Array.isArray(workouts) || workouts.length === 0) {
      console.log("No workout data available for density processing");
      return [];
    }
    
    console.log(`Processing density data for ${workouts.length} workouts`);
    
    try {
      const data = workouts.map(workout => {
        const densityMetrics = workout.metrics?.densityMetrics || {};
        const date = new Date(workout.start_time);
        
        return {
          date: workout.start_time,
          formattedDate: format(date, 'MMM d'),
          overallDensity: densityMetrics.overallDensity || 0,
          activeOnlyDensity: densityMetrics.activeOnlyDensity || 0
        };
      }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      console.log(`Processed ${data.length} density data points`);
      return data;
    } catch (error) {
      console.error("Error processing density over time data:", error);
      return [];
    }
  }, [workouts]);
  
  // Calculate volume statistics
  const volumeStats = useMemo(() => {
    if (volumeOverTimeData.length === 0) {
      return { total: 0, average: 0 };
    }
    
    const total = volumeOverTimeData.reduce((sum, item) => sum + item.volume, 0);
    const average = volumeOverTimeData.length > 0 ? total / volumeOverTimeData.length : 0;
    
    return {
      total: convertWeight(total, 'kg', weightUnit),
      average: convertWeight(average, 'kg', weightUnit)
    };
  }, [volumeOverTimeData, weightUnit]);
  
  // Calculate density statistics
  const densityStats = useMemo(() => {
    if (densityOverTimeData.length === 0) {
      return { 
        avgOverallDensity: 0, 
        avgActiveOnlyDensity: 0, 
        mostEfficientWorkout: null 
      };
    }
    
    const avgOverallDensity = densityOverTimeData.reduce((sum, item) => sum + item.overallDensity, 0) / densityOverTimeData.length;
    const avgActiveOnlyDensity = densityOverTimeData.reduce((sum, item) => sum + item.activeOnlyDensity, 0) / densityOverTimeData.length;
    
    // Find most efficient workout
    const mostEfficientWorkout = [...densityOverTimeData]
      .sort((a, b) => b.activeOnlyDensity - a.activeOnlyDensity)[0];
    
    return { 
      avgOverallDensity, 
      avgActiveOnlyDensity, 
      mostEfficientWorkout 
    };
  }, [densityOverTimeData]);
  
  return {
    volumeOverTimeData,
    densityOverTimeData,
    volumeStats,
    densityStats,
    hasVolumeData: volumeOverTimeData.length > 0,
    hasDensityData: densityOverTimeData.length > 0
  };
}
