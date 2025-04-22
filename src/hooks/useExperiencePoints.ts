
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

interface TrainingExperience {
  totalXp: number | string;
  trainingTypeLevels: {
    [key: string]: {
      xp: number | string;
      level?: number;
      progress?: number;
    }
  };
}

interface UserProfileWithExperience {
  id: string;
  training_experience?: TrainingExperience;
}

export const calculateLevelRequirement = (level: number): number => {
  return Math.round(100 * Math.pow(level, 1.5));
};

export const calculateLevelFromXP = (totalXp: number): { level: number; progress: number } => {
  let level = 0;
  let remainingXp = totalXp;
  let levelThreshold = calculateLevelRequirement(1);
  
  while (remainingXp >= levelThreshold) {
    level++;
    remainingXp -= levelThreshold;
    levelThreshold = calculateLevelRequirement(level + 1);
  }
  
  const progress = remainingXp / levelThreshold * 100;
  
  return { 
    level: Math.max(1, level),
    progress
  };
};

export function useExperiencePoints() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['experience', user?.id],
    queryFn: async (): Promise<ExperienceData> => {
      if (!user) {
        throw new Error("User not authenticated");
      }
      
      try {
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.error("Error fetching user experience:", profileError);
          throw profileError;
        }
        
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
        
        if (!profileData || !profileData.training_experience) {
          return defaultExpData;
        }
        
        const trainingExperienceData = profileData.training_experience as unknown as TrainingExperience;
        
        const totalXp = typeof trainingExperienceData.totalXp === 'number' 
          ? trainingExperienceData.totalXp 
          : Number(trainingExperienceData.totalXp || 0);
          
        const { level, progress } = calculateLevelFromXP(totalXp);
        
        const previousLevelsXp = Array.from({ length: level - 1 }).reduce((sum, _, i) => 
            sum + calculateLevelRequirement(i + 1), 0);
            
        const currentLevelXp = totalXp - previousLevelsXp;
        
        const nextLevelThreshold = calculateLevelRequirement(level + 1);
        
        const trainingTypeLevels = trainingExperienceData.trainingTypeLevels || {
          "Strength": { xp: 0 },
          "Cardio": { xp: 0 },
          "Yoga": { xp: 0 },
          "Calisthenics": { xp: 0 }
        };
        
        const processedTrainingTypes: ExperienceData['trainingTypeLevels'] = {};
        
        Object.keys(trainingTypeLevels).forEach(type => {
          const typeData = trainingTypeLevels[type];
          const typeXp = typeof typeData.xp === 'number' 
            ? typeData.xp 
            : Number(typeData.xp || 0);
            
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
        const { data: currentData, error: fetchError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (fetchError) throw fetchError;

        const defaultExp: TrainingExperience = {
          totalXp: 0,
          trainingTypeLevels: {
            "Strength": { xp: 0 },
            "Cardio": { xp: 0 },
            "Yoga": { xp: 0 },
            "Calisthenics": { xp: 0 }
          }
        };
        
        const currentExp = currentData.training_experience 
          ? (currentData.training_experience as unknown as TrainingExperience)
          : defaultExp;
            
        // Convert totalXp to a number before arithmetic operations
        const currentTotalXp = typeof currentExp.totalXp === 'number' 
          ? currentExp.totalXp 
          : Number(currentExp.totalXp || 0);
          
        const newTotalXp = currentTotalXp + xp;
        
        const updatedExp: TrainingExperience = JSON.parse(JSON.stringify(currentExp));
        updatedExp.totalXp = newTotalXp;
        
        if (trainingType && updatedExp.trainingTypeLevels?.[trainingType]) {
          // Convert training type xp to a number before arithmetic operations
          const currentTypeXp = typeof updatedExp.trainingTypeLevels[trainingType].xp === 'number' 
            ? updatedExp.trainingTypeLevels[trainingType].xp as number
            : Number(updatedExp.trainingTypeLevels[trainingType].xp || 0);
            
          updatedExp.trainingTypeLevels[trainingType].xp = currentTypeXp + xp;
        }
        
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            training_experience: updatedExp as unknown as Json
          })
          .eq('id', user.id);
          
        if (updateError) throw updateError;
        
        try {
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
          
          if (logError) {
            console.error("Error logging experience gain:", logError);
          }
        } catch (logError) {
          console.error("Error logging experience gain:", logError);
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
