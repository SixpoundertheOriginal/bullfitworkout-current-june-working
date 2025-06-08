
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Exercise } from '@/types/exercise';

// Types for training exercise state
interface TrainingExerciseSet {
  weight: number;
  reps: number;
  restTime: number;
  completed: boolean;
  isEditing: boolean;
}

interface TrainingExerciseState {
  exercises: Record<string, TrainingExerciseSet[]>;
  activeExercise: string | null;
  isLoading: boolean;
  error: string | null;
  sessionStarted: boolean;
}

// Action types for training exercise reducer
type TrainingExerciseAction =
  | { type: 'SET_EXERCISES'; payload: Record<string, TrainingExerciseSet[]> }
  | { type: 'ADD_EXERCISE'; payload: { name: string; sets: TrainingExerciseSet[] } }
  | { type: 'REMOVE_EXERCISE'; payload: string }
  | { type: 'SET_ACTIVE_EXERCISE'; payload: string | null }
  | { type: 'UPDATE_SET'; payload: { exerciseName: string; setIndex: number; updates: Partial<TrainingExerciseSet> } }
  | { type: 'ADD_SET'; payload: { exerciseName: string; set: TrainingExerciseSet } }
  | { type: 'REMOVE_SET'; payload: { exerciseName: string; setIndex: number } }
  | { type: 'COMPLETE_SET'; payload: { exerciseName: string; setIndex: number } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'START_SESSION' }
  | { type: 'END_SESSION' }
  | { type: 'RESET_SESSION' };

// Initial state
const initialState: TrainingExerciseState = {
  exercises: {},
  activeExercise: null,
  isLoading: false,
  error: null,
  sessionStarted: false,
};

// Reducer for training exercise state
function trainingExerciseReducer(state: TrainingExerciseState, action: TrainingExerciseAction): TrainingExerciseState {
  switch (action.type) {
    case 'SET_EXERCISES':
      return { ...state, exercises: action.payload };
    
    case 'ADD_EXERCISE':
      return {
        ...state,
        exercises: {
          ...state.exercises,
          [action.payload.name]: action.payload.sets
        }
      };
    
    case 'REMOVE_EXERCISE':
      const { [action.payload]: removed, ...remainingExercises } = state.exercises;
      return {
        ...state,
        exercises: remainingExercises,
        activeExercise: state.activeExercise === action.payload ? null : state.activeExercise
      };
    
    case 'SET_ACTIVE_EXERCISE':
      return { ...state, activeExercise: action.payload };
    
    case 'UPDATE_SET':
      return {
        ...state,
        exercises: {
          ...state.exercises,
          [action.payload.exerciseName]: state.exercises[action.payload.exerciseName].map((set, index) =>
            index === action.payload.setIndex ? { ...set, ...action.payload.updates } : set
          )
        }
      };
    
    case 'ADD_SET':
      return {
        ...state,
        exercises: {
          ...state.exercises,
          [action.payload.exerciseName]: [
            ...(state.exercises[action.payload.exerciseName] || []),
            action.payload.set
          ]
        }
      };
    
    case 'REMOVE_SET':
      return {
        ...state,
        exercises: {
          ...state.exercises,
          [action.payload.exerciseName]: state.exercises[action.payload.exerciseName].filter(
            (_, index) => index !== action.payload.setIndex
          )
        }
      };
    
    case 'COMPLETE_SET':
      return {
        ...state,
        exercises: {
          ...state.exercises,
          [action.payload.exerciseName]: state.exercises[action.payload.exerciseName].map((set, index) =>
            index === action.payload.setIndex ? { ...set, completed: true } : set
          )
        }
      };
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'START_SESSION':
      return { ...state, sessionStarted: true };
    
    case 'END_SESSION':
      return { ...state, sessionStarted: false };
    
    case 'RESET_SESSION':
      return { ...initialState };
    
    default:
      return state;
  }
}

// Context interface
interface TrainingExerciseContextType {
  state: TrainingExerciseState;
  addExercise: (exercise: Exercise | string) => void;
  removeExercise: (exerciseName: string) => void;
  setActiveExercise: (exerciseName: string | null) => void;
  addSet: (exerciseName: string) => void;
  removeSet: (exerciseName: string, setIndex: number) => void;
  updateSet: (exerciseName: string, setIndex: number, updates: Partial<TrainingExerciseSet>) => void;
  completeSet: (exerciseName: string, setIndex: number) => void;
  startSession: () => void;
  endSession: () => void;
  resetSession: () => void;
  getExerciseCount: () => number;
  getCompletedSetsCount: () => number;
  getTotalSetsCount: () => number;
  getTotalVolume: () => number;
  getTotalReps: () => number;
}

// Create context
const TrainingExerciseContext = createContext<TrainingExerciseContextType | undefined>(undefined);

// Provider component
export const TrainingExerciseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(trainingExerciseReducer, initialState);

  // Exercise management functions
  const addExercise = useCallback((exercise: Exercise | string) => {
    const exerciseName = typeof exercise === 'string' ? exercise : exercise.name;
    const defaultSet: TrainingExerciseSet = {
      weight: 0,
      reps: 0,
      restTime: 60,
      completed: false,
      isEditing: false
    };
    
    dispatch({
      type: 'ADD_EXERCISE',
      payload: { name: exerciseName, sets: [defaultSet] }
    });
    
    // Set as active exercise if it's the first one
    if (Object.keys(state.exercises).length === 0) {
      dispatch({ type: 'SET_ACTIVE_EXERCISE', payload: exerciseName });
    }
  }, [state.exercises]);

  const removeExercise = useCallback((exerciseName: string) => {
    dispatch({ type: 'REMOVE_EXERCISE', payload: exerciseName });
  }, []);

  const setActiveExercise = useCallback((exerciseName: string | null) => {
    dispatch({ type: 'SET_ACTIVE_EXERCISE', payload: exerciseName });
  }, []);

  // Set management functions
  const addSet = useCallback((exerciseName: string) => {
    const defaultSet: TrainingExerciseSet = {
      weight: 0,
      reps: 0,
      restTime: 60,
      completed: false,
      isEditing: false
    };
    
    dispatch({
      type: 'ADD_SET',
      payload: { exerciseName, set: defaultSet }
    });
  }, []);

  const removeSet = useCallback((exerciseName: string, setIndex: number) => {
    dispatch({
      type: 'REMOVE_SET',
      payload: { exerciseName, setIndex }
    });
  }, []);

  const updateSet = useCallback((exerciseName: string, setIndex: number, updates: Partial<TrainingExerciseSet>) => {
    dispatch({
      type: 'UPDATE_SET',
      payload: { exerciseName, setIndex, updates }
    });
  }, []);

  const completeSet = useCallback((exerciseName: string, setIndex: number) => {
    dispatch({
      type: 'COMPLETE_SET',
      payload: { exerciseName, setIndex }
    });
  }, []);

  // Session management functions
  const startSession = useCallback(() => {
    dispatch({ type: 'START_SESSION' });
  }, []);

  const endSession = useCallback(() => {
    dispatch({ type: 'END_SESSION' });
  }, []);

  const resetSession = useCallback(() => {
    dispatch({ type: 'RESET_SESSION' });
  }, []);

  // Computed values
  const getExerciseCount = useCallback(() => {
    return Object.keys(state.exercises).length;
  }, [state.exercises]);

  const getCompletedSetsCount = useCallback(() => {
    return Object.values(state.exercises).flat().filter(set => set.completed).length;
  }, [state.exercises]);

  const getTotalSetsCount = useCallback(() => {
    return Object.values(state.exercises).flat().length;
  }, [state.exercises]);

  const getTotalVolume = useCallback(() => {
    return Object.values(state.exercises)
      .flat()
      .filter(set => set.completed)
      .reduce((total, set) => total + (set.weight * set.reps), 0);
  }, [state.exercises]);

  const getTotalReps = useCallback(() => {
    return Object.values(state.exercises)
      .flat()
      .filter(set => set.completed)
      .reduce((total, set) => total + set.reps, 0);
  }, [state.exercises]);

  // Context value
  const contextValue: TrainingExerciseContextType = {
    state,
    addExercise,
    removeExercise,
    setActiveExercise,
    addSet,
    removeSet,
    updateSet,
    completeSet,
    startSession,
    endSession,
    resetSession,
    getExerciseCount,
    getCompletedSetsCount,
    getTotalSetsCount,
    getTotalVolume,
    getTotalReps,
  };

  return (
    <TrainingExerciseContext.Provider value={contextValue}>
      {children}
    </TrainingExerciseContext.Provider>
  );
};

// Hook to use training exercise context
export const useTrainingExercises = () => {
  const context = useContext(TrainingExerciseContext);
  if (context === undefined) {
    throw new Error('useTrainingExercises must be used within a TrainingExerciseProvider');
  }
  return context;
};

export type { TrainingExerciseSet, TrainingExerciseState };
