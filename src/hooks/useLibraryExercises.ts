
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { Exercise, MuscleGroup, EquipmentType, MovementPattern, Difficulty, ExerciseInput } from '@/types/exercise';
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
    queryFn: async (): Promise<Exercise[]> => {
      if (!allExercises || !Array.isArray(allExercises)) return [];
      
      return allExercises.filter(exercise => {
        // Search filter
        if (filters.search && !exercise.name.toLowerCase().includes(filters.search.toLowerCase())) {
          return false;
        }
        
        // Muscle group filter
        if (filters.muscleGroup && filters.muscleGroup !== 'all') {
          if (!exercise.primary_muscle_groups.includes(filters.muscleGroup) && 
              !exercise.secondary_muscle_groups.includes(filters.muscleGroup)) {
            return false;
          }
        }
        
        // Equipment filter
        if (filters.equipment && filters.equipment !== 'all') {
          if (!exercise.equipment_type.includes(filters.equipment)) {
            return false;
          }
        }
        
        // Difficulty filter
        if (filters.difficulty && filters.difficulty !== 'all') {
          if (exercise.difficulty !== filters.difficulty) {
            return false;
          }
        }
        
        // Movement pattern filter
        if (filters.movement && filters.movement !== 'all') {
          if (exercise.movement_pattern !== filters.movement) {
            return false;
          }
        }
        
        // User created filter
        if (filters.userCreated !== undefined) {
          const isUserCreated = !!exercise.user_id;
          if (isUserCreated !== filters.userCreated) {
            return false;
          }
        }
        
        return true;
      });
    },
    enabled: !!allExercises,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create exercise mutation with library-specific validation
  const { mutate: createLibraryExercise, isPending: isCreating } = useMutation({
    mutationFn: async (exerciseData: Omit<Exercise, 'id' | 'created_at'>) => {
      // Ensure required fields are provided with defaults
      // And ensure it conforms to ExerciseInput by including all required fields.
      const exerciseWithDefaults: ExerciseInput = {
        name: exerciseData.name,
        description: exerciseData.description || `Custom exercise: ${exerciseData.name}`,
        primary_muscle_groups: exerciseData.primary_muscle_groups,
        secondary_muscle_groups: exerciseData.secondary_muscle_groups || [],
        equipment_type: exerciseData.equipment_type || [],
        difficulty: exerciseData.difficulty || 'beginner',
        movement_pattern: exerciseData.movement_pattern || 'push',
        is_compound: exerciseData.is_compound || false, // Added missing required field
        instructions: exerciseData.instructions || { steps: '', form: '' },
        // Optional fields from ExerciseInput if needed, like tips, variations, user_id
        user_id: exerciseData.user_id, 
        tips: exerciseData.tips,
        variations: exerciseData.variations,
        metadata: exerciseData.metadata,
      };
      
      return createExercise(exerciseWithDefaults);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercises', 'library'] });
      queryClient.invalidateQueries({ queryKey: ['exercises'] }); // Invalidate base exercises query too
    }
  });

  // Add prefetchExerciseDetails function
  const prefetchExerciseDetails = (exerciseId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['exercise', exerciseId],
      queryFn: async () => {
        // This would typically fetch detailed exercise data
        return libraryExercises?.find(ex => ex.id === exerciseId) || null;
      },
      staleTime: 10 * 60 * 1000, // 10 minutes
    });
  };

  return {
    exercises: libraryExercises || [],
    isLoading: isLoading || isLoadingAll,
    error,
    createExercise: createLibraryExercise,
    isCreating,
    totalCount: libraryExercises?.length || 0,
    hasFilters: Object.values(filters).some(value => value && value !== 'all'),
    prefetchExerciseDetails
  };
};

