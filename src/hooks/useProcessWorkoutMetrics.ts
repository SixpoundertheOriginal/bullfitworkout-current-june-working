
import { useMemo } from 'react';
import { format } from 'date-fns';
import { WeightUnit, convertWeight } from '@/utils/unitConversion';
import { processWorkoutMetrics } from '@/utils/workoutMetricsProcessor';

export interface VolumeDataPoint {
  date: string;            // ISO string
  originalDate: string;    // ISO string
  formattedDate: string;   // e.g. "May 4"
  volume: number;          // in user's weightUnit
}

export interface DensityDataPoint {
  date: string;
  formattedDate: string;
  overallDensity: number;    // volumeRate: unit/min
  activeOnlyDensity: number; // activeVolumeRate: unit/min
  totalTime: number;         // minutes
  restTime: number;          // minutes
  activeTime: number;        // minutes
}

interface WorkoutWithExercises {
  start_time: string;                 // ISO
  duration: number;                   // total session length in minutes
  exercises?: Array<{
    exercise_name: string;
    completed?: boolean;
    weight?: number;                  // in kg
    reps?: number;
    restTime?: number;                // in seconds
  }> | Record<string, any[]>;         // support both shapes
}

function flattenExercises(
  exercises: WorkoutWithExercises['exercises']
) {
  if (!exercises) return [];
  if (Array.isArray(exercises)) return exercises;
  // else it's already grouped by exerciseName
  return Object.values(exercises).flat();
}

// Helper function to categorize time of day
function categorizeTimeOfDay(date: Date): 'morning' | 'afternoon' | 'evening' | 'night' {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 22) return 'evening';
  return 'night';
}

export function useProcessWorkoutMetrics(
  workouts: WorkoutWithExercises[] | null | undefined,
  weightUnit: WeightUnit
) {
  // --- Volume over time ---
  const volumeOverTimeData = useMemo<VolumeDataPoint[]>(() => {
    if (!Array.isArray(workouts) || workouts.length === 0) return [];

    return workouts
      .map((workout) => {
        // flatten all sets
        const allSets = flattenExercises(workout.exercises);

        // sum raw volume in KG
        const rawVolume = allSets.reduce((sum, set) => {
          if (set.completed && set.weight && set.reps) {
            return sum + set.weight * set.reps;
          }
          return sum;
        }, 0);

        // convert to user's unit (e.g. lb)
        const volume = convertWeight(rawVolume, 'kg', weightUnit);

        const formattedDate = format(new Date(workout.start_time), 'MMM d');

        return {
          date: workout.start_time,
          originalDate: workout.start_time,
          formattedDate,
          volume
        };
      })
      // sort ascending by date
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [workouts, weightUnit]);

  // --- Density over time ---
  // Use the centralized density logic from processWorkoutMetrics
  const densityOverTimeData = useMemo<DensityDataPoint[]>(() => {
    if (!Array.isArray(workouts) || workouts.length === 0) return [];

    return workouts
      .map((workout) => {
        const allSets = flattenExercises(workout.exercises);
        
        // Use the same processWorkoutMetrics function to calculate density
        const exercisesByName: Record<string, any[]> = {};
        if (Array.isArray(allSets)) {
          allSets.forEach(set => {
            const name = set.exercise_name || "Unknown";
            if (!exercisesByName[name]) exercisesByName[name] = [];
            exercisesByName[name].push(set);
          });
        }
        
        // Process this single workout's metrics using our centralized function
        const metrics = processWorkoutMetrics(
          exercisesByName, 
          workout.duration || 0,
          'kg', // raw calculation is always in kg, we'll convert later
          undefined,
          { start_time: workout.start_time, duration: workout.duration || 0 }
        );
        
        // Pull the density values directly from the metrics
        const { overallDensity, activeOnlyDensity } = metrics.densityMetrics;
        
        // Convert to user's unit if needed
        const convertedOverallDensity = weightUnit === 'kg' ? 
          overallDensity : overallDensity * 2.20462;
        const convertedActiveOnlyDensity = weightUnit === 'kg' ? 
          activeOnlyDensity : activeOnlyDensity * 2.20462;

        const formattedDate = format(
          new Date(workout.start_time),
          'MMM d'
        );

        return {
          date: workout.start_time,
          formattedDate,
          overallDensity: convertedOverallDensity,
          activeOnlyDensity: convertedActiveOnlyDensity,
          totalTime: metrics.duration,
          restTime: metrics.timeDistribution.restTime,
          activeTime: metrics.timeDistribution.activeTime
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [workouts, weightUnit]);

  // --- Time of Day distribution ---
  const durationByTimeOfDay = useMemo(() => {
    const timeDistribution = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0
    };
    
    if (!Array.isArray(workouts) || workouts.length === 0) {
      return timeDistribution;
    }

    workouts.forEach(workout => {
      const workoutDate = new Date(workout.start_time);
      const category = categorizeTimeOfDay(workoutDate);
      timeDistribution[category] += workout.duration || 0;
    });

    return timeDistribution;
  }, [workouts]);

  // --- Volume statistics ---
  const volumeStats = useMemo(() => {
    if (volumeOverTimeData.length === 0) {
      return { total: 0, average: 0 };
    }
    const total = volumeOverTimeData.reduce((sum, pt) => sum + pt.volume, 0);
    const average = total / volumeOverTimeData.length;
    return { total, average };
  }, [volumeOverTimeData]);

  // --- Density statistics ---
  const densityStats = useMemo(() => {
    if (densityOverTimeData.length === 0) {
      return {
        avgOverallDensity: 0,
        avgActiveOnlyDensity: 0,
        mostEfficientWorkout: null as DensityDataPoint | null
      };
    }
    
    // Calculate averages directly from the density metrics from our processor
    const avgOverallDensity =
      densityOverTimeData.reduce((sum, pt) => sum + pt.overallDensity, 0) /
      densityOverTimeData.length;
      
    const avgActiveOnlyDensity =
      densityOverTimeData.reduce((sum, pt) => sum + pt.activeOnlyDensity, 0) /
      densityOverTimeData.length;
      
    // Find the most efficient workout based on activeOnlyDensity
    const mostEfficientWorkout = densityOverTimeData.reduce(
      (best, pt) =>
        !best || pt.activeOnlyDensity > best.activeOnlyDensity ? pt : best,
      null as DensityDataPoint | null
    );
    
    return { avgOverallDensity, avgActiveOnlyDensity, mostEfficientWorkout };
  }, [densityOverTimeData]);

  return {
    volumeOverTimeData,
    densityOverTimeData,
    volumeStats,
    densityStats,
    durationByTimeOfDay,
    hasVolumeData: volumeOverTimeData.length > 0,
    hasDensityData: densityOverTimeData.length > 0,
    hasTimeOfDayData: Object.values(durationByTimeOfDay).some(value => value > 0)
  };
}
