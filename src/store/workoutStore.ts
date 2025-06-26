import { create } from 'zustand';
import { Exercise } from '@/types/exercise';
import { TrainingConfig } from '@/hooks/useTrainingSetupPersistence';
import { calculateSetVolume } from '@/utils/volumeCalculator';

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
  
  startWorkout: () => void;
  pauseWorkout: () => void;
  resetWorkout: () => void;
  safeResetWorkout: () => void;
  setElapsedTime: (time: number) => void;
  setTrainingConfig: (config: TrainingConfig) => void;
  addExercise: (exercise: Exercise) => void;
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
  
  // Recovery-related actions
  detectRecoveryNeeded: () => void;
  performRecovery: () => void;
  clearRecovery: () => void;
  setRecoveryData: (data: WorkoutStore) => void;
  
  setRestTimerTargetDuration: (duration: number) => void;
}

interface ExerciseSet {
  setNumber: number;
  weight: number;
  reps: number;
  duration?: number;
  restTime?: number;
  completed: boolean;
  isEditing: boolean;
}

const generateSessionId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
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
  
  startWorkout: () => {
    set({ 
      isActive: true,
      sessionId: generateSessionId()
    });
  },
  pauseWorkout: () => set({ isActive: false }),
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
    });
  },
  setElapsedTime: (time: number) => set({ elapsedTime: time }),
  setTrainingConfig: (config: TrainingConfig) => set({ trainingConfig: config }),
  addExercise: (exercise: Exercise) => {
    set((state) => {
      if (state.exercises[exercise.name]) {
        console.warn(`Exercise "${exercise.name}" already exists. Not adding.`);
        return state;
      }
      
      const initialSet: ExerciseSet = {
        setNumber: 1,
        weight: 0,
        reps: 0,
        completed: false,
        isEditing: false,
      };
      
      return {
        exercises: {
          ...state.exercises,
          [exercise.name]: [initialSet],
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
        setNumber: newSetNumber,
        weight: 0,
        reps: 0,
        completed: false,
        isEditing: true,
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
      updatedSets[setIndex] = { ...updatedSets[setIndex], ...updates };
      
      // Recalculate volume for the set
      const exerciseData = state.trainingConfig?.exercises?.find(ex => ex.name === exerciseName);
      const userWeight = state.trainingConfig?.userWeight || 75;
      const weight = updatedSets[setIndex].weight;
      const reps = updatedSets[setIndex].reps;
      
      if (exerciseData) {
        const volume = calculateSetVolume(exerciseName, weight, reps, exerciseData, userWeight);
        updatedSets[setIndex] = { ...updatedSets[setIndex], currentVolume: volume };
      }
      
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
      
      // Reorder the exerciseNames array
      const reorderedExerciseNames = [...exerciseNames];
      reorderedExerciseNames.splice(oldIndex, 1);
      reorderedExerciseNames.splice(newIndex, 0, exerciseName);
      
      // Rebuild the exercises object based on the reordered names
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
  
  setRestTimerTargetDuration: (duration: number) => {
    set({ restTimerTargetDuration: duration });
  },
}));

useWorkoutStore.subscribe(
  (state) => {
    if (state.isActive) {
      persistWorkoutData(state);
    }
  },
  (state) => [state.exercises, state.isActive, state.elapsedTime, state.restTimerActive, state.currentRestTime, state.restTimerTargetDuration]
);
