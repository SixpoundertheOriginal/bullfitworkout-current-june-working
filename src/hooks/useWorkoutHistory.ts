import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Exercise } from "@/types/exercise";
import { useExercises } from "./useExercises";

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

// Add a new interface that extends WorkoutSession to include exercises
interface WorkoutSessionWithExercises extends WorkoutSession {
  exerciseSets?: ExerciseSet[];
}

export interface WorkoutHistoryFilters {
  startDate?: string | null;
  endDate?: string | null;
  trainingTypes?: string[];
  limit?: number;
  offset?: number;
}

export function useWorkoutHistory(
  filters: WorkoutHistoryFilters = {}
) {
  const { user } = useAuth();
  const { exercises: allExercises } = useExercises();
  const { 
    limit = 10, 
    offset = 0, 
    startDate = null, 
    endDate = null, 
    trainingTypes = [] 
  } = filters;
  
  const fetchWorkoutHistory = async (): Promise<{ 
    workouts: WorkoutSessionWithExercises[], 
    exerciseCounts: Record<string, { exercises: number, sets: number }>,
    totalCount: number
  }> => {
    if (!user) {
      return { workouts: [], exerciseCounts: {}, totalCount: 0 };
    }
    
    try {
      console.log("Fetching workout history with params:", filters);
      
      // Build query for workouts with filters
      let query = supabase
        .from('workout_sessions')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);
      
      // Apply date filters if provided
      if (startDate) {
        query = query.gte('start_time', `${startDate}T00:00:00`);
      }
      
      if (endDate) {
        query = query.lte('start_time', `${endDate}T23:59:59`);
      }
      
      // Apply training type filter if provided
      if (trainingTypes && trainingTypes.length > 0) {
        query = query.in('training_type', trainingTypes);
      }
      
      // First get the total count for pagination
      const { count } = await query;
      const totalCount = count || 0;
      
      // Then get the paginated data
      query = query
        .order('start_time', { ascending: false })
        .range(offset, offset + limit - 1);
        
      const { data: workouts, error: workoutsError } = await query;
      
      if (workoutsError) {
        console.error("Error fetching workouts:", workoutsError);
        throw workoutsError;
      }
      
      console.log(`Fetched ${workouts?.length || 0} workouts`, workouts);
      
      if (!workouts || workouts.length === 0) {
        return { workouts: [], exerciseCounts: {}, totalCount };
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
      
      // Map exercise sets to each workout
      const workoutsWithExercises: WorkoutSessionWithExercises[] = workouts.map(workout => {
        const workoutSets = exerciseSets?.filter(set => set.workout_id === workout.id) || [];
        return {
          ...workout,
          exerciseSets: workoutSets
        };
      });
      
      return { 
        workouts: workoutsWithExercises,
        exerciseCounts,
        totalCount
      };
    } catch (error) {
      console.error('Error fetching workout history:', error);
      return { workouts: [], exerciseCounts: {}, totalCount: 0 };
    }
  };
  
  const query = useQuery({
    queryKey: ['workout-history', user?.id, limit, offset, startDate, endDate, trainingTypes],
    queryFn: fetchWorkoutHistory,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  return {
    ...query,
    refetch: query.refetch // Expose refetch method
  };
}

export function useWorkoutDates(year: number, month: number) {
  const { user } = useAuth();
  
  const fetchWorkoutDates = async (): Promise<Record<string, number>> => {
    if (!user) {
      return {};
    }
    
    try {
      // Create date objects for the first and last day of the month
      // Note: JavaScript months are 0-indexed (0 = January, 11 = December)
      const firstDay = new Date(Date.UTC(year, month, 1));
      const lastDay = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59));
      
      console.log("Fetching workout dates for calendar:", {
        year,
        month,
        firstDay: firstDay.toISOString(),
        lastDay: lastDay.toISOString(),
        userId: user.id
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
        // Extract date part in YYYY-MM-DD format
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
