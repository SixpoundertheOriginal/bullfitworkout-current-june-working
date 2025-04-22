import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Json } from "@/integrations/supabase/types";

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

// Type definition for the training experience data in the database
interface TrainingExperience {
  totalXp: number;
  trainingTypeLevels: {
    [key: string]: {
      xp: number;
      level?: number;
      progress?: number;
    }
  };
}

// Add extension to user profiles type for our custom fields
interface UserProfileWithExperience {
  id: string;
  training_experience?: TrainingExperience;
  // other fields can remain the same...
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
      
      try {
        // Get user experience data from profile
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.error("Error fetching user experience:", profileError);
          throw profileError;
        }
        
        // Create a default experience object
        const defaultExpData: ExperienceData = {
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
        
        // If no training experience data exists (either the column doesn't exist yet or it's null)
        if (!profileData || !('training_experience' in profileData) || !profileData.training_experience) {
          return defaultExpData;
        }
        
        // Safely access the training experience data using type assertion
        const trainingExperienceData = profileData.training_experience as unknown as TrainingExperience;
        
        // Calculate level and progress based on total XP
        const totalXp = Number(trainingExperienceData.totalXp || 0);
        const { level, progress } = calculateLevelFromXP(totalXp);
        
        // Calculate current level XP and next threshold
        const currentLevelXp = totalXp - 
          Array.from({ length: level - 1 }).reduce((sum, _, i) => 
            sum + calculateLevelRequirement(i + 1), 0);
        
        const nextLevelThreshold = calculateLevelRequirement(level + 1);
        
        // Process training type levels
        const trainingTypeLevels = trainingExperienceData.trainingTypeLevels || {
          "Strength": { xp: 0 },
          "Cardio": { xp: 0 },
          "Yoga": { xp: 0 },
          "Calisthenics": { xp: 0 }
        };
        
        // Calculate progress for each training type
        const processedTrainingTypes: ExperienceData['trainingTypeLevels'] = {};
        
        Object.keys(trainingTypeLevels).forEach(type => {
          const typeData = trainingTypeLevels[type];
          const typeXp = Number(typeData.xp || 0);
          const levelData = calculateLevelFromXP(typeXp);
          
          processedTrainingTypes[type] = {
            xp: typeXp,
            level: levelData.level,
            progress: levelData.progress
          };
        });
        
        return {
          totalXp,
          level,
          currentLevelXp,
          nextLevelThreshold,
          progress,
          trainingTypeLevels: processedTrainingTypes
        };
      } catch (error) {
        console.error("Error in experience query:", error);
        // Return default experience data in case of errors
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

      try {
        // Get current experience data
        const { data: currentData, error: fetchError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (fetchError) throw fetchError;

        // Create default experience data structure if it doesn't exist
        const defaultExp: TrainingExperience = {
          totalXp: 0,
          trainingTypeLevels: {
            "Strength": { xp: 0 },
            "Cardio": { xp: 0 },
            "Yoga": { xp: 0 },
            "Calisthenics": { xp: 0 }
          }
        };
        
        // Get the current experience data or use default
        const currentExp = 
          ('training_experience' in currentData && currentData.training_experience)
          ? (currentData.training_experience as unknown as TrainingExperience)
          : defaultExp;
            
        // Update total XP
        const newTotalXp = Number(currentExp.totalXp || 0) + xp;
        
        // Create a deep copy of the current exp to avoid mutation issues
        const updatedExp = JSON.parse(JSON.stringify(currentExp)) as TrainingExperience;
        updatedExp.totalXp = newTotalXp;
        
        // Update training type XP if specified
        if (trainingType && updatedExp.trainingTypeLevels?.[trainingType]) {
          const currentTypeXp = Number(updatedExp.trainingTypeLevels[trainingType].xp || 0);
          updatedExp.trainingTypeLevels[trainingType].xp = currentTypeXp + xp;
        }
        
        // Update experience data in database by setting the JSONB field
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            // Use as any to bypass TypeScript check until types are updated
            training_experience: updatedExp as any
          })
          .eq('id', user.id);
          
        if (updateError) throw updateError;
        
        // Try to log experience - this might fail if the table doesn't exist yet
        try {
          // Use raw SQL query instead
          const { error: logError } = await supabase.rpc(
            'log_experience_gain', 
            { 
              user_id: user.id,
              xp_amount: xp,
              training_type_value: trainingType || null,
              source_value: 'workout_completion',
              metadata_value: {
                timestamp: new Date().toISOString()
              }
            }
          );
          
          if (logError) {
            console.error("Error logging experience gain:", logError);
          }
        } catch (logError) {
          console.error("Error logging experience gain:", logError);
          // Non-critical error, so we can continue
        }
        
        return {
          addedXp: xp,
          newTotalXp,
          trainingType
        };
      } catch (error) {
        console.error("Error updating experience:", error);
        throw error;
      }
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
