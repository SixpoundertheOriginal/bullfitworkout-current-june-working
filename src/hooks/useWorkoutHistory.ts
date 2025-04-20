import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface WorkoutSession {
  id: string;
  name: string;
  training_type: string;
  start_time: string;
  end_time: string;
  duration: number;
  notes: string | null;
  created_at: string;
}

interface ExerciseSet {
  id: string;
  workout_id: string;
  exercise_name: string;
  weight: number;
  reps: number;
  set_number: number;
  completed: boolean;
}

export function useWorkoutHistory(limit: number = 10, dateFilter: string | null = null) {
  const { user } = useAuth();
  
  const fetchWorkoutHistory = async (): Promise<{ workouts: WorkoutSession[], exerciseCounts: Record<string, { exercises: number, sets: number }> }> => {
    if (!user) {
      return { workouts: [], exerciseCounts: {} };
    }
    
    try {
      console.log("Fetching workout history with params:", { limit, dateFilter });
      
      // Build query for workouts
      let query = supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });
      
      // Apply date filter if provided
      if (dateFilter) {
        const dateStr = dateFilter.split('T')[0]; // Ensure we just have the date part
        console.log("Filtering by date:", dateStr);
        
        // Find workouts on this specific date
        query = query
          .gte('start_time', `${dateStr}T00:00:00`)
          .lt('start_time', `${dateStr}T23:59:59`);
      } else {
        // Apply limit only when not filtering by date
        query = query.limit(limit);
      }
        
      const { data: workouts, error: workoutsError } = await query;
      
      if (workoutsError) {
        console.error("Error fetching workouts:", workoutsError);
        throw workoutsError;
      }
      
      console.log(`Fetched ${workouts?.length || 0} workouts`, workouts);
      
      if (!workouts || workouts.length === 0) {
        return { workouts: [], exerciseCounts: {} };
      }
      
      // Get the workout IDs
      const workoutIds = workouts.map(workout => workout.id);
      
      // Fetch the exercise sets for these workouts
      const { data: exerciseSets, error: setsError } = await supabase
        .from('exercise_sets')
        .select('*')
        .in('workout_id', workoutIds);
        
      if (setsError) {
        console.error("Error fetching exercise sets:", setsError);
        throw setsError;
      }
      
      console.log(`Fetched ${exerciseSets?.length || 0} exercise sets`);
      
      // Calculate exercise and set counts for each workout
      const exerciseCounts: Record<string, { exercises: number, sets: number }> = {};
      
      workoutIds.forEach(id => {
        const workoutSets = exerciseSets?.filter(set => set.workout_id === id) || [];
        const uniqueExercises = [...new Set(workoutSets.map(set => set.exercise_name))];
        
        exerciseCounts[id] = {
          exercises: uniqueExercises.length,
          sets: workoutSets.length
        };
      });
      
      return { 
        workouts: workouts as WorkoutSession[],
        exerciseCounts
      };
    } catch (error) {
      console.error('Error fetching workout history:', error);
      return { workouts: [], exerciseCounts: {} };
    }
  };
  
  return useQuery({
    queryKey: ['workout-history', user?.id, limit, dateFilter],
    queryFn: fetchWorkoutHistory,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useWorkoutDates(year: number, month: number) {
  const { user } = useAuth();
  
  const fetchWorkoutDates = async (): Promise<Record<string, number>> => {
    if (!user) {
      return {};
    }
    
    try {
      // Create date objects for the first and last day of the month
      // Making sure to use UTC dates to avoid timezone issues
      const firstDay = new Date(Date.UTC(year, month, 1));
      const lastDay = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59));
      
      console.log("Fetching workout dates for calendar:", {
        year,
        month,
        firstDay: firstDay.toISOString(),
        lastDay: lastDay.toISOString()
      });
      
      const { data, error } = await supabase
        .from('workout_sessions')
        .select('id, start_time')
        .eq('user_id', user.id)
        .gte('start_time', firstDay.toISOString())
        .lte('start_time', lastDay.toISOString());
        
      if (error) {
        console.error("Error fetching workout dates:", error);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} workouts for the month:`, data);
      
      // Group workouts by date
      const dateMap: Record<string, number> = {};
      
      data?.forEach(workout => {
        // Convert the date to local timezone and extract the date part
        const dateString = new Date(workout.start_time).toISOString().split('T')[0];
        
        if (!dateMap[dateString]) {
          dateMap[dateString] = 0;
        }
        
        dateMap[dateString]++;
      });
      
      console.log("Workout date counts:", dateMap);
      return dateMap;
    } catch (error) {
      console.error('Error fetching workout dates:', error);
      return {};
    }
  };
  
  return useQuery({
    queryKey: ['workout-dates', user?.id, year, month],
    queryFn: fetchWorkoutDates,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
