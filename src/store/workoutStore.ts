
import { create } from 'zustand';
import { Exercise } from '@/types/exercise';
import { TrainingConfig } from '@/hooks/useTrainingSetupPersistence';

export interface ExerciseSet {
  id: string;
  setNumber: number;
  weight: number;
  reps: number;
  duration?: number;
  restTime?: number;
  completed: boolean;
  isEditing: boolean;
  volume: number;
  exercise_name?: string;
  set_number?: number;
  workout_id?: string;
}

interface WorkoutStore {
  sessionId: string | null;
  trainingConfig: TrainingConfig | null;
  exercises: { [key: string]: ExerciseSet[] };
  isActive: boolean;
  elapsedTime: number;
  lastActiveRoute: string | null;
  restTimerActive: boolean;
  restTimerResetSignal: number;
  currentRestTime: number;
  restTimerTargetDuration: number;
  needsRecovery: boolean;
  recoveryData: WorkoutStore | null;
  
  // Additional properties needed by components
  activeExercise: string | null;
  workoutStatus: 'idle' | 'active' | 'paused' | 'completed';
  workoutId: string | null;
  startTime: number | null;
  explicitlyEnded: boolean;
  
  startWorkout: () => void;
  pauseWorkout: () => void;
  resetWorkout: () => void;
  safeResetWorkout: () => void;
  setElapsedTime: (time: number) => void;
  setTrainingConfig: (config: TrainingConfig) => void;
  addExercise: (exercise: Exercise | string) => void;
  removeExercise: (exerciseName: string) => void;
  addSet: (exerciseName: string) => void;
  completeSet: (exerciseName: string, setIndex: number) => void;
  updateSet: (exerciseName: string, setIndex: number, updates: Partial<ExerciseSet>) => void;
  deleteSet: (exerciseName: string, setIndex: number) => void;
  reorderExercise: (exerciseName: string, newIndex: number) => void;
  startRestTimer: (duration?: number) => void;
  stopRestTimer: () => void;
  resetRestTimer: () => void;
  setCurrentRestTime: (time: number) => void;
  updateLastActiveRoute: (route: string) => void;
  setRestTimerTargetDuration: (duration: number) => void;
  
  // Additional methods needed by components
  setExercises: (exercises: { [key: string]: ExerciseSet[] } | ((prev: { [key: string]: ExerciseSet[] }) => { [key: string]: ExerciseSet[] })) => void;
  setActiveExercise: (exerciseName: string | null) => void;
  updateExerciseSet: (exerciseName: string, setIndex: number, updates: Partial<ExerciseSet>) => void;
  removeSet: (exerciseName: string, setIndex: number) => void;
  deleteExercise: (exerciseName: string) => void;
  setWorkoutStatus: (status: 'idle' | 'active' | 'paused' | 'completed') => void;
  
  // Recovery-related actions
  detectRecoveryNeeded: () => void;
  performRecovery: () => void;
  clearRecovery: () => void;
  setRecoveryData: (data: WorkoutStore) => void;
}

const generateSessionId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const generateSetId = (exerciseName: string, setNumber: number): string => {
  return `${exerciseName}-set-${setNumber}-${Date.now()}`;
};

const persistWorkoutData = (state: WorkoutStore) => {
  try {
    localStorage.setItem('bullfit-workout-data', JSON.stringify(state));
  } catch (error) {
    console.error("Failed to persist workout data to localStorage:", error);
  }
};

const clearPersistedWorkoutData = () => {
  localStorage.removeItem('bullfit-workout-data');
};

const loadPersistedWorkoutData = (): WorkoutStore | null => {
  try {
    const storedData = localStorage.getItem('bullfit-workout-data');
    return storedData ? JSON.parse(storedData) : null;
  } catch (error) {
    console.error("Failed to load workout data from localStorage:", error);
    return null;
  }
};

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  sessionId: generateSessionId(),
  trainingConfig: null,
  exercises: {},
  isActive: false,
  elapsedTime: 0,
  lastActiveRoute: null,
  restTimerActive: false,
  restTimerResetSignal: 0,
  currentRestTime: 0,
  restTimerTargetDuration: 60,
  needsRecovery: false,
  recoveryData: null,
  activeExercise: null,
  workoutStatus: 'idle',
  workoutId: null,
  startTime: null,
  explicitlyEnded: false,
  
  startWorkout: () => {
    set({ 
      isActive: true,
      workoutStatus: 'active',
      sessionId: generateSessionId(),
      startTime: Date.now(),
      explicitlyEnded: false
    });
  },
  pauseWorkout: () => set({ isActive: false, workoutStatus: 'paused' }),
  resetWorkout: () => {
    set({
      sessionId: generateSessionId(),
      exercises: {},
      isActive: false,
      elapsedTime: 0,
      restTimerActive: false,
      restTimerResetSignal: 0,
      currentRestTime: 0,
      restTimerTargetDuration: 60,
      workoutStatus: 'idle',
      activeExercise: null,
      startTime: null,
      explicitlyEnded: true
    });
    clearPersistedWorkoutData();
  },
  safeResetWorkout: () => {
    set({
      exercises: {},
      isActive: false,
      elapsedTime: 0,
      restTimerActive: false,
      restTimerResetSignal: 0,
      currentRestTime: 0,
      restTimerTargetDuration: 60,
      workoutStatus: 'idle',
      activeExercise: null,
      explicitlyEnded: true
    });
  },
  setElapsedTime: (time: number) => set({ elapsedTime: time }),
  setTrainingConfig: (config: TrainingConfig) => set({ trainingConfig: config }),
  addExercise: (exercise: Exercise | string) => {
    const exerciseName = typeof exercise === 'string' ? exercise : exercise.name;
    set((state) => {
      if (state.exercises[exerciseName]) {
        console.warn(`Exercise "${exerciseName}" already exists. Not adding.`);
        return state;
      }
      
      const initialSet: ExerciseSet = {
        id: generateSetId(exerciseName, 1),
        setNumber: 1,
        weight: 0,
        reps: 0,
        completed: false,
        isEditing: false,
        volume: 0,
        exercise_name: exerciseName,
        set_number: 1
      };
      
      return {
        exercises: {
          ...state.exercises,
          [exerciseName]: [initialSet],
        },
      };
    });
  },
  removeExercise: (exerciseName: string) => {
    set((state) => {
      const { [exerciseName]: removedExercise, ...rest } = state.exercises;
      return { exercises: rest };
    });
  },
  addSet: (exerciseName: string) => {
    set((state) => {
      const exerciseSets = state.exercises[exerciseName] || [];
      const newSetNumber = exerciseSets.length > 0 ? Math.max(...exerciseSets.map(s => s.setNumber)) + 1 : 1;
      
      const newSet: ExerciseSet = {
        id: generateSetId(exerciseName, newSetNumber),
        setNumber: newSetNumber,
        weight: 0,
        reps: 0,
        completed: false,
        isEditing: true,
        volume: 0,
        exercise_name: exerciseName,
        set_number: newSetNumber
      };
      
      return {
        exercises: {
          ...state.exercises,
          [exerciseName]: [...exerciseSets, newSet],
        },
      };
    });
  },
  completeSet: (exerciseName: string, setIndex: number) => {
    set((state) => {
      const exerciseSets = state.exercises[exerciseName];
      if (!exerciseSets || setIndex < 0 || setIndex >= exerciseSets.length) {
        console.warn(`Set at index ${setIndex} for exercise "${exerciseName}" not found.`);
        return state;
      }
      
      const updatedSets = [...exerciseSets];
      updatedSets[setIndex] = { ...updatedSets[setIndex], completed: true };
      
      return {
        exercises: {
          ...state.exercises,
          [exerciseName]: updatedSets,
        },
      };
    });
  },
  updateSet: (exerciseName: string, setIndex: number, updates: Partial<ExerciseSet>) => {
    set((state) => {
      const exerciseSets = state.exercises[exerciseName];
      if (!exerciseSets || setIndex < 0 || setIndex >= exerciseSets.length) {
        console.warn(`Set at index ${setIndex} for exercise "${exerciseName}" not found.`);
        return state;
      }
      
      const updatedSets = [...exerciseSets];
      const currentSet = updatedSets[setIndex];
      const newWeight = updates.weight ?? currentSet.weight;
      const newReps = updates.reps ?? currentSet.reps;
      const volume = newWeight * newReps;
      
      updatedSets[setIndex] = { 
        ...currentSet, 
        ...updates, 
        volume 
      };
      
      return {
        exercises: {
          ...state.exercises,
          [exerciseName]: updatedSets,
        },
      };
    });
  },
  deleteSet: (exerciseName: string, setIndex: number) => {
    set((state) => {
      const exerciseSets = state.exercises[exerciseName];
      if (!exerciseSets || setIndex < 0 || setIndex >= exerciseSets.length) {
        console.warn(`Set at index ${setIndex} for exercise "${exerciseName}" not found.`);
        return state;
      }
      
      const updatedSets = exerciseSets.filter((_, index) => index !== setIndex);
      
      return {
        exercises: {
          ...state.exercises,
          [exerciseName]: updatedSets,
        },
      };
    });
  },
  reorderExercise: (exerciseName: string, newIndex: number) => {
    set((state) => {
      const exerciseNames = Object.keys(state.exercises);
      const oldIndex = exerciseNames.indexOf(exerciseName);
      
      if (oldIndex === -1) {
        console.warn(`Exercise "${exerciseName}" not found in exercise list.`);
        return state;
      }
      
      if (newIndex < 0 || newIndex >= exerciseNames.length) {
        console.warn(`New index ${newIndex} is out of bounds.`);
        return state;
      }
      
      const reorderedExerciseNames = [...exerciseNames];
      reorderedExerciseNames.splice(oldIndex, 1);
      reorderedExerciseNames.splice(newIndex, 0, exerciseName);
      
      const reorderedExercises: { [key: string]: ExerciseSet[] } = {};
      reorderedExerciseNames.forEach(name => {
        reorderedExercises[name] = state.exercises[name];
      });
      
      return { exercises: reorderedExercises };
    });
  },
  startRestTimer: (duration: number = 60) => {
    set({ 
      restTimerActive: true,
      restTimerResetSignal: Math.random(),
      currentRestTime: duration,
      restTimerTargetDuration: duration
    });
  },
  stopRestTimer: () => set({ restTimerActive: false }),
  resetRestTimer: () => set({ 
    restTimerResetSignal: Math.random(),
    currentRestTime: get().restTimerTargetDuration
  }),
  setCurrentRestTime: (time: number) => set({ currentRestTime: time }),
  updateLastActiveRoute: (route: string) => set({ lastActiveRoute: route }),
  setRestTimerTargetDuration: (duration: number) => set({ restTimerTargetDuration: duration }),
  
  // Additional methods
  setExercises: (exercises) => {
    if (typeof exercises === 'function') {
      set((state) => ({ exercises: exercises(state.exercises) }));
    } else {
      set({ exercises });
    }
  },
  setActiveExercise: (exerciseName: string | null) => set({ activeExercise: exerciseName }),
  updateExerciseSet: (exerciseName: string, setIndex: number, updates: Partial<ExerciseSet>) => {
    get().updateSet(exerciseName, setIndex, updates);
  },
  removeSet: (exerciseName: string, setIndex: number) => {
    get().deleteSet(exerciseName, setIndex);
  },
  deleteExercise: (exerciseName: string) => {
    get().removeExercise(exerciseName);
  },
  setWorkoutStatus: (status: 'idle' | 'active' | 'paused' | 'completed') => set({ workoutStatus: status }),
  
  detectRecoveryNeeded: () => {
    const persistedData = loadPersistedWorkoutData();
    if (persistedData && persistedData.isActive) {
      set({ 
        needsRecovery: true,
        recoveryData: persistedData
      });
    } else {
      set({ 
        needsRecovery: false,
        recoveryData: null
      });
    }
  },
  performRecovery: () => {
    const persistedData = get().recoveryData;
    if (persistedData) {
      set(() => ({
        sessionId: persistedData.sessionId,
        trainingConfig: persistedData.trainingConfig,
        exercises: persistedData.exercises,
        isActive: true,
        elapsedTime: persistedData.elapsedTime,
        lastActiveRoute: persistedData.lastActiveRoute,
        restTimerActive: persistedData.restTimerActive,
        restTimerResetSignal: persistedData.restTimerResetSignal,
        currentRestTime: persistedData.currentRestTime,
        restTimerTargetDuration: persistedData.restTimerTargetDuration,
        needsRecovery: false,
        recoveryData: null,
        workoutStatus: 'active'
      }));
      clearPersistedWorkoutData();
    }
  },
  clearRecovery: () => {
    set({
      needsRecovery: false,
      recoveryData: null,
    });
    clearPersistedWorkoutData();
  },
  setRecoveryData: (data: WorkoutStore) => {
    set({ recoveryData: data });
  },
}));

useWorkoutStore.subscribe(
  (state) => {
    if (state.isActive) {
      persistWorkoutData(state);
    }
  }
);
