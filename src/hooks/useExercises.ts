
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Exercise } from '@/types/exercise';

export type ExerciseMetadata = {
  default_weight?: number;
  default_reps?: number;
  weight_unit?: string;
  normalized_weight?: number;
  display_unit?: string;
};

export const useExercises = () => {
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
        user_id: exercise.user_id || '',
        description: exercise.description || '',
        primary_muscle_groups: exercise.primary_muscle_groups || [],
        secondary_muscle_groups: exercise.secondary_muscle_groups || [],
        equipment_type: exercise.equipment_type || [],
        movement_pattern: exercise.movement_pattern || 'push',
        difficulty: exercise.difficulty || 'beginner',
        instructions: exercise.instructions || {},
        is_compound: exercise.is_compound || false,
        tips: exercise.tips || [],
        variations: exercise.variations || [],
        metadata: exercise.metadata as ExerciseMetadata || {}
      }));
    }
  });

  return {
    exercises: exercises || [],
    isLoading,
    error
  };
};
