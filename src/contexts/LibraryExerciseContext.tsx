
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Exercise, MuscleGroup, EquipmentType, MovementPattern, Difficulty } from '@/types/exercise';
import { useExercises } from '@/hooks/useExercises';
import { exerciseDataTransform } from '@/utils/exerciseDataTransform';

// Types for library exercise state
interface LibraryExerciseState {
  exercises: Exercise[];
  filteredExercises: Exercise[];
  selectedExercise: Exercise | null;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  filters: {
    search: string;
    muscleGroup: MuscleGroup | 'all';
    equipment: EquipmentType | 'all';
    difficulty: Difficulty | 'all';
    movement: MovementPattern | 'all';
  };
  sortBy: 'name' | 'created_at' | 'difficulty';
  sortOrder: 'asc' | 'desc';
}

// Action types for library exercise reducer
type LibraryExerciseAction =
  | { type: 'SET_EXERCISES'; payload: Exercise[] }
  | { type: 'SET_FILTERED_EXERCISES'; payload: Exercise[] }
  | { type: 'SET_SELECTED_EXERCISE'; payload: Exercise | null }
  | { type: 'SET_CREATING'; payload: boolean }
  | { type: 'SET_UPDATING'; payload: boolean }
  | { type: 'SET_DELETING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FILTERS'; payload: Partial<LibraryExerciseState['filters']> }
  | { type: 'SET_SORT'; payload: { sortBy: 'name' | 'created_at' | 'difficulty'; sortOrder: 'asc' | 'desc' } }
  | { type: 'RESET_FILTERS' };

// Initial state
const initialState: LibraryExerciseState = {
  exercises: [],
  filteredExercises: [],
  selectedExercise: null,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  filters: {
    search: '',
    muscleGroup: 'all',
    equipment: 'all',
    difficulty: 'all',
    movement: 'all',
  },
  sortBy: 'name',
  sortOrder: 'asc',
};

// Reducer for library exercise state
function libraryExerciseReducer(state: LibraryExerciseState, action: LibraryExerciseAction): LibraryExerciseState {
  switch (action.type) {
    case 'SET_EXERCISES':
      return { ...state, exercises: action.payload };
    
    case 'SET_FILTERED_EXERCISES':
      return { ...state, filteredExercises: action.payload };
    
    case 'SET_SELECTED_EXERCISE':
      return { ...state, selectedExercise: action.payload };
    
    case 'SET_CREATING':
      return { ...state, isCreating: action.payload };
    
    case 'SET_UPDATING':
      return { ...state, isUpdating: action.payload };
    
    case 'SET_DELETING':
      return { ...state, isDeleting: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload }
      };
    
    case 'SET_SORT':
      return {
        ...state,
        sortBy: action.payload.sortBy,
        sortOrder: action.payload.sortOrder
      };
    
    case 'RESET_FILTERS':
      return {
        ...state,
        filters: initialState.filters
      };
    
    default:
      return state;
  }
}

// Helper function to apply filters and sorting with defensive programming
const applyFiltersAndSort = (exercises: Exercise[], filters: LibraryExerciseState['filters'], sortBy: string, sortOrder: string): Exercise[] => {
  // Defensive programming - ensure exercises is always an array
  const safeExercises = exerciseDataTransform.ensureArray(exercises);
  let filtered = [...safeExercises];

  // Apply search filter with null safety
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(exercise => {
      if (!exercise) return false;
      
      const name = exercise.name?.toLowerCase() || '';
      const description = exercise.description?.toLowerCase() || '';
      const primaryMuscles = exerciseDataTransform.ensureArray(exercise.primary_muscle_groups);
      const secondaryMuscles = exerciseDataTransform.ensureArray(exercise.secondary_muscle_groups);
      
      return name.includes(searchLower) ||
             description.includes(searchLower) ||
             primaryMuscles.some(muscle => muscle?.toLowerCase().includes(searchLower)) ||
             secondaryMuscles.some(muscle => muscle?.toLowerCase().includes(searchLower));
    });
  }

  // Apply muscle group filter with defensive checks
  if (filters.muscleGroup !== 'all') {
    filtered = filtered.filter(exercise => {
      if (!exercise) return false;
      const primaryMuscles = exerciseDataTransform.ensureArray(exercise.primary_muscle_groups);
      const secondaryMuscles = exerciseDataTransform.ensureArray(exercise.secondary_muscle_groups);
      return primaryMuscles.includes(filters.muscleGroup as MuscleGroup) ||
             secondaryMuscles.includes(filters.muscleGroup as MuscleGroup);
    });
  }

  // Apply equipment filter with defensive checks
  if (filters.equipment !== 'all') {
    filtered = filtered.filter(exercise => {
      if (!exercise) return false;
      const equipmentTypes = exerciseDataTransform.ensureArray(exercise.equipment_type);
      return equipmentTypes.includes(filters.equipment as EquipmentType);
    });
  }

  // Apply difficulty filter
  if (filters.difficulty !== 'all') {
    filtered = filtered.filter(exercise =>
      exercise?.difficulty === filters.difficulty
    );
  }

  // Apply movement pattern filter
  if (filters.movement !== 'all') {
    filtered = filtered.filter(exercise =>
      exercise?.movement_pattern === filters.movement
    );
  }

  // Apply sorting with null safety
  filtered.sort((a, b) => {
    if (!a || !b) return 0;
    
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = (a.name || '').localeCompare(b.name || '');
        break;
      case 'created_at':
        comparison = new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime();
        break;
      case 'difficulty': {
        const difficultyOrder = { beginner: 1, intermediate: 2, advanced: 3, expert: 4 };
        comparison = (difficultyOrder[a.difficulty] || 0) - (difficultyOrder[b.difficulty] || 0);
        break;
      }
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return filtered;
};

// Context interface
interface LibraryExerciseContextType {
  state: LibraryExerciseState;
  setFilters: (filters: Partial<LibraryExerciseState['filters']>) => void;
  resetFilters: () => void;
  setSort: (sortBy: 'name' | 'created_at' | 'difficulty', sortOrder: 'asc' | 'desc') => void;
  selectExercise: (exercise: Exercise | null) => void;
  createExercise: (exerciseData: Omit<Exercise, 'id' | 'created_at'>) => Promise<void>;
  updateExercise: (id: string, exerciseData: Partial<Exercise>) => Promise<void>;
  deleteExercise: (id: string) => Promise<void>;
  searchExercises: (query: string) => void;
  getExerciseById: (id: string) => Exercise | undefined;
  getExercisesByMuscleGroup: (muscleGroup: MuscleGroup) => Exercise[];
  getExercisesByEquipment: (equipment: EquipmentType) => Exercise[];
  getExercisesByDifficulty: (difficulty: Difficulty) => Exercise[];
}

// Create context
const LibraryExerciseContext = createContext<LibraryExerciseContextType | undefined>(undefined);

// Provider component with enhanced error handling
export const LibraryExerciseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(libraryExerciseReducer, initialState);
  const queryClient = useQueryClient();
  const { exercises, createExercise: createExerciseAPI, isPending } = useExercises();

  // Update exercises when data changes from useExercises hook with defensive programming
  useEffect(() => {
    const safeExercises = exerciseDataTransform.ensureArray(exercises);
    dispatch({ type: 'SET_EXERCISES', payload: safeExercises });
  }, [exercises]);

  // Update filtered exercises when exercises or filters change
  useEffect(() => {
    try {
      const filtered = applyFiltersAndSort(state.exercises, state.filters, state.sortBy, state.sortOrder);
      dispatch({ type: 'SET_FILTERED_EXERCISES', payload: filtered });
    } catch (error) {
      console.error('Error filtering exercises:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to filter exercises' });
      dispatch({ type: 'SET_FILTERED_EXERCISES', payload: [] });
    }
  }, [state.exercises, state.filters, state.sortBy, state.sortOrder]);

  // Filter and search functions
  const setFilters = useCallback((filters: Partial<LibraryExerciseState['filters']>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  }, []);

  const resetFilters = useCallback(() => {
    dispatch({ type: 'RESET_FILTERS' });
  }, []);

  const setSort = useCallback((sortBy: 'name' | 'created_at' | 'difficulty', sortOrder: 'asc' | 'desc') => {
    dispatch({ type: 'SET_SORT', payload: { sortBy, sortOrder } });
  }, []);

  const searchExercises = useCallback((query: string) => {
    setFilters({ search: query });
  }, [setFilters]);

  // Exercise selection
  const selectExercise = useCallback((exercise: Exercise | null) => {
    dispatch({ type: 'SET_SELECTED_EXERCISE', payload: exercise });
  }, []);

  // CRUD operations with enhanced error handling
  const createExercise = useCallback(async (exerciseData: Omit<Exercise, 'id' | 'created_at'>) => {
    dispatch({ type: 'SET_CREATING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      // Apply enterprise data transformation before submission
      const safeData = exerciseDataTransform.toDatabase(exerciseData);
      
      await new Promise<void>((resolve, reject) => {
        createExerciseAPI(
          {
            ...safeData,
            user_id: safeData.user_id || '',
          },
          {
            onSuccess: () => {
              dispatch({ type: 'SET_CREATING', payload: false });
              resolve();
            },
            onError: (error) => {
              const errorMessage = error instanceof Error ? error.message : 'Failed to create exercise';
              dispatch({ type: 'SET_ERROR', payload: errorMessage });
              dispatch({ type: 'SET_CREATING', payload: false });
              reject(error);
            }
          }
        );
      });
    } catch (error) {
      throw error;
    }
  }, [createExerciseAPI]);

  const updateExercise = useCallback(async (id: string, exerciseData: Partial<Exercise>) => {
    dispatch({ type: 'SET_UPDATING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      // TODO: Implement update API call when available
      console.log('Update exercise not yet implemented:', id, exerciseData);
      dispatch({ type: 'SET_UPDATING', payload: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update exercise';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({ type: 'SET_UPDATING', payload: false });
      throw error;
    }
  }, []);

  const deleteExercise = useCallback(async (id: string) => {
    dispatch({ type: 'SET_DELETING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    
    try {
      // TODO: Implement delete API call when available
      console.log('Delete exercise not yet implemented:', id);
      dispatch({ type: 'SET_DELETING', payload: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete exercise';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({ type: 'SET_DELETING', payload: false });
      throw error;
    }
  }, []);

  // Query functions with defensive programming
  const getExerciseById = useCallback((id: string) => {
    const safeExercises = exerciseDataTransform.ensureArray(state.exercises);
    return safeExercises.find(exercise => exercise?.id === id);
  }, [state.exercises]);

  const getExercisesByMuscleGroup = useCallback((muscleGroup: MuscleGroup) => {
    const safeExercises = exerciseDataTransform.ensureArray(state.exercises);
    return safeExercises.filter(exercise => {
      if (!exercise) return false;
      const primaryMuscles = exerciseDataTransform.ensureArray(exercise.primary_muscle_groups);
      const secondaryMuscles = exerciseDataTransform.ensureArray(exercise.secondary_muscle_groups);
      return primaryMuscles.includes(muscleGroup) || secondaryMuscles.includes(muscleGroup);
    });
  }, [state.exercises]);

  const getExercisesByEquipment = useCallback((equipment: EquipmentType) => {
    const safeExercises = exerciseDataTransform.ensureArray(state.exercises);
    return safeExercises.filter(exercise => {
      if (!exercise) return false;
      const equipmentTypes = exerciseDataTransform.ensureArray(exercise.equipment_type);
      return equipmentTypes.includes(equipment);
    });
  }, [state.exercises]);

  const getExercisesByDifficulty = useCallback((difficulty: Difficulty) => {
    const safeExercises = exerciseDataTransform.ensureArray(state.exercises);
    return safeExercises.filter(exercise => exercise?.difficulty === difficulty);
  }, [state.exercises]);

  // Context value
  const contextValue: LibraryExerciseContextType = {
    state,
    setFilters,
    resetFilters,
    setSort,
    selectExercise,
    createExercise,
    updateExercise,
    deleteExercise,
    searchExercises,
    getExerciseById,
    getExercisesByMuscleGroup,
    getExercisesByEquipment,
    getExercisesByDifficulty,
  };

  return (
    <LibraryExerciseContext.Provider value={contextValue}>
      {children}
    </LibraryExerciseContext.Provider>
  );
};

// Hook to use library exercise context
export const useLibraryExercises = () => {
  const context = useContext(LibraryExerciseContext);
  if (context === undefined) {
    throw new Error('useLibraryExercises must be used within a LibraryExerciseProvider');
  }
  return context;
};

export type { LibraryExerciseState };
