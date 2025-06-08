
import React, { useMemo, useCallback, useEffect } from 'react';
import { useExercises } from '@/hooks/useExercises';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { useExerciseSearch } from '@/hooks/useExerciseSearch';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';
import { useNetworkStatus } from '@/utils/serviceWorker';
import { predictiveCache } from '@/services/predictiveCache';
import { useExerciseLibraryState } from '@/hooks/useExerciseLibraryState';
import { Exercise } from '@/types/exercise';

interface ExerciseLibraryContainerProps {
  children: (props: {
    // State
    state: ReturnType<typeof useExerciseLibraryState>['state'];
    actions: ReturnType<typeof useExerciseLibraryState>['actions'];
    
    // Exercise data
    exercises: Exercise[];
    recentExercises: Exercise[];
    suggestedExercises: Exercise[];
    filteredRecent: Exercise[];
    filteredAll: Exercise[];
    currentExercises: Exercise[];
    
    // Loading states
    isLoading: boolean;
    isSearching: boolean;
    isError: boolean;
    isIndexed: boolean;
    fromCache: boolean;
    isOnline: boolean;
    
    // Pagination
    totalPages: number;
    exercisesPerPage: number;
    
    // Search
    searchResults: Exercise[];
    searchFilters: Record<string, any>;
    setSearchFilters: (filters: Record<string, any>) => void;
  }) => React.ReactNode;
}

export const ExerciseLibraryContainer: React.FC<ExerciseLibraryContainerProps> = ({ children }) => {
  // Ensure all hooks are called at the top level consistently
  const { state, actions } = useExerciseLibraryState();
  const { exercises = [], isLoading = false, isError = false } = useExercises();
  const { workouts = [] } = useWorkoutHistory();
  const isOnline = useNetworkStatus();
  
  // Constants
  const exercisesPerPage = 8;

  // Stable search filters to prevent unnecessary updates
  const searchFilters = useMemo(() => {
    if (!state) return {};
    
    const filters = {
      muscleGroup: state.selectedMuscleGroup !== "all" ? state.selectedMuscleGroup : undefined,
      equipment: state.selectedEquipment !== "all" ? state.selectedEquipment : undefined,
      difficulty: state.selectedDifficulty !== "all" ? state.selectedDifficulty : undefined,
      movement: state.selectedMovement !== "all" ? state.selectedMovement : undefined
    };
    
    return Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined)
    );
  }, [state?.selectedMuscleGroup, state?.selectedEquipment, state?.selectedDifficulty, state?.selectedMovement]);

  // Enhanced search functionality with stable options
  const searchOptions = useMemo(() => ({
    autoSearch: true,
    debounceMs: 300
  }), []);

  const {
    results: searchResults = [],
    isSearching = false,
    setQuery,
    setFilters: setSearchFilters,
    fromCache = false,
    isIndexed = false
  } = useExerciseSearch(searchOptions);

  // Performance optimization
  usePerformanceOptimization({
    enableMemoryMonitoring: true,
    enablePerformanceTracking: true
  });

  // Sync search query with state
  useEffect(() => {
    if (state?.searchQuery !== undefined) {
      setQuery(state.searchQuery);
    }
  }, [state?.searchQuery, setQuery]);

  // Sync search filters
  useEffect(() => {
    if (searchFilters && Object.keys(searchFilters).length >= 0) {
      setSearchFilters(searchFilters);
    }
  }, [searchFilters, setSearchFilters]);

  // Extract recently used exercises - ensure safe array operations
  const recentExercises = useMemo(() => {
    if (!Array.isArray(workouts) || workouts.length === 0) return [];
    if (!Array.isArray(exercises) || exercises.length === 0) return [];
    
    const exerciseMap = new Map<string, Exercise>();
    
    try {
      workouts.slice(0, 8).forEach(workout => {
        const exerciseNames = new Set<string>();
        
        if (workout?.exerciseSets && Array.isArray(workout.exerciseSets)) {
          workout.exerciseSets.forEach(set => {
            if (set?.exercise_name) {
              exerciseNames.add(set.exercise_name);
            }
          });
        }
        
        exerciseNames.forEach(name => {
          const exercise = exercises.find(e => e?.name === name);
          if (exercise && !exerciseMap.has(exercise.id)) {
            exerciseMap.set(exercise.id, exercise);
          }
        });
      });
    } catch (error) {
      console.error('Error processing recent exercises:', error);
      return [];
    }
    
    return Array.from(exerciseMap.values());
  }, [workouts, exercises]);

  // Record user search patterns for predictive caching
  useEffect(() => {
    if (!state?.searchQuery && Object.keys(searchFilters).length === 0) return;
    
    const recordSearch = () => {
      try {
        predictiveCache.recordUserSearch(state?.searchQuery || '', searchFilters);
      } catch (error) {
        console.error('Error recording search:', error);
      }
    };
    
    const timeout = setTimeout(recordSearch, 1000);
    return () => clearTimeout(timeout);
  }, [state?.searchQuery, searchFilters]);

  // Safe computed values with proper fallbacks
  const suggestedExercises = useMemo(() => {
    const safeSearchResults = Array.isArray(searchResults) ? searchResults : [];
    const safeExercises = Array.isArray(exercises) ? exercises : [];
    
    const hasActiveSearch = state?.searchQuery || Object.keys(searchFilters).length > 0;
    return hasActiveSearch ? safeSearchResults.slice(0, 20) : safeExercises.slice(0, 20);
  }, [state?.searchQuery, searchFilters, searchResults, exercises]);
    
  const filteredRecent = useMemo(() => {
    const safeSearchResults = Array.isArray(searchResults) ? searchResults : [];
    const safeRecentExercises = Array.isArray(recentExercises) ? recentExercises : [];
    
    const hasActiveSearch = state?.searchQuery || Object.keys(searchFilters).length > 0;
    return hasActiveSearch 
      ? safeSearchResults.filter(exercise => 
          safeRecentExercises.some(recent => recent?.id === exercise?.id)
        )
      : safeRecentExercises;
  }, [state?.searchQuery, searchFilters, searchResults, recentExercises]);
    
  const filteredAll = useMemo(() => {
    const safeSearchResults = Array.isArray(searchResults) ? searchResults : [];
    const safeExercises = Array.isArray(exercises) ? exercises : [];
    
    const hasActiveSearch = state?.searchQuery || Object.keys(searchFilters).length > 0;
    return hasActiveSearch ? safeSearchResults : safeExercises;
  }, [state?.searchQuery, searchFilters, searchResults, exercises]);

  // Stable pagination logic
  const paginationData = useMemo(() => {
    if (!state?.currentPage || !Array.isArray(filteredAll)) {
      return { currentExercises: [], totalPages: 0 };
    }
    
    const indexOfLastExercise = state.currentPage * exercisesPerPage;
    const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
    const currentExercises = filteredAll.slice(indexOfFirstExercise, indexOfLastExercise);
    const totalPages = Math.ceil(filteredAll.length / exercisesPerPage);

    return { currentExercises, totalPages };
  }, [filteredAll, state?.currentPage, exercisesPerPage]);

  // Stable setSearchFilters function
  const stableSetSearchFilters = useCallback((filters: Record<string, any>) => {
    setSearchFilters(filters);
  }, [setSearchFilters]);

  // Create render props safely
  const renderProps = useMemo(() => ({
    state: state || {},
    actions: actions || {},
    exercises: Array.isArray(exercises) ? exercises : [],
    recentExercises: Array.isArray(recentExercises) ? recentExercises : [],
    suggestedExercises: Array.isArray(suggestedExercises) ? suggestedExercises : [],
    filteredRecent: Array.isArray(filteredRecent) ? filteredRecent : [],
    filteredAll: Array.isArray(filteredAll) ? filteredAll : [],
    currentExercises: Array.isArray(paginationData.currentExercises) ? paginationData.currentExercises : [],
    isLoading: Boolean(isLoading),
    isSearching: Boolean(isSearching),
    isError: Boolean(isError),
    isIndexed: Boolean(isIndexed),
    fromCache: Boolean(fromCache),
    isOnline: Boolean(isOnline),
    totalPages: Number(paginationData.totalPages) || 0,
    exercisesPerPage: Number(exercisesPerPage) || 8,
    searchResults: Array.isArray(searchResults) ? searchResults : [],
    searchFilters: searchFilters || {},
    setSearchFilters: stableSetSearchFilters
  }), [
    state,
    actions,
    exercises,
    recentExercises,
    suggestedExercises,
    filteredRecent,
    filteredAll,
    paginationData.currentExercises,
    isLoading,
    isSearching,
    isError,
    isIndexed,
    fromCache,
    isOnline,
    paginationData.totalPages,
    exercisesPerPage,
    searchResults,
    searchFilters,
    stableSetSearchFilters
  ]);

  return children(renderProps);
};
