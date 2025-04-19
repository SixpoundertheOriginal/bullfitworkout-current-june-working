
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useWorkoutStats } from "./useWorkoutStats";

interface WorkoutRecommendation {
  trainingType: string;
  duration: number;
  tags: string[];
  confidence: number;
}

// Define the structure of the training preferences
interface TrainingPreferences {
  preferred_time: string | null;
  preferred_duration: number | null;
  preferred_types: string[] | null;
}

export function useWorkoutRecommendations() {
  const { user } = useAuth();
  const { stats } = useWorkoutStats();
  
  return useQuery({
    queryKey: ['workout-recommendations', user?.id],
    queryFn: async (): Promise<WorkoutRecommendation> => {
      if (!user) throw new Error("User not authenticated");
      
      // Get user's profile with training preferences
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('training_preferences')
        .eq('id', user.id)
        .single();
        
      const currentHour = new Date().getHours();
      const timeOfDay = 
        currentHour >= 5 && currentHour < 11 ? 'morning' :
        currentHour >= 11 && currentHour < 17 ? 'afternoon' :
        currentHour >= 17 && currentHour < 22 ? 'evening' : 'night';
        
      // Start with recommended type from stats if available
      const recommendation: WorkoutRecommendation = {
        trainingType: stats.recommendedType || "Strength",
        duration: stats.recommendedDuration || 30,
        tags: stats.recommendedTags || [],
        confidence: 0.5
      };

      // Adjust based on user preferences if available
      if (profile?.training_preferences) {
        try {
          // Safely convert to TrainingPreferences with a proper type check
          const prefsData = profile.training_preferences as Record<string, any>;
          
          // Check if the data actually matches our expected structure
          const prefs: TrainingPreferences = {
            preferred_time: typeof prefsData.preferred_time === 'string' ? prefsData.preferred_time : null,
            preferred_duration: typeof prefsData.preferred_duration === 'number' ? prefsData.preferred_duration : null,
            preferred_types: Array.isArray(prefsData.preferred_types) ? prefsData.preferred_types : null
          };
          
          if (prefs.preferred_time === timeOfDay && prefs.preferred_duration) {
            recommendation.duration = prefs.preferred_duration;
            recommendation.confidence += 0.2;
          }
          
          if (prefs.preferred_types?.length > 0) {
            // Check if current recommendation matches any preferred types
            if (prefs.preferred_types.includes(recommendation.trainingType)) {
              recommendation.confidence += 0.3;
            }
          }
        } catch (error) {
          console.error("Error parsing training preferences:", error);
        }
      }

      return recommendation;
    },
    enabled: !!user && !!stats
  });
}
