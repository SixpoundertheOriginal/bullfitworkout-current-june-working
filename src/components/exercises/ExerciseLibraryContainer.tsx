import React, { useMemo, useCallback, useEffect } from 'react';
import { useExercises } from '@/hooks/useExercises';
import { useValidatedWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { useExerciseSearch } from '@/hooks/useExerciseSearch';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';
import { useNetworkStatus } from '@/utils/serviceWorker';
import { predictiveCache } from '@/services/predictiveCache';
import { useExerciseLibraryState, ExerciseLibraryState } from '@/hooks/useExerciseLibraryState';
import { usePersonalInsights } from '@/hooks/usePersonalInsights';
import { Exercise } from '@/types/exercise';
import { PersonalInsight } from '@/types/personal-analytics';

interface ExerciseLibraryContainerProps {
  children: (props: {
    // State
    state: ExerciseLibraryState;
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
    
    // Personal Analytics
    personalInsights: PersonalInsight[];
    isLoadingInsights: boolean;
  }) => React.ReactNode;
}

export const ExerciseLibraryContainer: React.FC<ExerciseLibraryContainerProps> = ({ children }) => {
  // Ensure all hooks are called at the top level consistently
  const libraryState = useExerciseLibraryState();
  const { exercises = [], isLoading = false, isError = false } = useExercises();
  const { data } = useValidatedWorkoutHistory();
  const isOnline = useNetworkStatus();
  
  // Safely get workouts from validated data
  const workouts = data?.workouts || [];
  
  // Early return with loading state if hooks are not ready
  if (!libraryState || !libraryState.state || !libraryState.actions) {
    return children({
      state: {
        showCreateWizard: false,
        showFilters: false,
        activeTab: "suggested",
        currentPage: 1,
        useVirtualization: false,
        searchQuery: "",
        selectedMuscleGroup: "all",
        selectedEquipment: "all",
        selectedDifficulty: "all",
        selectedMovement: "all",
        deleteConfirmOpen: false,
        exerciseToDelete: null,
      } as ExerciseLibraryState,
      actions: {
        setShowCreateWizard: () => {},
        setShowFilters: () => {},
        setActiveTab: () => {},
        setCurrentPage: () => {},
        setUseVirtualization: () => {},
        setSearchQuery: () => {},
        setSelectedMuscleGroup: () => {},
        setSelectedEquipment: () => {},
        setSelectedDifficulty: () => {},
        setSelectedMovement: () => {},
        setDeleteConfirm: () => {},
        clearFilters: () => {},
        resetPage: () => {},
      },
      exercises: [],
      recentExercises: [],
      suggestedExercises: [],
      filteredRecent: [],
      filteredAll: [],
      currentExercises: [],
      isLoading: true,
      isSearching: false,
      isError: false,
      isIndexed: false,
      fromCache: false,
      isOnline: false,
      totalPages: 0,
      exercisesPerPage: 8,
      searchResults: [],
      searchFilters: {},
      setSearchFilters: () => {},
      personalInsights: [],
      isLoadingInsights: true
    });
  }

  const { state, actions } = libraryState;
  
  // Constants
  const exercisesPerPage = 8;

  // Stable search filters to prevent unnecessary updates
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

  // Personal Insights Integration
  const { data: personalInsights = [], isLoading: isLoadingInsights } = usePersonalInsights({
    exercises: Array.isArray(exercises) ? exercises : [],
    enabled: Array.isArray(exercises) && exercises.length > 0
  });

  // Sync search query with state
  useEffect(() => {
    if (state.searchQuery !== undefined) {
      setQuery(state.searchQuery);
    }
  }, [state.searchQuery, setQuery]);

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
        
        // Note: exerciseSets is not available in validated data, 
        // so we'll need to implement a different approach for getting recent exercises
        // For now, return empty array until we add exerciseSets back to validated data
        
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
    if (!state.searchQuery && Object.keys(searchFilters).length === 0) return;
    
    const recordSearch = () => {
      try {
        predictiveCache.recordUserSearch(state.searchQuery || '', searchFilters);
      } catch (error) {
        console.error('Error recording search:', error);
      }
    };
    
    const timeout = setTimeout(recordSearch, 1000);
    return () => clearTimeout(timeout);
  }, [state.searchQuery, searchFilters]);

  const suggestedExercises = useMemo(() => {
    const safeSearchResults = Array.isArray(searchResults) ? searchResults : [];
    const safeExercises = Array.isArray(exercises) ? exercises : [];
    
    const hasActiveSearch = state.searchQuery || Object.keys(searchFilters).length > 0;
    return hasActiveSearch ? safeSearchResults.slice(0, 20) : safeExercises.slice(0, 20);
  }, [state.searchQuery, searchFilters, searchResults, exercises]);
    
  const filteredRecent = useMemo(() => {
    const safeSearchResults = Array.isArray(searchResults) ? searchResults : [];
    const safeRecentExercises = Array.isArray(recentExercises) ? recentExercises : [];
    
    const hasActiveSearch = state.searchQuery || Object.keys(searchFilters).length > 0;
    return hasActiveSearch 
      ? safeSearchResults.filter(exercise => 
          safeRecentExercises.some(recent => recent?.id === exercise?.id)
        )
      : safeRecentExercises;
  }, [state.searchQuery, searchFilters, searchResults, recentExercises]);
    
  const filteredAll = useMemo(() => {
    const safeSearchResults = Array.isArray(searchResults) ? searchResults : [];
    const safeExercises = Array.isArray(exercises) ? exercises : [];
    
    const hasActiveSearch = state.searchQuery || Object.keys(searchFilters).length > 0;
    return hasActiveSearch ? safeSearchResults : safeExercises;
  }, [state.searchQuery, searchFilters, searchResults, exercises]);

  // Stable pagination logic
  const paginationData = useMemo(() => {
    if (!state.currentPage || !Array.isArray(filteredAll)) {
      return { currentExercises: [], totalPages: 0 };
    }
    
    const indexOfLastExercise = state.currentPage * exercisesPerPage;
    const indexOfFirstExercise = indexOfLastExercise - exercisesPerPage;
    const currentExercises = filteredAll.slice(indexOfFirstExercise, indexOfLastExercise);
    const totalPages = Math.ceil(filteredAll.length / exercisesPerPage);

    return { currentExercises, totalPages };
  }, [filteredAll, state.currentPage, exercisesPerPage]);

  const stableSetSearchFilters = useCallback((filters: Record<string, any>) => {
    setSearchFilters(filters);
  }, [setSearchFilters]);

  // Create render props safely
  const renderProps = useMemo(() => ({
    state,
    actions,
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
    setSearchFilters: stableSetSearchFilters,
    personalInsights: Array.isArray(personalInsights) ? personalInsights : [],
    isLoadingInsights: Boolean(isLoadingInsights)
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
    stableSetSearchFilters,
    personalInsights,
    isLoadingInsights
  ]);

  return children(renderProps);
};
