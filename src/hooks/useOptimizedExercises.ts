
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Exercise } from '@/types/exercise';
import { exerciseDataTransform } from '@/utils/exerciseDataTransform';

/**
 * Optimized hook leveraging new RLS performance improvements
 * Uses the new unified policies and indexed queries for better performance
 */
export const useOptimizedExercises = () => {
  const queryClient = useQueryClient();

  // Main exercises query optimized for new RLS policies
  const { data: exercises, isLoading, error } = useQuery({
    queryKey: ['exercises', 'optimized'],
    queryFn: async (): Promise<Exercise[]> => {
      // Leverage the new optimized RLS policies
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name'); // This will use the new indexes

      if (error) throw error;

      // Use existing data transformation logic
      return (data || []).map((exercise): Exercise => {
        const transformed = exerciseDataTransform.fromDatabase(exercise);
        if (!transformed) return null;
        
        return {
          id: exercise.id,
          name: transformed.name,
          created_at: exercise.created_at || '',
          user_id: exercise.created_by || '',
          description: transformed.description,
          primary_muscle_groups: transformed.primary_muscle_groups as any[],
          secondary_muscle_groups: transformed.secondary_muscle_groups as any[],
          equipment_type: transformed.equipment_type as any[],
          movement_pattern: (exercise.movement_pattern || 'push') as any,
          difficulty: (exercise.difficulty || 'beginner') as any,
          instructions: transformed.instructions as Record<string, any>,
          is_compound: transformed.is_compound,
          tips: transformed.tips,
          variations: transformed.variations,
          metadata: exercise.metadata || {}
        };
      }).filter(Boolean) as Exercise[];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes - longer due to RLS optimization
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    // Performance-optimized retry strategy
    retry: (failureCount, error: any) => {
      if (error?.code === 'PGRST301') return false; // RLS policy error, don't retry
      return failureCount < 2;
    }
  });

  // Optimized create mutation using new RLS policies
  const { mutate: createExercise, isPending } = useMutation({
    mutationFn: async (newExercise: any) => {
      console.log("Creating exercise with optimized RLS:", newExercise);
      
      const validation = exerciseDataTransform.validateExerciseData(newExercise);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
      
      const safeData = exerciseDataTransform.toDatabase(newExercise);
      
      // The new RLS policy will automatically handle access control
      const { data, error } = await supabase
        .from('exercises')
        .insert([{
          name: safeData.name,
          description: safeData.description,
          primary_muscle_groups: safeData.primary_muscle_groups,
          secondary_muscle_groups: safeData.secondary_muscle_groups,
          equipment_type: safeData.equipment_type,
          movement_pattern: safeData.movement_pattern,
          difficulty: safeData.difficulty,
          instructions: safeData.instructions,
          is_compound: safeData.is_compound,
          tips: safeData.tips,
          variations: safeData.variations,
          metadata: safeData.metadata,
          created_by: safeData.user_id, // Uses optimized RLS policy
          is_custom: true
        }])
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      // Invalidate the optimized cache
      queryClient.invalidateQueries({ queryKey: ['exercises', 'optimized'] });
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
    }
  });

  return {
    exercises: exercises || [],
    isLoading,
    error,
    createExercise,
    isPending,
    totalCount: exercises?.length || 0
  };
};
