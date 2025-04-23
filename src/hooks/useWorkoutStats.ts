import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useWeightUnit } from '@/context/WeightUnitContext';
import { calculateMuscleFocus } from "@/utils/exerciseUtils";

export interface WorkoutStats {
  totalWorkouts: number;
  totalDuration: number;
  completedSets: number;
  averageWorkoutLength: number;
  completionRate: number;
  timePatterns: {
    daysFrequency: Record<string, number>;
    preferredDay: string;
    preferredTime: string;
    durationByTimeOfDay: Record<string, number>;
  };
  workoutTypes: WorkoutTypeStats[];
  topExercises: TopExerciseStats[];
  progressMetrics: {
    volumeChangePercentage: number;
    consistencyScore: number;
    weightProgressionRate: number;
  };
  exerciseVolumeHistory?: ExerciseVolumeHistory[];
  muscleFocus: Record<string, number>;
  recommendedType?: string;
  recommendedDuration?: number;
  recommendedTags?: string[];
}

export interface WorkoutTypeStats {
  type: string;
  count: number;
  totalDuration: number;
  averageDuration: number;
}

export interface TopExerciseStats {
  exerciseName: string;
  totalSets: number;
  totalVolume: number;
  averageWeight: number;
  trend?: 'increasing' | 'decreasing' | 'stable' | 'fluctuating';
  percentChange?: number;
}

export interface ExerciseVolumeHistory {
  exercise_name: string;
  trend: 'increasing' | 'decreasing' | 'stable' | 'fluctuating';
  percentChange: number;
  volume_history: number[];
}

export const useWorkoutStats = () => {
  const { user } = useAuth();
  const { weightUnit } = useWeightUnit();

  const {
    data: stats,
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ["workout-stats", user?.id, weightUnit],
    queryFn: async (): Promise<WorkoutStats> => {
      if (!user) {
        throw new Error("User is not authenticated");
      }

      // Fetch workout sessions
      const { data: workouts, error: workoutsError } = await supabase
        .from("workout_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("start_time", { ascending: false });

      if (workoutsError) {
        throw workoutsError;
      }

      // Fetch exercise sets
      const { data: exerciseSets, error: setsError } = await supabase
        .from("exercise_sets")
        .select("*, workout_sessions!inner(*)")
        .eq("workout_sessions.user_id", user.id);

      if (setsError) {
        throw setsError;
      }

      // Additional data fetching for more detailed stats
      const { data: progressionData, error: progressionError } = await supabase
        .from("exercise_progression")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
        
      if (progressionError) {
        console.error("Error fetching progression data:", progressionError);
        // Continue with other data, don't throw
      }

      // Calculate muscle focus from exercise sets
      const groupedExercises: Record<string, any[]> = {};
      exerciseSets?.forEach(set => {
        if (!groupedExercises[set.exercise_name]) {
          groupedExercises[set.exercise_name] = [];
        }
        groupedExercises[set.exercise_name].push(set);
      });
      
      const muscleFocus = calculateMuscleFocus(groupedExercises);

      // Process workout metrics
      let totalDuration = 0;
      let completedSets = 0;
      let totalVolume = 0;
      const daysFrequency: Record<string, number> = {};
      const durationByTimeOfDay: Record<string, number> = {
        morning: 0,
        afternoon: 0,
        evening: 0,
        night: 0
      };

      workouts?.forEach(workout => {
        totalDuration += workout.duration;

        const day = new Date(workout.start_time).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        daysFrequency[day] = (daysFrequency[day] || 0) + 1;

        const hour = new Date(workout.start_time).getHours();
        if (hour >= 5 && hour < 12) {
          durationByTimeOfDay.morning += workout.duration;
        } else if (hour >= 12 && hour < 17) {
          durationByTimeOfDay.afternoon += workout.duration;
        } else if (hour >= 17 && hour < 22) {
          durationByTimeOfDay.evening += workout.duration;
        } else {
          durationByTimeOfDay.night += workout.duration;
        }
      });

      exerciseSets?.forEach(set => {
        if (set.completed) {
          completedSets++;
          totalVolume += set.weight * set.reps;
        }
      });

      const avgWorkoutLength = workouts?.length ? totalDuration / workouts.length : 0;
      const completionRate = exerciseSets?.length ? (completedSets / exerciseSets.length) * 100 : 0;

      const preferredDay = Object.keys(daysFrequency).reduce((a, b) => daysFrequency[a] > daysFrequency[b] ? a : b, '');
      const preferredTime = Object.keys(durationByTimeOfDay).reduce((a, b) => durationByTimeOfDay[a] > durationByTimeOfDay[b] ? a : b, '');

      // Calculate volume change percentage
      let volumeChangePercentage = 0;
      if (progressionData && progressionData.length > 1) {
        const firstVolume = progressionData[0].performance_rating || 0;
        const lastVolume = progressionData[progressionData.length - 1].performance_rating || 0;
        volumeChangePercentage = firstVolume ? ((lastVolume - firstVolume) / firstVolume) * 100 : 0;
      }

      // Calculate consistency score (example: percentage of weeks with at least one workout)
      const weeks: Record<string, boolean> = {};
      workouts?.forEach(workout => {
        const weekStart = new Date(workout.start_time);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Get the first day of the week
        const weekKey = weekStart.toLocaleDateString();
        weeks[weekKey] = true;
      });
      const consistentWeeks = Object.keys(weeks).length;
      const totalWeeks = 52; // Assuming a year-long tracking
      const consistencyScore = (consistentWeeks / totalWeeks) * 100;

      // Calculate weight progression rate (example: average increase in weight per exercise over time)
      let weightProgressionRate = 0;
      if (progressionData && progressionData.length > 1) {
        let totalWeightIncrease = 0;
        for (let i = 1; i < progressionData.length; i++) {
          totalWeightIncrease += (progressionData[i].weight || 0) - (progressionData[i - 1].weight || 0);
        }
        weightProgressionRate = totalWeightIncrease / (progressionData.length - 1);
      }

      // Calculate exercise volume history
      const volumeHistoryData: ExerciseVolumeHistory[] = [];
      const exerciseNames = [...new Set(exerciseSets?.map(set => set.exercise_name))];

      exerciseNames.forEach(exerciseName => {
        const exerciseData = progressionData?.filter(prog => prog.exercise_name === exerciseName) || [];

        if (exerciseData.length > 1) {
          const volumes = exerciseData.map(prog => prog.performance_rating || 0);
          const firstVolume = volumes[0];
          const lastVolume = volumes[volumes.length - 1];
          const percentChange = firstVolume ? ((lastVolume - firstVolume) / firstVolume) * 100 : 0;

          let trend: 'increasing' | 'decreasing' | 'stable' | 'fluctuating' = 'stable';
          if (percentChange > 5) trend = 'increasing';
          else if (percentChange < -5) trend = 'decreasing';
          else {
            // Check for fluctuation
            let fluctuationCount = 0;
            for (let i = 1; i < volumes.length; i++) {
              const prevVolume = volumes[i - 1];
              const currVolume = volumes[i];
              if (Math.abs((currVolume - prevVolume) / prevVolume) > 0.1) {
                fluctuationCount++;
              }
            }
            if (fluctuationCount > volumes.length / 3) trend = 'fluctuating';
          }

          volumeHistoryData.push({
            exercise_name: exerciseName,
            trend: trend,
            percentChange: percentChange,
            volume_history: volumes
          });
        }
      });

      // Calculate top exercises
      const exerciseStats: Record<string, { sets: number, volume: number, weightSum: number }> = {};
      exerciseSets?.forEach(set => {
        if (set.completed) {
          if (!exerciseStats[set.exercise_name]) {
            exerciseStats[set.exercise_name] = { sets: 0, volume: 0, weightSum: 0 };
          }
          exerciseStats[set.exercise_name].sets++;
          exerciseStats[set.exercise_name].volume += set.weight * set.reps;
          exerciseStats[set.exercise_name].weightSum += set.weight;
        }
      });

      const topExercisesData: TopExerciseStats[] = Object.entries(exerciseStats)
        .sort(([, a], [, b]) => b.sets - a.sets)
        .map(([exerciseName, { sets, volume, weightSum }]) => {
          // Find the corresponding entry in volumeHistoryData
          const volumeHistoryEntry = volumeHistoryData.find(entry => entry.exercise_name === exerciseName);
          
          return {
            exerciseName,
            totalSets: sets,
            totalVolume: volume,
            averageWeight: weightSum / sets,
            trend: volumeHistoryEntry?.trend,
            percentChange: volumeHistoryEntry?.percentChange
          };
        });
      
      // Return the processed stats
      return {
        totalWorkouts: workouts?.length || 0,
        totalDuration: totalDuration,
        completedSets: completedSets,
        averageWorkoutLength: avgWorkoutLength,
        completionRate: completionRate,
        timePatterns: {
          daysFrequency: daysFrequency,
          preferredDay: preferredDay,
          preferredTime: preferredTime,
          durationByTimeOfDay: durationByTimeOfDay
        },
        workoutTypes: workoutTypeStats,
        topExercises: topExercisesData,
        progressMetrics: {
          volumeChangePercentage: volumeChangePercentage,
          consistencyScore: consistencyScore,
          weightProgressionRate: weightProgressionRate
        },
        exerciseVolumeHistory: volumeHistoryData,
        muscleFocus: muscleFocus,
        recommendedType: determineRecommendedWorkout(muscleFocus),
        recommendedDuration: avgWorkoutLength,
        recommendedTags: determineRecommendedTags(muscleFocus)
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { stats, loading, error };
};

// Helper function to determine recommended workout based on muscle focus
function determineRecommendedWorkout(muscleFocus: Record<string, number>): string {
  // Find the least worked muscle group
  const entries = Object.entries(muscleFocus);
  
  if (entries.length === 0) return "Full Body";
  
  // Sort by least worked first
  entries.sort((a, b) => a[1] - b[1]);
  const leastWorked = entries[0][0];
  
  // Map muscle groups to workout types
  const muscleToWorkout: Record<string, string> = {
    chest: "Push",
    back: "Pull",
    shoulders: "Push",
    arms: "Arms",
    legs: "Legs",
    core: "Core"
  };
  
  return muscleToWorkout[leastWorked] || "Full Body";
}

function determineRecommendedTags(muscleFocus: Record<string, number>): string[] {
  const tags: string[] = [];
  const entries = Object.entries(muscleFocus);
  
  if (entries.length === 0) return ["Balanced", "Full Body"];
  
  // Sort by least worked first
  entries.sort((a, b) => a[1] - b[1]);
  
  // Add the least worked areas as tags
  const leastWorked = entries.slice(0, 2).map(e => e[0]);
  leastWorked.forEach(muscle => {
    tags.push(`${muscle.charAt(0).toUpperCase() + muscle.slice(1)} focus`);
  });
  
  // Check balance - if all muscle groups are within 20% of each other, consider it balanced
  const vals = entries.map(e => e[1]);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  
  if (max - min < min * 0.2) {
    tags.push("Balanced");
  } else {
    tags.push("Rebalancing");
  }
  
  return tags;
}
