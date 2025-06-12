
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ExerciseSet {
  id: string;
  weight: number;
  reps: number;
  restTime: number;
  completed: boolean;
  isEditing: boolean;
  volume: number;
  duration: string;
  set_number?: number;
  exercise_name?: string;
  workout_id?: string;
  rest_time?: number;
}

export interface WorkoutState {
  // Core workout state
  isActive: boolean;
  explicitlyEnded: boolean;
  workoutStatus: 'idle' | 'active' | 'saving' | 'saved' | 'failed';
  exercises: Record<string, ExerciseSet[]>;
  
  // Timer state
  elapsedTime: number;
  restTimerActive: boolean;
  restTimerResetSignal: number;
  currentRestTime: number;
  
  // UI state
  activeExercise: string | null;
  
  // Training configuration
  trainingConfig: {
    trainingType: string;
    tags: string[];
    duration: number;
    rankedExercises?: {
      recommended: any[];
      other: any[];
      matchData: Record<string, { score: number, reasons: string[] }>;
    };
  } | null;
  
  // Actions
  startWorkout: (config?: any) => void;
  endWorkout: () => void;
  resetWorkout: () => void;
  addExercise: (exerciseName: string) => void;
  removeExercise: (exerciseName: string) => void;
  updateExerciseSet: (exerciseName: string, setIndex: number, updates: Partial<ExerciseSet>) => void;
  addSet: (exerciseName: string) => void;
  removeSet: (exerciseName: string, setIndex: number) => void;
  setActiveExercise: (exerciseName: string | null) => void;
  incrementElapsedTime: () => void;
  startRestTimer: (duration: number) => void;
  stopRestTimer: () => void;
  resetRestTimer: () => void;
  setTrainingConfig: (config: any) => void;
  setWorkoutStatus: (status: 'idle' | 'active' | 'saving' | 'saved' | 'failed') => void;
}

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      // Initial state
      isActive: false,
      explicitlyEnded: false,
      workoutStatus: 'idle',
      exercises: {},
      elapsedTime: 0,
      restTimerActive: false,
      restTimerResetSignal: 0,
      currentRestTime: 0,
      activeExercise: null,
      trainingConfig: null,

      // Actions
      startWorkout: (config) => set({
        isActive: true,
        explicitlyEnded: false,
        workoutStatus: 'active',
        elapsedTime: 0,
        trainingConfig: config || null
      }),

      endWorkout: () => set({
        isActive: false,
        explicitlyEnded: true,
        workoutStatus: 'idle',
        activeExercise: null
      }),

      resetWorkout: () => set({
        isActive: false,
        explicitlyEnded: false,
        workoutStatus: 'idle',
        exercises: {},
        elapsedTime: 0,
        restTimerActive: false,
        restTimerResetSignal: 0,
        currentRestTime: 0,
        activeExercise: null,
        trainingConfig: null
      }),

      addExercise: (exerciseName) => set((state) => ({
        exercises: {
          ...state.exercises,
          [exerciseName]: state.exercises[exerciseName] || [{
            id: `${exerciseName}-1`,
            weight: 0,
            reps: 0,
            restTime: 60,
            completed: false,
            isEditing: false,
            volume: 0,
            duration: '0:00'
          }]
        }
      })),

      removeExercise: (exerciseName) => set((state) => {
        const newExercises = { ...state.exercises };
        delete newExercises[exerciseName];
        return { exercises: newExercises };
      }),

      updateExerciseSet: (exerciseName, setIndex, updates) => set((state) => {
        const exercises = { ...state.exercises };
        if (exercises[exerciseName] && exercises[exerciseName][setIndex]) {
          const updatedSet = { ...exercises[exerciseName][setIndex], ...updates };
          updatedSet.volume = updatedSet.weight * updatedSet.reps;
          exercises[exerciseName][setIndex] = updatedSet;
        }
        return { exercises };
      }),

      addSet: (exerciseName) => set((state) => {
        const exercises = { ...state.exercises };
        if (exercises[exerciseName]) {
          const newSetIndex = exercises[exerciseName].length + 1;
          exercises[exerciseName].push({
            id: `${exerciseName}-${newSetIndex}`,
            weight: 0,
            reps: 0,
            restTime: 60,
            completed: false,
            isEditing: false,
            volume: 0,
            duration: '0:00'
          });
        }
        return { exercises };
      }),

      removeSet: (exerciseName, setIndex) => set((state) => {
        const exercises = { ...state.exercises };
        if (exercises[exerciseName]) {
          exercises[exerciseName].splice(setIndex, 1);
        }
        return { exercises };
      }),

      setActiveExercise: (exerciseName) => set({ activeExercise: exerciseName }),

      incrementElapsedTime: () => set((state) => ({ 
        elapsedTime: state.elapsedTime + 1 
      })),

      startRestTimer: (duration) => set({
        restTimerActive: true,
        currentRestTime: duration
      }),

      stopRestTimer: () => set({
        restTimerActive: false,
        currentRestTime: 0
      }),

      resetRestTimer: () => set((state) => ({
        restTimerResetSignal: state.restTimerResetSignal + 1,
        restTimerActive: false,
        currentRestTime: 0
      })),

      setTrainingConfig: (config) => set({ trainingConfig: config }),

      setWorkoutStatus: (status) => set({ workoutStatus: status })
    }),
    {
      name: 'workout-storage',
      partialize: (state) => ({
        isActive: state.isActive,
        exercises: state.exercises,
        elapsedTime: state.elapsedTime,
        trainingConfig: state.trainingConfig,
        workoutStatus: state.workoutStatus
      })
    }
  )
);
