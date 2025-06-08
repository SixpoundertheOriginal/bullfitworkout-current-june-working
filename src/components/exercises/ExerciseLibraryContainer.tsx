
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
  const { state, actions } = useExerciseLibraryState();
  const { exercises, isLoading, isError } = useExercises();
  const { workouts } = useWorkoutHistory();
  const isOnline = useNetworkStatus();
  
  // Memoized search filters to prevent unnecessary updates
  const searchFilters = useMemo(() => {
    const filters = {
      muscleGroup: state.selectedMuscleGroup !== "all" ? state.selectedMuscleGroup : undefined,
      equipment: state.selectedEquipment !== "all" ? state.selectedEquipment : undefined,
      difficulty: state.selectedDifficulty !== "all" ? state.selectedDifficulty : undefined,
      movement: state.selectedMovement !== "all" ? state.selectedMovement : undefined
    };
    
    return Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value !== undefined)
    );
  }, [state.selectedMuscleGroup, state.selectedEquipment, state.selectedDifficulty, state.selectedMovement]);

  // Enhanced search functionality with stable options
  const searchOptions = useMemo(() => ({
    autoSearch: true,
    debounceMs: 300
  }), []);

  const {
    results: searchResults,
    isSearching,
    setQuery,
    setFilters: setSearchFilters,
    fromCache,
    isIndexed
  } = useExerciseSearch(searchOptions);

  // Performance optimization
  usePerformanceOptimization({
    enableMemoryMonitoring: true,
    enablePerformanceTracking: true
  });

  // Constants
  const exercisesPerPage = 8;

  // Sync search query with state
  useEffect(() => {
    setQuery(state.searchQuery);
  }, [state.searchQuery, setQuery]);

  // Sync search filters
  useEffect(() => {
    setSearchFilters(searchFilters);
  }, [searchFilters, setSearchFilters]);

  // Extract recently used exercises with crash fixes - memoized
  const recentExercises = useMemo(() => {
    if (!workouts?.length || !Array.isArray(exercises)) return [];
    
    const exerciseMap = new Map<string, Exercise>();
    
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
    
    return exerciseMap.size > 0 ? Array.from(exerciseMap.values()) : [];
  }, [workouts, exercises]);

  // Record user search patterns for predictive caching - optimized
  useEffect(() => {
    if (state.searchQuery || Object.keys(searchFilters).length > 0) {
      const recordSearch = () => {
        predictiveCache.recordUserSearch(state.searchQuery, searchFilters);
      };
      
      // Debounce the recording to avoid excessive calls
      const timeout = setTimeout(recordSearch, 1000);
      return () => clearTimeout(timeout);
    }
  }, [state.searchQuery, searchFilters]);

  // Memoized computed values to prevent unnecessary re-renders
  const suggestedExercises = useMemo(() => {
    const safeSearchResults = Array.isArray(searchResults) ? searchResults : [];
    const safeExercises = Array.isArray(exercises) ? exercises : [];
    
    return state.searchQuery || Object.keys(searchFilters).length > 0 
      ? safeSearchResults.slice(0, 20) 
      : safeExercises.slice(0, 20);
  }, [state.searchQuery, searchFilters, searchResults, exercises]);
    
  const filteredRecent = useMemo(() => {
    const safeSearchResults = Array.isArray(searchResults) ? searchResults : [];
    const safeRecentExercises = Array.isArray(recentExercises) ? recentExercises : [];
    
    return state.searchQuery || Object.keys(searchFilters).length > 0 
      ? safeSearchResults.filter(exercise => 
          safeRecentExercises.some(recent => recent?.id === exercise?.id)
        )
      : safeRecentExercises;
  }, [state.searchQuery, searchFilters, searchResults, recentExercises]);
    
  const filteredAll = useMemo(() => {
    const safeSearchResults = Array.isArray(searchResults) ? searchResults : [];
    const safeExercises = Array.isArray(exercises) ? exercises : [];
    
    return state.searchQuery || Object.keys(searchFilters).length > 0 
      ? safeSearchResults 
      : safeExercises;
  }, [state.searchQuery, searchFilters, searchResults, exercises]);

  // Memoized pagination logic
  const paginationData = useMemo(() => {
    const indexOfLastExercise = state.currentPage * exercisesPerPage;
    const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
    const currentExercises = Array.isArray(filteredAll) 
      ? filteredAll.slice(indexOfFirstExercise, indexOfLastExercise)
      : [];
    const totalPages = Array.isArray(filteredAll) 
      ? Math.ceil(filteredAll.length / exercisesPerPage)
      : 0;

    return { currentExercises, totalPages };
  }, [filteredAll, state.currentPage, exercisesPerPage]);

  const safeExercises = Array.isArray(exercises) ? exercises : [];

  // Memoized stable setSearchFilters function
  const stableSetSearchFilters = useCallback((filters: Record<string, any>) => {
    setSearchFilters(filters);
  }, [setSearchFilters]);

  // Memoized render props to prevent unnecessary re-renders
  const renderProps = useMemo(() => ({
    state,
    actions,
    exercises: safeExercises,
    recentExercises,
    suggestedExercises,
    filteredRecent,
    filteredAll,
    currentExercises: paginationData.currentExercises,
    isLoading,
    isSearching,
    isError,
    isIndexed,
    fromCache,
    isOnline,
    totalPages: paginationData.totalPages,
    exercisesPerPage,
    searchResults,
    searchFilters,
    setSearchFilters: stableSetSearchFilters
  }), [
    state,
    actions,
    safeExercises,
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
