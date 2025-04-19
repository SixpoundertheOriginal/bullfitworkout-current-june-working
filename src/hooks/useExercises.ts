
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Exercise } from "@/types/exercise";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";
import { useWeightUnit } from "@/context/WeightUnitContext";
import { convertWeight } from "@/utils/unitConversion";

export function useExercises() {
  const { user } = useAuth();
  const { weightUnit } = useWeightUnit();
  const queryClient = useQueryClient();

  const fetchExercises = async (): Promise<Exercise[]> => {
    if (!user) {
      console.log("User not authenticated, not fetching exercises");
      return [];
    }

    console.log("Fetching exercises for user:", user.id);
    
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error("Error fetching exercises:", error);
        throw error;
      }

      console.log("Fetched exercises data:", data);
      
      // Normalize and convert database results to Exercise type
      const normalizedExercises = (data || []).map(exercise => {
        // Transform database fields to match our Exercise interface
        const transformedExercise: Exercise = {
          id: exercise.id,
          name: exercise.name,
          created_at: exercise.created_at,
          user_id: exercise.created_by || user.id, // Use created_by as user_id if available
          description: exercise.description || "",
          primary_muscle_groups: exercise.primary_muscle_groups || [],
          secondary_muscle_groups: exercise.secondary_muscle_groups || [],
          equipment_type: exercise.equipment_type || [],
          movement_pattern: exercise.movement_pattern || "push",
          difficulty: exercise.difficulty || "beginner",
          instructions: exercise.instructions || {},
          is_compound: Boolean(exercise.is_compound),
          tips: exercise.tips || [],
          variations: exercise.variations || [],
          metadata: {
            ...(exercise.metadata || {}),
          }
        };
          
        // If exercise has default weights in metadata, convert them to current unit preference
        if (exercise.metadata && typeof exercise.metadata === 'object') {
          const metadata = exercise.metadata as Record<string, any>;
          
          if (metadata.default_weight !== undefined) {
            const defaultWeightUnit = metadata.weight_unit || "kg";
            const convertedWeight = convertWeight(
              metadata.default_weight, 
              defaultWeightUnit, 
              weightUnit
            );
            
            // Create a new object reference to trigger renders when unit changes
            transformedExercise.metadata = {
              ...transformedExercise.metadata,
              normalized_weight: convertedWeight,
              display_unit: weightUnit
            };
          }
        }
        
        return transformedExercise;
      });
      
      return normalizedExercises;
    } catch (error) {
      console.error("Exception in fetchExercises:", error);
      return [];
    }
  };

  const createExercise = async (exercise: Omit<Exercise, 'id'>): Promise<Exercise> => {
    if (!user) throw new Error("User not authenticated");

    console.log("Creating new exercise:", exercise.name);

    // Store the original weight value but also include the unit information
    const newExercise = {
      ...exercise,
      is_custom: true,
      created_by: user.id,
      instructions: exercise.instructions || {},
      is_compound: exercise.is_compound !== undefined ? exercise.is_compound : false,
      description: exercise.description || "",
      primary_muscle_groups: exercise.primary_muscle_groups || [],
      secondary_muscle_groups: exercise.secondary_muscle_groups || [],
      equipment_type: exercise.equipment_type || [],
      // Add weight unit information to metadata if relevant
      metadata: {
        ...(exercise.metadata || {}),
        weight_unit: weightUnit // Store current unit preference
      }
    };

    console.log("Submitting exercise to database:", newExercise);

    const { data, error } = await supabase
      .from('exercises')
      .insert(newExercise)
      .select()
      .single();

    if (error) {
      console.error("Error creating exercise:", error);
      throw error;
    }

    // Transform the returned data to match our Exercise interface
    const transformedExercise: Exercise = {
      id: data.id,
      name: data.name,
      created_at: data.created_at,
      user_id: data.created_by || user.id,
      description: data.description || "",
      primary_muscle_groups: data.primary_muscle_groups || [],
      secondary_muscle_groups: data.secondary_muscle_groups || [],
      equipment_type: data.equipment_type || [],
      movement_pattern: data.movement_pattern || "push",
      difficulty: data.difficulty || "beginner",
      instructions: data.instructions || {},
      is_compound: Boolean(data.is_compound),
      tips: data.tips || [],
      variations: data.variations || [],
      metadata: data.metadata || {}
    };

    console.log("Exercise created successfully:", transformedExercise);
    return transformedExercise;
  };

  const exercisesQuery = useQuery({
    queryKey: ['exercises', weightUnit], // Add weightUnit as a dependency to refetch when unit changes
    queryFn: fetchExercises,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });

  const createExerciseMutation = useMutation({
    mutationFn: createExercise,
    onSuccess: (newExercise) => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      toast(`${newExercise.name} has been added to your exercises.`);
    },
    onError: (error: Error) => {
      toast(`Error creating exercise: ${error.message}`);
    },
  });

  return {
    exercises: exercisesQuery.data || [],
    isLoading: exercisesQuery.isLoading,
    isError: exercisesQuery.isError,
    error: exercisesQuery.error,
    createExercise: createExerciseMutation.mutate,
    isPending: createExerciseMutation.isPending,
  };
}
