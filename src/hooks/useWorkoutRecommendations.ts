
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface WorkoutRecommendation {
  trainingType: string;
  confidence: number;
  duration: number;  // Added this property
  tags: string[];    // Added this property
  suggestedDuration: number;
  suggestedExercises: string[];
  bestTimeOfDay: string;
  reasoning: string[];
}

export function useWorkoutRecommendations() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['workout-recommendations', user?.id],
    queryFn: async (): Promise<WorkoutRecommendation> => {
      if (!user) throw new Error("User not authenticated");
      
      // Fetch user's workout history
      const { data: workouts, error: workoutError } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (workoutError) throw workoutError;
      
      // Fetch exercise progression data
      const { data: progression, error: progressionError } = await supabase
        .from('exercise_progression')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (progressionError) throw progressionError;
      
      // Analyze workout patterns
      const timeDistribution = {
        morning: 0,
        afternoon: 0,
        evening: 0,
        night: 0
      };
      
      const typeCount: Record<string, number> = {};
      let totalDuration = 0;
      
      workouts?.forEach(workout => {
        const hour = new Date(workout.start_time).getHours();
        const timeOfDay = 
          hour >= 5 && hour < 11 ? 'morning' :
          hour >= 11 && hour < 17 ? 'afternoon' :
          hour >= 17 && hour < 22 ? 'evening' : 'night';
          
        timeDistribution[timeOfDay]++;
        typeCount[workout.training_type] = (typeCount[workout.training_type] || 0) + 1;
        totalDuration += workout.duration;
      });
      
      // Determine best time of day
      const bestTimeOfDay = Object.entries(timeDistribution)
        .reduce((a, b) => a[1] > b[1] ? a : b)[0];
      
      // Determine most effective training type
      const preferredType = Object.entries(typeCount)
        .sort((a, b) => b[1] - a[1])[0]?.[0] || 'strength';
      
      // Calculate average duration
      const avgDuration = workouts?.length 
        ? Math.round(totalDuration / workouts.length / 5) * 5 
        : 45;
      
      // Get recommended exercises based on progression
      const suggestedExercises = progression
        ?.filter(p => p.performance_rating >= 4)
        ?.map(p => p.exercise_name)
        ?.slice(0, 5) || [];
      
      // Calculate confidence based on data points
      const confidence = Math.min(
        workouts?.length ? (workouts.length / 10) * 0.1 : 0.5, 
        1.0
      );
      
      // Generate reasoning
      const reasoning = [
        `You've had the most success with ${preferredType} training`,
        `Your workouts are most consistent during the ${bestTimeOfDay}`,
        `Your optimal workout duration is around ${avgDuration} minutes`,
      ];
      
      if (progression?.length) {
        reasoning.push("Based on your exercise progression data");
      }
      
      // Generate recommended tags based on progression data
      const recommendedTags = progression
        ?.map(p => {
          // Here we would normally extract tags from the exercise
          // For now, let's just return some dummy tags
          return ['strength', 'cardio', 'core', 'upper-body', 'lower-body'];
        })
        ?.flat()
        ?.filter((tag, index, self) => self.indexOf(tag) === index)
        ?.slice(0, 3) || [];
      
      return {
        trainingType: preferredType,
        confidence,
        duration: avgDuration,  // Use avgDuration for both fields for now
        suggestedDuration: avgDuration,
        tags: recommendedTags,  // Add recommended tags
        suggestedExercises,
        bestTimeOfDay,
        reasoning
      };
    },
    enabled: !!user
  });
}
