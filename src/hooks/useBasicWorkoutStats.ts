
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface BasicWorkoutStats {
  totalWorkouts: number;
  totalDuration: number;
  avgDuration: number;
  lastWorkoutDate: string | null;
  streakDays: number;
}

export function useBasicWorkoutStats() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['basic-workout-stats', user?.id],
    queryFn: async (): Promise<BasicWorkoutStats> => {
      if (!user) throw new Error("User not authenticated");
      
      const { data: workouts, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false });
        
      if (error) throw error;
      
      const totalWorkouts = workouts?.length || 0;
      const totalDuration = workouts?.reduce((sum, w) => sum + (w.duration || 0), 0) || 0;
      const avgDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;
      const lastWorkoutDate = workouts?.[0]?.start_time || null;
      
      // Calculate streak
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
      
      return {
        totalWorkouts,
        totalDuration,
        avgDuration,
        lastWorkoutDate,
        streakDays
      };
    },
    enabled: !!user
  });
}
