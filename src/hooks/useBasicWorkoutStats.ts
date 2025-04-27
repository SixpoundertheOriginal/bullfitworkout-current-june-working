
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { 
  startOfWeek, 
  endOfWeek, 
  subWeeks, 
  subDays, 
  startOfDay, 
  format 
} from "date-fns";
import { DateRange } from 'react-day-picker';

export interface BasicWorkoutStats {
  totalWorkouts: number;
  totalDuration: number;
  avgDuration: number;
  lastWorkoutDate: string | null;
  streakDays: number;
  weeklyWorkouts: number;
  weeklyVolume: number;
  dailyWorkouts: Record<string, number>;
}

export const useBasicWorkoutStats = (dateRange?: DateRange) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["basic-workout-stats", user?.id, dateRange?.from?.toISOString(), dateRange?.to?.toISOString()],
    queryFn: async (): Promise<BasicWorkoutStats> => {
      if (!user) throw new Error("User not authenticated");
      
      const now = new Date();
      let periodStart: Date;
      let periodEnd: Date = now;
      
      // Determine time range
      if (dateRange?.from && dateRange?.to) {
        periodStart = dateRange.from;
        periodEnd = dateRange.to;
      } else {
        // Default to current week (Monday to Sunday)
        periodStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday as start of week
      }
      
      console.log("Fetching workouts for period:", 
        format(periodStart, "yyyy-MM-dd"), "to", 
        format(periodEnd, "yyyy-MM-dd"));
      
      // Fetch all workouts for basic stats
      const { data: allWorkouts, error: allWorkoutsError } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });
        
      if (allWorkoutsError) throw allWorkoutsError;
      
      // Fetch workouts for the specified period
      let query = supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
      
      // Apply date range filter if provided
      if (dateRange?.from) {
        query = query.gte('start_time', dateRange.from.toISOString())
      }
      if (dateRange?.to) {
        query = query.lte('start_time', dateRange.to.toISOString())
      }
      
      const { data: periodWorkouts, error: periodError } = await query
        
      if (periodError) throw periodError;
      
      // Fetch workout sets for volume calculation
      let setsQuery = supabase
        .from('exercise_sets')
        .select('*, workout_sessions!inner(*)')
        .eq('workout_sessions.user_id', user.id)
        
      if (dateRange?.from) {
        setsQuery = setsQuery.gte('workout_sessions.start_time', periodStart.toISOString())
      }
      if (dateRange?.to) {
        setsQuery = setsQuery.lte('workout_sessions.start_time', periodEnd.toISOString())
      }
      
      const { data: exerciseSets, error: setsError } = await setsQuery;
        
      if (setsError) throw setsError;
      
      // Calculate total and average duration
      const totalWorkouts = allWorkouts?.length || 0;
      const totalDuration = allWorkouts?.reduce((sum, w) => sum + (w.duration || 0), 0) || 0;
      const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;
      const lastWorkoutDate = allWorkouts?.[0]?.start_time || null;
      
      // Calculate weekly volume (weight * reps)
      const weeklyVolume = exerciseSets?.reduce((sum, set) => {
        return sum + (set.weight * set.reps);
      }, 0) || 0;
      
      // Calculate daily workout counts with a consistent day format
      const dailyWorkouts: Record<string, number> = {};
      periodWorkouts?.forEach(workout => {
        const day = new Date(workout.start_time).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        dailyWorkouts[day] = (dailyWorkouts[day] || 0) + 1;
      });
      
      // Calculate streak
      let streakDays = 0;
      if (allWorkouts && allWorkouts.length > 0) {
        const workoutDates = [...new Set(allWorkouts.map(w => 
          new Date(w.start_time).toISOString().split('T')[0]
        ))].sort().reverse();
        
        const todayStr = new Date().toISOString().split('T')[0];
        if (workoutDates[0] === todayStr) {
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
      
      console.log("Workout stats calculated:", {
        totalWorkouts,
        periodWorkouts: periodWorkouts?.length || 0,
        dailyWorkouts,
        weeklyVolume
      });
      
      return {
        totalWorkouts,
        totalDuration,
        avgDuration,
        lastWorkoutDate,
        streakDays,
        weeklyWorkouts: periodWorkouts?.length || 0,
        weeklyVolume,
        dailyWorkouts
      };
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000 // 2 minutes
  });
};
