
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Exercise, MuscleGroup, EquipmentType, MovementPattern, Difficulty } from '@/types/exercise';
import { exerciseDataTransform } from '@/utils/exerciseDataTransform';

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
 * Enterprise-grade exercise management hook with bulletproof data transformation
 * Now includes type safety and crash prevention for Exercise Library
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

      // Apply defensive transformation from database
      return (data || []).map((exercise): Exercise => {
        const transformed = exerciseDataTransform.fromDatabase(exercise);
        if (!transformed) return null;
        
        return {
          id: exercise.id,
          name: transformed.name,
          created_at: exercise.created_at || '',
          user_id: exercise.created_by || '', // Map created_by to user_id
          description: transformed.description,
          primary_muscle_groups: transformed.primary_muscle_groups as MuscleGroup[],
          secondary_muscle_groups: transformed.secondary_muscle_groups as MuscleGroup[],
          equipment_type: transformed.equipment_type as EquipmentType[],
          movement_pattern: (exercise.movement_pattern || 'push') as MovementPattern,
          difficulty: (exercise.difficulty || 'beginner') as Difficulty,
          instructions: transformed.instructions as Record<string, any>,
          is_compound: transformed.is_compound,
          tips: transformed.tips,
          variations: transformed.variations,
          metadata: exercise.metadata as ExerciseMetadata || {}
        };
      }).filter(Boolean) as Exercise[]; // Filter out any null results
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

  // Enterprise-grade create exercise mutation with bulletproof data transformation
  const { mutate: createExercise, isPending } = useMutation({
    mutationFn: async (newExercise: ExerciseInput) => {
      console.log("Creating exercise with data:", newExercise);
      
      // Validate data before transformation
      const validation = exerciseDataTransform.validateExerciseData(newExercise);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }
      
      // Transform data to database-safe format (CRITICAL FIX)
      const safeData = exerciseDataTransform.toDatabase(newExercise);
      console.log("Transformed safe data:", safeData);
      
      const { data, error } = await supabase
        .from('exercises')
        .insert([{
          name: safeData.name,
          description: safeData.description,
          primary_muscle_groups: safeData.primary_muscle_groups, // Now guaranteed to be array
          secondary_muscle_groups: safeData.secondary_muscle_groups, // Now guaranteed to be array
          equipment_type: safeData.equipment_type, // Now guaranteed to be array
          movement_pattern: safeData.movement_pattern,
          difficulty: safeData.difficulty,
          instructions: safeData.instructions,
          is_compound: safeData.is_compound,
          tips: safeData.tips, // Now guaranteed to be array
          variations: safeData.variations, // Now guaranteed to be array
          metadata: safeData.metadata,
          created_by: safeData.user_id,
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
      
      // Apply transformation for cache update as well
      const transformedExercise = exerciseDataTransform.fromDatabase(newExercise);
      
      // Optimistic update to main cache with transformed data
      queryClient.setQueryData(['exercises'], (old: Exercise[] = []) => [
        ...old,
        {
          id: newExercise.id,
          name: transformedExercise?.name || newExercise.name,
          created_at: newExercise.created_at || '',
          user_id: newExercise.created_by || '',
          description: transformedExercise?.description || '',
          primary_muscle_groups: transformedExercise?.primary_muscle_groups || [],
          secondary_muscle_groups: transformedExercise?.secondary_muscle_groups || [],
          equipment_type: transformedExercise?.equipment_type || [],
          movement_pattern: (newExercise.movement_pattern || 'push') as MovementPattern,
          difficulty: (newExercise.difficulty || 'beginner') as Difficulty,
          instructions: transformedExercise?.instructions || {},
          is_compound: transformedExercise?.is_compound || false,
          tips: transformedExercise?.tips || [],
          variations: transformedExercise?.variations || [],
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

  // Enterprise-grade sorting with memoization and defensive programming
  const getSortedExercises = React.useCallback((
    sortBy: ExerciseSortBy = initialSortBy, 
    sortOrder: SortOrder = initialSortOrder
  ): Exercise[] => {
    // Defensive programming - ensure exercises is always an array
    const safeExercises = exercises ? Array.from(exercises) : [];
    if (!Array.isArray(safeExercises)) return [];

    return [...safeExercises].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = (a.name || '').localeCompare(b.name || '');
          break;
        case 'created_at':
          comparison = (new Date(a.created_at || 0)).getTime() - (new Date(b.created_at || 0)).getTime();
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
    const safeExercises = exercises ? Array.from(exercises) : [];
    if (!Array.isArray(safeExercises)) return;
    
    await queryClient.prefetchQuery({
      queryKey: ['exercise', exerciseId],
      queryFn: () => safeExercises.find(e => e.id === exerciseId),
      staleTime: 5 * 60 * 1000
    });
  }, [exercises, queryClient]);

  // Defensive programming for error handling
  const isError = !!error;
  const safeExercises = exercises ? Array.from(exercises) : [];

  return {
    exercises: safeExercises,
    getSortedExercises,
    isLoading,
    error,
    createExercise,
    isPending,
    isError,
    prefetchExercise,
    totalCount: safeExercises.length || 0
  };
};
