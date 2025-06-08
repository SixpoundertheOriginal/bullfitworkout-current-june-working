
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Exercise, MuscleGroup, EquipmentType, MovementPattern, Difficulty } from '@/types/exercise';
import { useExercises } from '@/hooks/useExercises';

export interface LibraryFilters {
  search?: string;
  muscleGroup?: MuscleGroup | 'all';
  equipment?: EquipmentType | 'all';
  difficulty?: Difficulty | 'all';
  movement?: MovementPattern | 'all';
  userCreated?: boolean;
}

/**
 * Enterprise-grade hook for library-specific exercise CRUD operations
 * Optimized for large datasets with advanced filtering and caching
 */
export const useLibraryExercises = (filters: LibraryFilters = {}) => {
  const queryClient = useQueryClient();
  const { exercises: allExercises, createExercise, isPending, isLoading: isLoadingAll } = useExercises();

  // Library-specific query with advanced filtering
  const { data: libraryExercises, isLoading, error } = useQuery({
    queryKey: ['exercises', 'library', filters],
    queryFn: async () => {
      if (!allExercises || !Array.isArray(allExercises)) return [];
      
      let filtered = [...allExercises];

      // Apply search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(exercise =>
          exercise?.name?.toLowerCase().includes(searchLower) ||
          exercise?.description?.toLowerCase().includes(searchLower) ||
          exercise?.primary_muscle_groups?.some(muscle => 
            muscle?.toLowerCase().includes(searchLower)
          )
        );
      }

      // Apply muscle group filter
      if (filters.muscleGroup && filters.muscleGroup !== 'all') {
        filtered = filtered.filter(exercise =>
          exercise?.primary_muscle_groups?.includes(filters.muscleGroup as MuscleGroup) ||
          exercise?.secondary_muscle_groups?.includes(filters.muscleGroup as MuscleGroup)
        );
      }

      // Apply equipment filter
      if (filters.equipment && filters.equipment !== 'all') {
        filtered = filtered.filter(exercise =>
          exercise?.equipment_type?.includes(filters.equipment as EquipmentType)
        );
      }

      // Apply difficulty filter
      if (filters.difficulty && filters.difficulty !== 'all') {
        filtered = filtered.filter(exercise =>
          exercise?.difficulty === filters.difficulty
        );
      }

      // Apply movement pattern filter
      if (filters.movement && filters.movement !== 'all') {
        filtered = filtered.filter(exercise =>
          exercise?.movement_pattern === filters.movement
        );
      }

      // Apply user created filter
      if (filters.userCreated !== undefined) {
        filtered = filtered.filter(exercise =>
          filters.userCreated ? exercise?.user_id : !exercise?.user_id
        );
      }

      return filtered;
    },
    enabled: !!allExercises,
    staleTime: 10 * 60 * 1000, // 10 minutes for library data
    cacheTime: 60 * 60 * 1000, // 1 hour
    refetchOnWindowFocus: true,
    keepPreviousData: true // Smooth transitions between filter changes
  });

  // Optimistic create exercise for library
  const createLibraryExercise = useMutation({
    mutationFn: async (exerciseData: Omit<Exercise, 'id' | 'created_at'>) => {
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticExercise: Exercise = {
        ...exerciseData,
        id: tempId,
        created_at: new Date().toISOString()
      };

      queryClient.setQueryData(['exercises'], (old: Exercise[] = []) => [
        ...old,
        optimisticExercise
      ]);

      // Invalidate library cache to show new exercise
      queryClient.invalidateQueries({ queryKey: ['exercises', 'library'] });

      // Call actual API
      return new Promise<void>((resolve, reject) => {
        createExercise(
          {
            ...exerciseData,
            user_id: exerciseData.user_id || '',
          },
          {
            onSuccess: () => {
              // Remove optimistic update and let real data flow through
              queryClient.invalidateQueries({ queryKey: ['exercises'] });
              resolve();
            },
            onError: (error) => {
              // Rollback optimistic update
              queryClient.setQueryData(['exercises'], (old: Exercise[] = []) =>
                old.filter(e => e.id !== tempId)
              );
              reject(error);
            }
          }
        );
      });
    },
    onSuccess: () => {
      // Ensure all related queries are fresh
      queryClient.invalidateQueries({ queryKey: ['exercises', 'library'] });
      queryClient.invalidateQueries({ queryKey: ['exercises', 'search'] });
    }
  });

  // Prefetch related data for performance
  const prefetchExerciseDetails = async (exerciseId: string) => {
    await queryClient.prefetchQuery({
      queryKey: ['exercise', exerciseId],
      queryFn: () => libraryExercises?.find(e => e.id === exerciseId),
      staleTime: 5 * 60 * 1000
    });
  };

  return {
    exercises: libraryExercises || [],
    isLoading: isLoading || isLoadingAll,
    error,
    createExercise: createLibraryExercise.mutate,
    isCreating: createLibraryExercise.isPending || isPending,
    prefetchExerciseDetails,
    totalCount: libraryExercises?.length || 0
  };
};
