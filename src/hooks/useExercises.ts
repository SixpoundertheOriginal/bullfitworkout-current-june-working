
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
        category: exercise.category || '',
        equipment: exercise.equipment || '',
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
