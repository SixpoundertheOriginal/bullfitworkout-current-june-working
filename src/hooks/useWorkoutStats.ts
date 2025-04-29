
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useWeightUnit } from '@/context/WeightUnitContext';
import { calculateMuscleFocus } from "@/utils/exerciseUtils";

// Enhanced workout type to include exercises property
interface WorkoutWithExercises {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  duration: number;
  created_at: string;
  updated_at: string;
  is_historical?: boolean;
  logged_at?: string;
  metadata?: any;
  notes?: string;
  name: string;
  training_type: string;
  exercises?: any[];
}

export interface WorkoutStats {
  totalWorkouts: number;
  totalDuration: number;
  totalExercises: number;
  totalSets: number;
  completedSets: number;
  averageWorkoutLength: number;
  avgDuration: number;
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
    strengthTrend: 'increasing' | 'decreasing' | 'stable' | 'fluctuating';
  };
  exerciseVolumeHistory?: ExerciseVolumeHistory[];
  muscleFocus: Record<string, number>;
  recommendedType?: string;
  recommendedDuration?: number;
  recommendedTags?: string[];
  streakDays: number;
  lastWorkoutDate: string | null;
  tags?: {name: string; count: number}[];
  workouts: any[];
}

export interface WorkoutTypeStats {
  type: string;
  count: number;
  totalDuration: number;
  averageDuration: number;
  percentage: number;
  timeOfDay?: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
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

export const useWorkoutStats = (days?: number) => {
  const { user } = useAuth();
  const { weightUnit } = useWeightUnit();

  const {
    data: stats,
    isLoading: loading,
    error,
    refetch
  } = useQuery({
    queryKey: ["workout-stats", user?.id, weightUnit, days],
    queryFn: async (): Promise<WorkoutStats> => {
      if (!user) {
        throw new Error("User is not authenticated");
      }

      // Fetch all workouts with their exercise sets
      const { data: workoutsData, error: workoutsError } = await supabase
        .from("workout_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("start_time", { ascending: false });
        
      if (workoutsError) {
        throw workoutsError;
      }
      
      // Expand workout data with exercise sets
      const workouts: WorkoutWithExercises[] = [...(workoutsData || [])];
      
      // Fetch all exercise sets for these workouts
      let allExerciseSets: any[] = [];
      if (workouts.length > 0) {
        const workoutIds = workouts.map(w => w.id);
        
        const { data: exerciseSetsData, error: setsError } = await supabase
          .from("exercise_sets")
          .select("*")
          .in("workout_id", workoutIds);
          
        if (setsError) {
          throw setsError;
        }
        
        // Store all exercise sets
        allExerciseSets = exerciseSetsData || [];
        
        // Group exercise sets by workout
        const exerciseSetsByWorkout = allExerciseSets.reduce((acc: Record<string, any[]>, set) => {
          if (!acc[set.workout_id]) {
            acc[set.workout_id] = [];
          }
          acc[set.workout_id].push(set);
          return acc;
        }, {});
        
        // Attach exercise sets to corresponding workouts
        workouts.forEach(workout => {
          workout.exercises = exerciseSetsByWorkout[workout.id] || [];
        });
      }

      const { data: progressionData, error: progressionError } = await supabase
        .from("exercise_progression")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
        
      if (progressionError) {
        console.error("Error fetching progression data:", progressionError);
        // Continue with other data, don't throw
      }

      const groupedExercises: Record<string, any[]> = {};
      allExerciseSets.forEach(set => {
        if (!groupedExercises[set.exercise_name]) {
          groupedExercises[set.exercise_name] = [];
        }
        groupedExercises[set.exercise_name].push(set);
      });
      
      const muscleFocus = calculateMuscleFocus(groupedExercises);

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

      allExerciseSets.forEach(set => {
        if (set.completed) {
          completedSets++;
          totalVolume += set.weight * set.reps;
        }
      });

      const avgWorkoutLength = workouts?.length ? totalDuration / workouts.length : 0;
      const completionRate = allExerciseSets?.length ? (completedSets / allExerciseSets.length) * 100 : 0;

      const preferredDay = Object.keys(daysFrequency).reduce((a, b) => daysFrequency[a] > daysFrequency[b] ? a : b, '');
      const preferredTime = Object.keys(durationByTimeOfDay).reduce((a, b) => durationByTimeOfDay[a] > durationByTimeOfDay[b] ? a : b, '');

      let volumeChangePercentage = 0;
      if (progressionData && progressionData.length > 1) {
        const firstVolume = progressionData[0].performance_rating || 0;
        const lastVolume = progressionData[progressionData.length - 1].performance_rating || 0;
        volumeChangePercentage = firstVolume ? ((lastVolume - firstVolume) / firstVolume) * 100 : 0;
      }

      const weeks: Record<string, boolean> = {};
      workouts?.forEach(workout => {
        const weekStart = new Date(workout.start_time);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekKey = weekStart.toLocaleDateString();
        weeks[weekKey] = true;
      });
      const consistentWeeks = Object.keys(weeks).length;
      const totalWeeks = 52;
      const consistencyScore = (consistentWeeks / totalWeeks) * 100;

      let weightProgressionRate = 0;
      if (progressionData && progressionData.length > 1) {
        let totalWeightIncrease = 0;
        let validProgressions = 0;
        
        for (let i = 1; i < progressionData.length; i++) {
          const prevMetadata = progressionData[i-1]?.metadata;
          const currMetadata = progressionData[i]?.metadata;
          
          const prevWeight = prevMetadata && typeof prevMetadata === 'object' ? 
            Number(prevMetadata && 'weight' in prevMetadata ? prevMetadata.weight : 0) : 0;
          const currWeight = currMetadata && typeof currMetadata === 'object' ? 
            Number(currMetadata && 'weight' in currMetadata ? currMetadata.weight : 0) : 0;
          
          if (prevWeight > 0 && currWeight > 0) {
            totalWeightIncrease += (currWeight - prevWeight);
            validProgressions++;
          }
        }
        
        weightProgressionRate = validProgressions > 0 ? totalWeightIncrease / validProgressions : 0;
      }

      const volumeHistoryData: ExerciseVolumeHistory[] = [];
      const exerciseNames = [...new Set(allExerciseSets.map(set => set.exercise_name))];

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
            exercise_name: exerciseName as string,
            trend: trend,
            percentChange: percentChange,
            volume_history: volumes
          });
        }
      });
      
      let strengthTrend: 'increasing' | 'decreasing' | 'stable' | 'fluctuating' = 'stable';
      if (volumeChangePercentage > 5) strengthTrend = 'increasing';
      else if (volumeChangePercentage < -5) strengthTrend = 'decreasing';
      else if (volumeHistoryData.filter(d => d.trend === 'fluctuating').length > volumeHistoryData.length / 3) {
        strengthTrend = 'fluctuating';
      }

      const exerciseStats: Record<string, { sets: number, volume: number, weightSum: number }> = {};
      allExerciseSets.forEach(set => {
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
        
      const workoutTypesMap: Record<string, {count: number, totalDuration: number}> = {};
      workouts?.forEach(workout => {
        if (!workoutTypesMap[workout.training_type]) {
          workoutTypesMap[workout.training_type] = { count: 0, totalDuration: 0 };
        }
        workoutTypesMap[workout.training_type].count++;
        workoutTypesMap[workout.training_type].totalDuration += workout.duration;
      });
      
      const workoutTypesData: WorkoutTypeStats[] = Object.entries(workoutTypesMap).map(([type, data]) => {
        return {
          type,
          count: data.count,
          totalDuration: data.totalDuration,
          averageDuration: data.count > 0 ? data.totalDuration / data.count : 0,
          percentage: workouts?.length ? (data.count / workouts.length) * 100 : 0
        };
      });
      
      let streakDays = 0;
      if (workouts && workouts.length > 0) {
        const workoutDates = [...new Set(workouts.map(w => 
          new Date(w.start_time).toISOString().split('T')[0]
        ))].sort().reverse();
        
        const today = new Date().toISOString().split('T')[0];
        if (workoutDates[0] === today) {
          streakDays = 1;
          for (let i = 1; i < workoutDates.length; i++) {
            const currentDate = new Date(workoutDates[i-1]);
            currentDate.setDate(currentDate.getDate() - 1);
            const expectedPrevious = currentDate.toISOString().split('T')[0];
            
            if (workoutDates[i] === expectedPrevious) {
              streakDays++;
            } else {
              break;
            }
          }
        }
      }
      
      const mockTags = [
        { name: "Upper Body", count: 12 },
        { name: "Lower Body", count: 8 },
        { name: "Cardio", count: 6 },
        { name: "Morning", count: 15 },
        { name: "Evening", count: 9 }
      ];
      
      return {
        totalWorkouts: workouts?.length || 0,
        totalDuration: totalDuration,
        totalExercises: topExercisesData.length,
        totalSets: completedSets,
        completedSets: completedSets,
        averageWorkoutLength: avgWorkoutLength,
        avgDuration: avgWorkoutLength,
        completionRate: completionRate,
        timePatterns: {
          daysFrequency: daysFrequency,
          preferredDay: preferredDay,
          preferredTime: preferredTime,
          durationByTimeOfDay: durationByTimeOfDay
        },
        workoutTypes: workoutTypesData,
        topExercises: topExercisesData,
        progressMetrics: {
          volumeChangePercentage: volumeChangePercentage,
          consistencyScore: consistencyScore,
          weightProgressionRate: weightProgressionRate,
          strengthTrend: strengthTrend
        },
        exerciseVolumeHistory: volumeHistoryData,
        muscleFocus: muscleFocus,
        recommendedType: determineRecommendedWorkout(muscleFocus),
        recommendedDuration: avgWorkoutLength,
        recommendedTags: determineRecommendedTags(muscleFocus),
        streakDays: streakDays,
        lastWorkoutDate: workouts?.[0]?.start_time || null,
        tags: mockTags,
        workouts: workouts || []
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { stats: stats || defaultStats(), loading, error, refetch };
};

function defaultStats(): WorkoutStats {
  return {
    totalWorkouts: 0,
    totalDuration: 0,
    totalExercises: 0,
    totalSets: 0,
    completedSets: 0,
    averageWorkoutLength: 0,
    avgDuration: 0,
    completionRate: 0,
    timePatterns: {
      daysFrequency: {},
      preferredDay: "",
      preferredTime: "",
      durationByTimeOfDay: {
        morning: 0,
        afternoon: 0,
        evening: 0,
        night: 0
      }
    },
    workoutTypes: [],
    topExercises: [],
    progressMetrics: {
      volumeChangePercentage: 0,
      consistencyScore: 0,
      weightProgressionRate: 0,
      strengthTrend: 'stable'
    },
    muscleFocus: {},
    recommendedTags: [],
    streakDays: 0,
    lastWorkoutDate: null,
    workouts: []
  };
}

function determineRecommendedWorkout(muscleFocus: Record<string, number>): string {
  const entries = Object.entries(muscleFocus);
  
  if (entries.length === 0) return "Full Body";
  
  entries.sort((a, b) => a[1] - b[1]);
  const leastWorked = entries[0][0];
  
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
  
  entries.sort((a, b) => a[1] - b[1]);
  
  const leastWorked = entries.slice(0, 2).map(e => e[0]);
  leastWorked.forEach(muscle => {
    tags.push(`${muscle.charAt(0).toUpperCase() + muscle.slice(1)} focus`);
  });
  
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
