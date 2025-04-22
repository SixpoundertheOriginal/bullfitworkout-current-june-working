
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

export interface ExperienceData {
  totalXp: number;
  level: number;
  currentLevelXp: number;
  nextLevelThreshold: number;
  progress: number;
  trainingTypeLevels: {
    [key: string]: {
      level: number;
      xp: number;
      progress: number;
    }
  };
}

// This function calculates the XP required for each level
// The formula can be adjusted based on preferred progression curve
export const calculateLevelRequirement = (level: number): number => {
  // Simple exponential curve: 100 * (level^1.5)
  return Math.round(100 * Math.pow(level, 1.5));
};

// Calculate level from total XP
export const calculateLevelFromXP = (totalXp: number): { level: number; progress: number } => {
  let level = 0;
  let remainingXp = totalXp;
  let levelThreshold = calculateLevelRequirement(1);
  
  // Find the highest level that can be achieved with this XP
  while (remainingXp >= levelThreshold) {
    level++;
    remainingXp -= levelThreshold;
    levelThreshold = calculateLevelRequirement(level + 1);
  }
  
  // Calculate progress to next level as percentage
  const progress = remainingXp / levelThreshold * 100;
  
  return { 
    level: Math.max(1, level), // Minimum level is 1
    progress
  };
};

export function useExperiencePoints() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch experience data
  const { data, isLoading, error } = useQuery({
    queryKey: ['experience', user?.id],
    queryFn: async (): Promise<ExperienceData> => {
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      // Get user experience data from profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('training_experience')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        console.error("Error fetching user experience:", profileError);
        // Return default experience data
        return {
          totalXp: 0,
          level: 1,
          currentLevelXp: 0,
          nextLevelThreshold: calculateLevelRequirement(1),
          progress: 0,
          trainingTypeLevels: {
            "Strength": { level: 1, xp: 0, progress: 0 },
            "Cardio": { level: 1, xp: 0, progress: 0 },
            "Yoga": { level: 1, xp: 0, progress: 0 },
            "Calisthenics": { level: 1, xp: 0, progress: 0 }
          }
        };
      }
      
      // If no training experience data exists, return defaults
      if (!profileData?.training_experience) {
        // Create default training experience data
        const defaultData: ExperienceData = {
          totalXp: 0,
          level: 1,
          currentLevelXp: 0,
          nextLevelThreshold: calculateLevelRequirement(1),
          progress: 0,
          trainingTypeLevels: {
            "Strength": { level: 1, xp: 0, progress: 0 },
            "Cardio": { level: 1, xp: 0, progress: 0 },
            "Yoga": { level: 1, xp: 0, progress: 0 },
            "Calisthenics": { level: 1, xp: 0, progress: 0 }
          }
        };
        
        return defaultData;
      }
      
      // Calculate level and progress based on total XP
      const { level, progress } = calculateLevelFromXP(profileData.training_experience.totalXp || 0);
      
      // Calculate current level XP and next threshold
      const currentLevelXp = profileData.training_experience.totalXp - 
        Array.from({ length: level - 1 }).reduce((sum, _, i) => 
          sum + calculateLevelRequirement(i + 1), 0);
      
      const nextLevelThreshold = calculateLevelRequirement(level + 1);
      
      // Process training type levels
      const trainingTypeLevels = profileData.training_experience.trainingTypeLevels || {
        "Strength": { level: 1, xp: 0, progress: 0 },
        "Cardio": { level: 1, xp: 0, progress: 0 },
        "Yoga": { level: 1, xp: 0, progress: 0 },
        "Calisthenics": { level: 1, xp: 0, progress: 0 }
      };
      
      // Calculate progress for each training type
      Object.keys(trainingTypeLevels).forEach(type => {
        const typeData = trainingTypeLevels[type];
        const { level, progress } = calculateLevelFromXP(typeData.xp || 0);
        trainingTypeLevels[type] = {
          ...typeData,
          level,
          progress
        };
      });
      
      return {
        totalXp: profileData.training_experience.totalXp || 0,
        level,
        currentLevelXp,
        nextLevelThreshold,
        progress,
        trainingTypeLevels
      };
    },
    enabled: !!user
  });

  // Mutation to add experience points
  const addExperienceMutation = useMutation({
    mutationFn: async ({ 
      xp, 
      trainingType 
    }: { 
      xp: number; 
      trainingType?: string;
    }) => {
      if (!user) throw new Error("User not authenticated");

      // Get current experience data
      const { data: currentData, error: fetchError } = await supabase
        .from('user_profiles')
        .select('training_experience')
        .eq('id', user.id)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Initialize or use existing experience data
      const currentExp = currentData?.training_experience || {
        totalXp: 0,
        trainingTypeLevels: {
          "Strength": { xp: 0 },
          "Cardio": { xp: 0 },
          "Yoga": { xp: 0 },
          "Calisthenics": { xp: 0 }
        }
      };
      
      // Update total XP
      const newTotalXp = (currentExp.totalXp || 0) + xp;
      
      // Update training type XP if specified
      if (trainingType && currentExp.trainingTypeLevels?.[trainingType]) {
        currentExp.trainingTypeLevels[trainingType].xp = 
          (currentExp.trainingTypeLevels[trainingType].xp || 0) + xp;
      }
      
      // Update experience data in database
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          training_experience: {
            ...currentExp,
            totalXp: newTotalXp,
          }
        })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      // Log experience gain
      const { error: logError } = await supabase
        .from('experience_logs')
        .insert({
          user_id: user.id,
          amount: xp,
          training_type: trainingType || null,
          source: 'workout_completion',
          metadata: {
            timestamp: new Date().toISOString()
          }
        });
        
      if (logError) console.error("Error logging experience gain:", logError);
      
      return {
        addedXp: xp,
        newTotalXp,
        trainingType
      };
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['experience', user?.id] });
    }
  });

  return {
    experienceData: data,
    isLoading,
    error,
    addExperience: addExperienceMutation.mutate,
    addExperienceAsync: addExperienceMutation.mutateAsync,
    isAddingExperience: addExperienceMutation.isPending
  };
}
