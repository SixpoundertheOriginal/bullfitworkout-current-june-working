
import React, { createContext, useReducer, ReactNode, Dispatch } from 'react';
import { createContext as createContextUtil } from '@/utils/createContext';
import { type MuscleGroup, type EquipmentType, type MovementPattern, type Difficulty } from '@/constants/exerciseMetadata';

// Define filter state interface
export interface ExerciseFilterState {
  searchQuery: string;
  selectedMuscleGroup: MuscleGroup | "all";
  selectedEquipment: EquipmentType | "all";
  selectedDifficulty: Difficulty | "all";
  selectedMovement: MovementPattern | "all";
  currentPage: number;
  pageSize: number;
}

// Initial filter state
export const initialFilterState: ExerciseFilterState = {
  searchQuery: "",
  selectedMuscleGroup: "all",
  selectedEquipment: "all",
  selectedDifficulty: "all",
  selectedMovement: "all",
  currentPage: 1,
  pageSize: 8
};

// Define filter actions
export type ExerciseFilterAction =
  | { type: "SET_SEARCH_QUERY"; payload: string }
  | { type: "SET_MUSCLE_GROUP"; payload: MuscleGroup | "all" }
  | { type: "SET_EQUIPMENT"; payload: EquipmentType | "all" }
  | { type: "SET_DIFFICULTY"; payload: Difficulty | "all" }
  | { type: "SET_MOVEMENT"; payload: MovementPattern | "all" }
  | { type: "SET_PAGE"; payload: number }
  | { type: "SET_PAGE_SIZE"; payload: number }
  | { type: "RESET_FILTERS" };

// Filter reducer
export function filterReducer(state: ExerciseFilterState, action: ExerciseFilterAction): ExerciseFilterState {
  switch (action.type) {
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload, currentPage: 1 };
    case "SET_MUSCLE_GROUP":
      return { ...state, selectedMuscleGroup: action.payload, currentPage: 1 };
    case "SET_EQUIPMENT":
      return { ...state, selectedEquipment: action.payload, currentPage: 1 };
    case "SET_DIFFICULTY":
      return { ...state, selectedDifficulty: action.payload, currentPage: 1 };
    case "SET_MOVEMENT":
      return { ...state, selectedMovement: action.payload, currentPage: 1 };
    case "SET_PAGE":
      return { ...state, currentPage: action.payload };
    case "SET_PAGE_SIZE":
      return { ...state, pageSize: action.payload, currentPage: 1 };
    case "RESET_FILTERS":
      return { ...initialFilterState };
    default:
      return state;
  }
}

// Create context with type
type ExerciseFilterContextType = {
  state: ExerciseFilterState;
  dispatch: Dispatch<ExerciseFilterAction>;
};

// Use the createContext utility to create the context and hook
// Fix: Remove the argument since createContextUtil doesn't expect one
export const [ExerciseFilterProvider, useExerciseFilterContext] = createContextUtil<ExerciseFilterContextType>();

// Create a wrapper provider component with useReducer
interface ExerciseFilterProviderProps {
  children: ReactNode;
}

export function ExerciseFiltersProvider({ children }: ExerciseFilterProviderProps) {
  const [state, dispatch] = useReducer(filterReducer, initialFilterState);

  // Create the context value object
  const contextValue: ExerciseFilterContextType = {
    state,
    dispatch
  };

  return (
    <ExerciseFilterProvider value={contextValue}>
      {children}
    </ExerciseFilterProvider>
  );
}

// Helper hooks for common operations
export function useExerciseFilters() {
  const { state, dispatch } = useExerciseFilterContext();
  
  const setSearchQuery = (query: string) => {
    dispatch({ type: "SET_SEARCH_QUERY", payload: query });
  };
  
  const setMuscleGroup = (muscleGroup: MuscleGroup | "all") => {
    dispatch({ type: "SET_MUSCLE_GROUP", payload: muscleGroup });
  };
  
  const setEquipment = (equipment: EquipmentType | "all") => {
    dispatch({ type: "SET_EQUIPMENT", payload: equipment });
  };
  
  const setDifficulty = (difficulty: Difficulty | "all") => {
    dispatch({ type: "SET_DIFFICULTY", payload: difficulty });
  };
  
  const setMovement = (movement: MovementPattern | "all") => {
    dispatch({ type: "SET_MOVEMENT", payload: movement });
  };
  
  const setPage = (page: number) => {
    dispatch({ type: "SET_PAGE", payload: page });
  };
  
  const resetFilters = () => {
    dispatch({ type: "RESET_FILTERS" });
  };
  
  return {
    ...state,
    setSearchQuery,
    setMuscleGroup,
    setEquipment,
    setDifficulty,
    setMovement,
    setPage,
    resetFilters
  };
}
