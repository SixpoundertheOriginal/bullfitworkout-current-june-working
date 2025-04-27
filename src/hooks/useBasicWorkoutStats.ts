
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { 
  startOfWeek, 
  endOfWeek, 
  subWeeks, 
  subDays, 
  format,
  isWithinInterval
} from "date-fns";
import { useDateRange } from "@/context/DateRangeContext";

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

export function useBasicWorkoutStats() {
  const { user } = useAuth();
  const { timeRange, dateRange } = useDateRange();
  
  return useQuery({
    queryKey: ['basic-workout-stats', user?.id, timeRange, dateRange.start.toISOString(), dateRange.end.toISOString()],
    queryFn: async (): Promise<BasicWorkoutStats> => {
      if (!user) throw new Error("User not authenticated");
      
      const { start: periodStart, end: periodEnd } = dateRange;
      
      console.log("Fetching workouts for period:", 
        format(periodStart, "yyyy-MM-dd"), "to", 
        format(periodEnd, "yyyy-MM-dd"), 
        `(${timeRange})`);
      
      // Fetch all workouts for basic stats
      const { data: allWorkouts, error: allWorkoutsError } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });
        
      if (allWorkoutsError) throw allWorkoutsError;
      
      // Fetch workouts for the specified period
      const { data: periodWorkouts, error: periodError } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', periodStart.toISOString())
        .lte('start_time', periodEnd.toISOString());
        
      if (periodError) throw periodError;
      
      // Fetch workout sets for volume calculation
      const { data: exerciseSets, error: setsError } = await supabase
        .from('exercise_sets')
        .select('*, workout_sessions!inner(*)')
        .eq('workout_sessions.user_id', user.id)
        .gte('workout_sessions.start_time', periodStart.toISOString())
        .lte('workout_sessions.start_time', periodEnd.toISOString());
        
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
      
      // Calculate daily workout counts within the selected period
      const dailyWorkouts: Record<string, number> = {};
      const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
      
      // Initialize all days with zero
      daysOfWeek.forEach(day => {
        dailyWorkouts[day] = 0;
      });
      
      // Count workouts for each day of the week
      periodWorkouts?.forEach(workout => {
        const date = new Date(workout.start_time);
        const day = daysOfWeek[date.getDay()];
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
}
