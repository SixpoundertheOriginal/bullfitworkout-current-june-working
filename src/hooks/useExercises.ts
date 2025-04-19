
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

  // Add mutation for creating exercises
  const { mutate: createExercise, isPending } = useMutation({
    mutationFn: async (newExercise: ExerciseInput) => {
      const { data, error } = await supabase
        .from('exercises')
        .insert([{
          name: newExercise.name,
          description: newExercise.description,
          primary_muscle_groups: newExercise.primary_muscle_groups,
          secondary_muscle_groups: newExercise.secondary_muscle_groups,
          equipment_type: newExercise.equipment_type,
          movement_pattern: newExercise.movement_pattern,
          difficulty: newExercise.difficulty,
          instructions: newExercise.instructions,
          is_compound: newExercise.is_compound,
          tips: newExercise.tips,
          variations: newExercise.variations,
          metadata: newExercise.metadata,
          created_by: newExercise.user_id
        }])
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      // Invalidate and refetch exercises query
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
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
