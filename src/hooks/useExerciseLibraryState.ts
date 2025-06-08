
import { useReducer, useCallback } from 'react';
import { Exercise, MuscleGroup, EquipmentType, Difficulty, MovementPattern } from '@/types/exercise';

export interface ExerciseLibraryState {
  // UI State
  showCreateWizard: boolean;
  showFilters: boolean;
  activeTab: string;
  currentPage: number;
  useVirtualization: boolean;
  
  // Filter State
  searchQuery: string;
  selectedMuscleGroup: MuscleGroup | 'all';
  selectedEquipment: EquipmentType | 'all';
  selectedDifficulty: Difficulty | 'all';
  selectedMovement: MovementPattern | 'all';
  
  // Modal State
  deleteConfirmOpen: boolean;
  exerciseToDelete: Exercise | null;
}

type ExerciseLibraryAction =
  | { type: 'SET_SHOW_CREATE_WIZARD'; payload: boolean }
  | { type: 'SET_SHOW_FILTERS'; payload: boolean }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'SET_CURRENT_PAGE'; payload: number }
  | { type: 'SET_VIRTUALIZATION'; payload: boolean }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_MUSCLE_GROUP'; payload: MuscleGroup | 'all' }
  | { type: 'SET_EQUIPMENT'; payload: EquipmentType | 'all' }
  | { type: 'SET_DIFFICULTY'; payload: Difficulty | 'all' }
  | { type: 'SET_MOVEMENT'; payload: MovementPattern | 'all' }
  | { type: 'SET_DELETE_CONFIRM'; payload: { open: boolean; exercise?: Exercise | null } }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'RESET_PAGE' };

const initialState: ExerciseLibraryState = {
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
};

function exerciseLibraryReducer(state: ExerciseLibraryState, action: ExerciseLibraryAction): ExerciseLibraryState {
  switch (action.type) {
    case 'SET_SHOW_CREATE_WIZARD':
      return { ...state, showCreateWizard: action.payload };
    case 'SET_SHOW_FILTERS':
      return { ...state, showFilters: action.payload };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload, currentPage: 1 };
    case 'SET_CURRENT_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SET_VIRTUALIZATION':
      return { ...state, useVirtualization: action.payload };
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload, currentPage: 1 };
    case 'SET_MUSCLE_GROUP':
      return { ...state, selectedMuscleGroup: action.payload, currentPage: 1 };
    case 'SET_EQUIPMENT':
      return { ...state, selectedEquipment: action.payload, currentPage: 1 };
    case 'SET_DIFFICULTY':
      return { ...state, selectedDifficulty: action.payload, currentPage: 1 };
    case 'SET_MOVEMENT':
      return { ...state, selectedMovement: action.payload, currentPage: 1 };
    case 'SET_DELETE_CONFIRM':
      return {
        ...state,
        deleteConfirmOpen: action.payload.open,
        exerciseToDelete: action.payload.exercise || null,
      };
    case 'CLEAR_FILTERS':
      return {
        ...state,
        searchQuery: "",
        selectedMuscleGroup: "all",
        selectedEquipment: "all",
        selectedDifficulty: "all",
        selectedMovement: "all",
        currentPage: 1,
      };
    case 'RESET_PAGE':
      return { ...state, currentPage: 1 };
    default:
      return state;
  }
}

export const useExerciseLibraryState = () => {
  const [state, dispatch] = useReducer(exerciseLibraryReducer, initialState);

  const actions = {
    setShowCreateWizard: useCallback((show: boolean) => {
      dispatch({ type: 'SET_SHOW_CREATE_WIZARD', payload: show });
    }, []),
    
    setShowFilters: useCallback((show: boolean) => {
      dispatch({ type: 'SET_SHOW_FILTERS', payload: show });
    }, []),
    
    setActiveTab: useCallback((tab: string) => {
      dispatch({ type: 'SET_ACTIVE_TAB', payload: tab });
    }, []),
    
    setCurrentPage: useCallback((page: number) => {
      dispatch({ type: 'SET_CURRENT_PAGE', payload: page });
    }, []),
    
    setUseVirtualization: useCallback((use: boolean) => {
      dispatch({ type: 'SET_VIRTUALIZATION', payload: use });
    }, []),
    
    setSearchQuery: useCallback((query: string) => {
      dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
    }, []),
    
    setSelectedMuscleGroup: useCallback((muscle: MuscleGroup | 'all') => {
      dispatch({ type: 'SET_MUSCLE_GROUP', payload: muscle });
    }, []),
    
    setSelectedEquipment: useCallback((equipment: EquipmentType | 'all') => {
      dispatch({ type: 'SET_EQUIPMENT', payload: equipment });
    }, []),
    
    setSelectedDifficulty: useCallback((difficulty: Difficulty | 'all') => {
      dispatch({ type: 'SET_DIFFICULTY', payload: difficulty });
    }, []),
    
    setSelectedMovement: useCallback((movement: MovementPattern | 'all') => {
      dispatch({ type: 'SET_MOVEMENT', payload: movement });
    }, []),
    
    setDeleteConfirm: useCallback((open: boolean, exercise?: Exercise | null) => {
      dispatch({ type: 'SET_DELETE_CONFIRM', payload: { open, exercise } });
    }, []),
    
    clearFilters: useCallback(() => {
      dispatch({ type: 'CLEAR_FILTERS' });
    }, []),
    
    resetPage: useCallback(() => {
      dispatch({ type: 'RESET_PAGE' });
    }, []),
  };

  return { state, actions };
};
