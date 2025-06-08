
import React from 'react';
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

type ExerciseInput = {
  name: string;
  description: string;
  user_id: string;
  primary_muscle_groups: MuscleGroup[];
  secondary_muscle_groups: MuscleGroup[];
  equipment_type: EquipmentType[];
  movement_pattern: MovementPattern;
  difficulty: Difficulty;
  instructions?: Record<string, any>;
  is_compound?: boolean;
  tips?: string[];
  variations?: string[];
  metadata?: Record<string, any>;
  created_at?: string;
};

export type ExerciseSortBy = 'name' | 'created_at' | 'difficulty';
export type SortOrder = 'asc' | 'desc';

/**
 * Enterprise-grade exercise management hook with optimized caching
 * Foundation for all exercise-related operations across the application
 */
export const useExercises = (initialSortBy: ExerciseSortBy = 'name', initialSortOrder: SortOrder = 'asc') => {
  const queryClient = useQueryClient();
  
  // Main exercises query with enterprise caching strategy
  const { data: exercises, isLoading, error } = useQuery({
    queryKey: ['exercises'],
    queryFn: async (): Promise<Exercise[]> => {
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
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000, // 1 hour (replaced cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    // Enable background refetching for fresh data
    refetchInterval: 30 * 60 * 1000, // 30 minutes
    // Retry on failure with exponential backoff
    retry: (failureCount, error) => {
      if (failureCount < 3) return true;
      return false;
    },
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)
  });

  // Optimized create exercise mutation with cache management
  const { mutate: createExercise, isPending } = useMutation({
    mutationFn: async (newExercise: ExerciseInput) => {
      console.log("Creating exercise with data:", newExercise);
      
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
          created_by: newExercise.user_id || '',
          is_custom: true
        }])
        .select();

      if (error) {
        console.error("Error creating exercise:", error);
        throw error;
      }
      
      console.log("Exercise created successfully:", data);
      return data[0];
    },
    onSuccess: (newExercise) => {
      console.log("Invalidating exercises query cache");
      
      // Optimistic update to main cache
      queryClient.setQueryData(['exercises'], (old: Exercise[] = []) => [
        ...old,
        {
          id: newExercise.id,
          name: newExercise.name,
          created_at: newExercise.created_at || '',
          user_id: newExercise.created_by || '',
          description: newExercise.description || '',
          primary_muscle_groups: (newExercise.primary_muscle_groups || []) as MuscleGroup[],
          secondary_muscle_groups: (newExercise.secondary_muscle_groups || []) as MuscleGroup[],
          equipment_type: (newExercise.equipment_type || []) as EquipmentType[],
          movement_pattern: (newExercise.movement_pattern || 'push') as MovementPattern,
          difficulty: (newExercise.difficulty || 'beginner') as Difficulty,
          instructions: (newExercise.instructions || {}) as Record<string, any>,
          is_compound: newExercise.is_compound || false,
          tips: newExercise.tips || [],
          variations: newExercise.variations || [],
          metadata: newExercise.metadata as ExerciseMetadata || {}
        }
      ]);

      // Invalidate related caches for consistency
      queryClient.invalidateQueries({ queryKey: ['exercises', 'library'] });
      queryClient.invalidateQueries({ queryKey: ['exercises', 'search'] });
      queryClient.invalidateQueries({ queryKey: ['exercises', 'training'] });
    },
    onError: (error) => {
      console.error("Error in createExercise mutation:", error);
    }
  });

  // Enterprise-grade sorting with memoization
  const getSortedExercises = React.useCallback((
    sortBy: ExerciseSortBy = initialSortBy, 
    sortOrder: SortOrder = initialSortOrder
  ): Exercise[] => {
    if (!exercises || !Array.isArray(exercises)) return [];

    return [...exercises].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'created_at':
          comparison = (new Date(a.created_at)).getTime() - (new Date(b.created_at)).getTime();
          break;
        case 'difficulty': {
          const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
          comparison = 
            (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0);
          break;
        }
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [exercises, initialSortBy, initialSortOrder]);

  // Prefetch exercise details for performance
  const prefetchExercise = React.useCallback(async (exerciseId: string) => {
    if (!exercises || !Array.isArray(exercises)) return;
    
    await queryClient.prefetchQuery({
      queryKey: ['exercise', exerciseId],
      queryFn: () => exercises.find(e => e.id === exerciseId),
      staleTime: 5 * 60 * 1000
    });
  }, [exercises, queryClient]);

  const isError = !!error;

  return {
    exercises: exercises || [],
    getSortedExercises,
    isLoading,
    error,
    createExercise,
    isPending,
    isError,
    prefetchExercise,
    totalCount: exercises?.length || 0
  };
};
