
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Exercise, MuscleGroup, EquipmentType, MovementPattern, Difficulty } from '@/types/exercise';

export type ExerciseMetadata = {
  default_weight?: number;
  default_reps?: number;
  weight_unit?: string;
  normalized_weight?: number;
  display_unit?: string;
};

type ExerciseInput = Omit<Exercise, 'id'>;

export const useExercises = () => {
  const queryClient = useQueryClient();
  
  const { data: exercises, isLoading, error } = useQuery({
    queryKey: ['exercises'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercises')
        .select('*');

      if (error) throw error;

      return data.map((exercise): Exercise => ({
        id: exercise.id,
        name: exercise.name,
        created_at: exercise.created_at || '',
        user_id: exercise.created_by || '', // Map created_by to user_id
        description: exercise.description || '',
        primary_muscle_groups: (exercise.primary_muscle_groups || []) as MuscleGroup[],
        secondary_muscle_groups: (exercise.secondary_muscle_groups || []) as MuscleGroup[],
        equipment_type: (exercise.equipment_type || []) as EquipmentType[],
        movement_pattern: (exercise.movement_pattern || 'push') as MovementPattern,
        difficulty: (exercise.difficulty || 'beginner') as Difficulty,
        instructions: (exercise.instructions || {}) as Record<string, any>,
        is_compound: exercise.is_compound || false,
        tips: exercise.tips || [],
        variations: exercise.variations || [],
        metadata: exercise.metadata as ExerciseMetadata || {}
      }));
    }
  });

  // Improved mutation for creating exercises
  const { mutate: createExercise, isPending } = useMutation({
    mutationFn: async (newExercise: ExerciseInput) => {
      console.log("Creating exercise with data:", newExercise);
      
      // Make sure we have the required fields
      if (!newExercise.name || !newExercise.primary_muscle_groups || newExercise.primary_muscle_groups.length === 0) {
        throw new Error("Exercise name and at least one primary muscle group are required");
      }
      
      const { data, error } = await supabase
        .from('exercises')
        .insert([{
          name: newExercise.name,
          description: newExercise.description || '',
          primary_muscle_groups: newExercise.primary_muscle_groups,
          secondary_muscle_groups: newExercise.secondary_muscle_groups || [],
          equipment_type: newExercise.equipment_type || [],
          movement_pattern: newExercise.movement_pattern,
          difficulty: newExercise.difficulty,
          instructions: newExercise.instructions || {},
          is_compound: Boolean(newExercise.is_compound),
          tips: newExercise.tips || [],
          variations: newExercise.variations || [],
          metadata: newExercise.metadata || {},
          created_by: newExercise.user_id || '', // Ensure user_id is being sent
          is_custom: true // Mark as custom exercise
        }])
        .select();

      if (error) {
        console.error("Error creating exercise:", error);
        throw error;
      }
      
      console.log("Exercise created successfully:", data);
      return data[0];
    },
    onSuccess: () => {
      // Invalidate and refetch exercises query to update the UI
      console.log("Invalidating exercises query cache");
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    },
    onError: (error) => {
      console.error("Error in createExercise mutation:", error);
    }
  });

  const isError = !!error;

  return {
    exercises: exercises || [],
    isLoading,
    error,
    createExercise,
    isPending,
    isError
  };
};
