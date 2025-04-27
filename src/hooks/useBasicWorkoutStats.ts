
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { startOfWeek, endOfWeek, startOfDay, format } from "date-fns";

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
  
  return useQuery({
    queryKey: ['basic-workout-stats', user?.id],
    queryFn: async (): Promise<BasicWorkoutStats> => {
      if (!user) throw new Error("User not authenticated");
      
      // Get current week range
      const now = new Date();
      const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday as start of week
      const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const today = startOfDay(now);
      
      console.log("Fetching workouts for week:", format(weekStart, "yyyy-MM-dd"), "to", format(weekEnd, "yyyy-MM-dd"));
      
      // Fetch all workouts for aggregate stats
      const { data: allWorkouts, error: allWorkoutsError } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });
        
      if (allWorkoutsError) throw allWorkoutsError;
      
      // Fetch workouts for current week
      const { data: weeklyWorkouts, error: weeklyError } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('start_time', weekStart.toISOString())
        .lte('start_time', weekEnd.toISOString());
        
      if (weeklyError) throw weeklyError;
      
      // Fetch workout sets for volume calculation
      const { data: exerciseSets, error: setsError } = await supabase
        .from('exercise_sets')
        .select('*, workout_sessions!inner(*)')
        .eq('workout_sessions.user_id', user.id)
        .gte('workout_sessions.start_time', weekStart.toISOString())
        .lte('workout_sessions.start_time', weekEnd.toISOString());
        
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
      
      // Calculate daily workout counts
      const dailyWorkouts: Record<string, number> = {};
      weeklyWorkouts?.forEach(workout => {
        const day = new Date(workout.start_time).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        dailyWorkouts[day] = (dailyWorkouts[day] || 0) + 1;
      });
      
      // Calculate streak
      let streakDays = 0;
      if (allWorkouts && allWorkouts.length > 0) {
        const workoutDates = [...new Set(allWorkouts.map(w => 
          new Date(w.start_time).toISOString().split('T')[0]
        ))].sort().reverse();
        
        const todayStr = today.toISOString().split('T')[0];
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
        weeklyWorkouts: weeklyWorkouts?.length || 0,
        dailyWorkouts,
        weeklyVolume
      });
      
      return {
        totalWorkouts,
        totalDuration,
        avgDuration,
        lastWorkoutDate,
        streakDays,
        weeklyWorkouts: weeklyWorkouts?.length || 0,
        weeklyVolume,
        dailyWorkouts
      };
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000 // 2 minutes
  });
}
