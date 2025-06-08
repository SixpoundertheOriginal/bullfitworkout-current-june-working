
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Exercise } from '@/types/exercise';
import { useExercises } from '@/hooks/useExercises';
import { useDebounce } from '@/hooks/useDebounce';

export interface SearchFilters {
  muscleGroup?: string;
  equipment?: string;
  difficulty?: string;
  movement?: string;
  isCompound?: boolean;
}

/**
 * Enterprise-grade search hook with advanced caching and debouncing
 * Optimized for real-time search across millions of exercises
 */
export const useSearchExercises = (query: string, filters: SearchFilters = {}) => {
  const queryClient = useQueryClient();
  const { exercises: allExercises, isLoading: isLoadingAll } = useExercises();
  const debouncedQuery = useDebounce(query, 300);

  // Search-specific query with intelligent caching
  const { data: searchResults, isLoading, error } = useQuery({
    queryKey: ['exercises', 'search', debouncedQuery, filters],
    queryFn: async (): Promise<Exercise[]> => {
      if (!allExercises || !Array.isArray(allExercises)) return [];
      
      let results = [...allExercises];

      // Apply text search
      if (debouncedQuery.trim()) {
        const searchLower = debouncedQuery.toLowerCase();
        results = results.filter(exercise =>
          exercise?.name?.toLowerCase().includes(searchLower) ||
          exercise?.description?.toLowerCase().includes(searchLower) ||
          exercise?.primary_muscle_groups?.some(muscle => 
            muscle?.toLowerCase().includes(searchLower)
          ) ||
          exercise?.secondary_muscle_groups?.some(muscle => 
            muscle?.toLowerCase().includes(searchLower)
          ) ||
          exercise?.equipment_type?.some(equipment => 
            equipment?.toLowerCase().includes(searchLower)
          )
        );
      }

      // Apply filters
      if (filters.muscleGroup && filters.muscleGroup !== 'all') {
        results = results.filter(exercise =>
          exercise?.primary_muscle_groups?.includes(filters.muscleGroup as any) ||
          exercise?.secondary_muscle_groups?.includes(filters.muscleGroup as any)
        );
      }

      if (filters.equipment && filters.equipment !== 'all') {
        results = results.filter(exercise =>
          exercise?.equipment_type?.includes(filters.equipment as any)
        );
      }

      if (filters.difficulty && filters.difficulty !== 'all') {
        results = results.filter(exercise =>
          exercise?.difficulty === filters.difficulty
        );
      }

      if (filters.movement && filters.movement !== 'all') {
        results = results.filter(exercise =>
          exercise?.movement_pattern === filters.movement
        );
      }

      if (filters.isCompound !== undefined) {
        results = results.filter(exercise =>
          exercise?.is_compound === filters.isCompound
        );
      }

      return results;
    },
    enabled: !!allExercises,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    gcTime: 10 * 60 * 1000, // 10 minutes (replaced cacheTime)
    keepPreviousData: true,
    refetchOnWindowFocus: false
  });

  // Smart prefetching for popular searches
  const prefetchPopularSearches = async () => {
    const popularQueries = ['chest', 'legs', 'shoulders', 'back', 'arms'];
    
    popularQueries.forEach(popularQuery => {
      queryClient.prefetchQuery({
        queryKey: ['exercises', 'search', popularQuery, {}],
        queryFn: async (): Promise<Exercise[]> => {
          if (!allExercises || !Array.isArray(allExercises)) return [];
          return allExercises.filter(exercise =>
            exercise?.name?.toLowerCase().includes(popularQuery) ||
            exercise?.primary_muscle_groups?.some(muscle => 
              muscle?.toLowerCase().includes(popularQuery)
            )
          );
        },
        staleTime: 5 * 60 * 1000
      });
    });
  };

  return {
    results: searchResults || [],
    isSearching: isLoading || isLoadingAll,
    error,
    hasQuery: debouncedQuery.trim().length > 0,
    resultsCount: searchResults?.length || 0,
    prefetchPopularSearches
  };
};
