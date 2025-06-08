
import React, { createContext, useContext, useReducer, useCallback, useEffect, useMemo } from 'react';
import { Exercise, MuscleGroup, EquipmentType, MovementPattern, Difficulty } from '@/types/exercise';
import { useDebounce } from '@/hooks/useDebounce';

// Types for search state
interface SearchFilters {
  muscleGroup?: MuscleGroup;
  equipment?: EquipmentType;
  difficulty?: Difficulty;
  movement?: MovementPattern;
  isCompound?: boolean;
  userCreated?: boolean;
}

interface ExerciseSearchState {
  query: string;
  filters: SearchFilters;
  results: Exercise[];
  suggestions: Exercise[];
  recentSearches: string[];
  isSearching: boolean;
  error: string | null;
  totalResults: number;
  searchHistory: Array<{ query: string; filters: SearchFilters; timestamp: number }>;
  fromCache: boolean;
  isIndexed: boolean;
}

// Action types for search reducer
type ExerciseSearchAction =
  | { type: 'SET_QUERY'; payload: string }
  | { type: 'SET_FILTERS'; payload: SearchFilters }
  | { type: 'SET_RESULTS'; payload: { results: Exercise[]; fromCache: boolean } }
  | { type: 'SET_SUGGESTIONS'; payload: Exercise[] }
  | { type: 'SET_SEARCHING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_RECENT_SEARCH'; payload: string }
  | { type: 'CLEAR_RECENT_SEARCHES' }
  | { type: 'ADD_SEARCH_HISTORY'; payload: { query: string; filters: SearchFilters } }
  | { type: 'CLEAR_SEARCH_HISTORY' }
  | { type: 'SET_INDEXED'; payload: boolean }
  | { type: 'RESET_SEARCH' };

// Initial state
const initialState: ExerciseSearchState = {
  query: '',
  filters: {},
  results: [],
  suggestions: [],
  recentSearches: [],
  isSearching: false,
  error: null,
  totalResults: 0,
  searchHistory: [],
  fromCache: false,
  isIndexed: false,
};

// Reducer for search state
function exerciseSearchReducer(state: ExerciseSearchState, action: ExerciseSearchAction): ExerciseSearchState {
  switch (action.type) {
    case 'SET_QUERY':
      return { ...state, query: action.payload };
    
    case 'SET_FILTERS':
      return { ...state, filters: action.payload };
    
    case 'SET_RESULTS':
      return {
        ...state,
        results: action.payload.results,
        totalResults: action.payload.results.length,
        fromCache: action.payload.fromCache,
        isSearching: false
      };
    
    case 'SET_SUGGESTIONS':
      return { ...state, suggestions: action.payload };
    
    case 'SET_SEARCHING':
      return { ...state, isSearching: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, isSearching: false };
    
    case 'ADD_RECENT_SEARCH':
      return {
        ...state,
        recentSearches: [
          action.payload,
          ...state.recentSearches.filter(search => search !== action.payload)
        ].slice(0, 10) // Keep only last 10 searches
      };
    
    case 'CLEAR_RECENT_SEARCHES':
      return { ...state, recentSearches: [] };
    
    case 'ADD_SEARCH_HISTORY':
      return {
        ...state,
        searchHistory: [
          {
            query: action.payload.query,
            filters: action.payload.filters,
            timestamp: Date.now()
          },
          ...state.searchHistory.filter(
            item => !(item.query === action.payload.query && 
                     JSON.stringify(item.filters) === JSON.stringify(action.payload.filters))
          )
        ].slice(0, 50) // Keep only last 50 search history items
      };
    
    case 'CLEAR_SEARCH_HISTORY':
      return { ...state, searchHistory: [] };
    
    case 'SET_INDEXED':
      return { ...state, isIndexed: action.payload };
    
    case 'RESET_SEARCH':
      return { ...initialState, isIndexed: state.isIndexed };
    
    default:
      return state;
  }
}

// Helper function to perform exercise search
const performSearch = (exercises: Exercise[], query: string, filters: SearchFilters): Exercise[] => {
  let filtered = [...exercises];

  // Apply text search
  if (query.trim()) {
    const searchLower = query.toLowerCase();
    filtered = filtered.filter(exercise =>
      exercise.name.toLowerCase().includes(searchLower) ||
      exercise.description?.toLowerCase().includes(searchLower) ||
      exercise.primary_muscle_groups.some(muscle => muscle.toLowerCase().includes(searchLower)) ||
      exercise.secondary_muscle_groups.some(muscle => muscle.toLowerCase().includes(searchLower)) ||
      exercise.equipment_type.some(equipment => equipment.toLowerCase().includes(searchLower))
    );
  }

  // Apply filters
  if (filters.muscleGroup) {
    filtered = filtered.filter(exercise =>
      exercise.primary_muscle_groups.includes(filters.muscleGroup!) ||
      exercise.secondary_muscle_groups.includes(filters.muscleGroup!)
    );
  }

  if (filters.equipment) {
    filtered = filtered.filter(exercise =>
      exercise.equipment_type.includes(filters.equipment!)
    );
  }

  if (filters.difficulty) {
    filtered = filtered.filter(exercise =>
      exercise.difficulty === filters.difficulty
    );
  }

  if (filters.movement) {
    filtered = filtered.filter(exercise =>
      exercise.movement_pattern === filters.movement
    );
  }

  if (filters.isCompound !== undefined) {
    filtered = filtered.filter(exercise =>
      exercise.is_compound === filters.isCompound
    );
  }

  if (filters.userCreated !== undefined) {
    // Assume exercises with user_id are user-created
    filtered = filtered.filter(exercise =>
      filters.userCreated ? exercise.user_id : !exercise.user_id
    );
  }

  return filtered;
};

// Context interface
interface ExerciseSearchContextType {
  state: ExerciseSearchState;
  setQuery: (query: string) => void;
  setFilters: (filters: SearchFilters) => void;
  search: (exercises: Exercise[]) => void;
  generateSuggestions: (exercises: Exercise[]) => void;
  clearSearch: () => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  clearSearchHistory: () => void;
  getSearchHistory: () => Array<{ query: string; filters: SearchFilters; timestamp: number }>;
  setIndexed: (indexed: boolean) => void;
}

// Create context
const ExerciseSearchContext = createContext<ExerciseSearchContextType | undefined>(undefined);

// Provider component
export const ExerciseSearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(exerciseSearchReducer, initialState);

  // Debounced query for performance
  const debouncedQuery = useDebounce(state.query, 300);

  // Search function
  const search = useCallback((exercises: Exercise[]) => {
    dispatch({ type: 'SET_SEARCHING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const results = performSearch(exercises, debouncedQuery, state.filters);
      
      dispatch({
        type: 'SET_RESULTS',
        payload: { results, fromCache: false }
      });

      // Add to search history if there's a query or filters
      if (debouncedQuery.trim() || Object.keys(state.filters).length > 0) {
        dispatch({
          type: 'ADD_SEARCH_HISTORY',
          payload: { query: debouncedQuery, filters: state.filters }
        });
      }

      // Add to recent searches if there's a text query
      if (debouncedQuery.trim()) {
        dispatch({ type: 'ADD_RECENT_SEARCH', payload: debouncedQuery });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    }
  }, [debouncedQuery, state.filters]);

  // Generate suggestions based on popular searches or similar exercises
  const generateSuggestions = useCallback((exercises: Exercise[]) => {
    // Simple suggestion logic - can be enhanced with ML in the future
    const suggestions = exercises
      .filter(exercise => exercise.primary_muscle_groups.length > 0)
      .slice(0, 5);
    
    dispatch({ type: 'SET_SUGGESTIONS', payload: suggestions });
  }, []);

  // Query and filter setters
  const setQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_QUERY', payload: query });
  }, []);

  const setFilters = useCallback((filters: SearchFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  // Clear functions
  const clearSearch = useCallback(() => {
    dispatch({ type: 'RESET_SEARCH' });
  }, []);

  const addRecentSearch = useCallback((query: string) => {
    if (query.trim()) {
      dispatch({ type: 'ADD_RECENT_SEARCH', payload: query });
    }
  }, []);

  const clearRecentSearches = useCallback(() => {
    dispatch({ type: 'CLEAR_RECENT_SEARCHES' });
  }, []);

  const clearSearchHistory = useCallback(() => {
    dispatch({ type: 'CLEAR_SEARCH_HISTORY' });
  }, []);

  const getSearchHistory = useCallback(() => {
    return state.searchHistory;
  }, [state.searchHistory]);

  const setIndexed = useCallback((indexed: boolean) => {
    dispatch({ type: 'SET_INDEXED', payload: indexed });
  }, []);

  // Context value
  const contextValue: ExerciseSearchContextType = {
    state,
    setQuery,
    setFilters,
    search,
    generateSuggestions,
    clearSearch,
    addRecentSearch,
    clearRecentSearches,
    clearSearchHistory,
    getSearchHistory,
    setIndexed,
  };

  return (
    <ExerciseSearchContext.Provider value={contextValue}>
      {children}
    </ExerciseSearchContext.Provider>
  );
};

// Hook to use search context
export const useExerciseSearch = () => {
  const context = useContext(ExerciseSearchContext);
  if (context === undefined) {
    throw new Error('useExerciseSearch must be used within an ExerciseSearchProvider');
  }
  return context;
};

export type { SearchFilters, ExerciseSearchState };
