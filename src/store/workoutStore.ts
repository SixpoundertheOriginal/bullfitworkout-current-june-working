import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setProgressionService } from '@/services/SetProgressionService';

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
  
  // Save state tracking
  saveInProgress: boolean;
  saveConfirmed: boolean;
  saveError: string | null;
  
  // Timer state with validation
  elapsedTime: number;
  restTimerActive: boolean;
  restTimerResetSignal: number;
  currentRestTime: number;
  restTimerTargetDuration: number;
  
  // UI state
  activeExercise: string | null;
  
  // Navigation state
  lastActiveRoute?: string;
  sessionId?: string;
  
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
  safeResetWorkout: () => void; // New safe reset that checks save status
  addExercise: (exerciseName: string) => void;
  removeExercise: (exerciseName: string) => void;
  deleteExercise: (exerciseName: string) => void;
  updateExerciseSet: (exerciseName: string, setIndex: number, updates: Partial<ExerciseSet>) => void;
  completeSet: (exerciseName: string, setIndex: number) => void;
  addSet: (exerciseName: string) => void;
  removeSet: (exerciseName: string, setIndex: number) => void;
  setActiveExercise: (exerciseName: string | null) => void;
  incrementElapsedTime: () => void;
  setElapsedTime: (time: number) => void;
  setCurrentRestTime: (time: number) => void;
  startRestTimer: (duration: number) => void;
  stopRestTimer: () => void;
  resetRestTimer: () => void;
  setTrainingConfig: (config: any) => void;
  setWorkoutStatus: (status: 'idle' | 'active' | 'saving' | 'saved' | 'failed') => void;
  updateLastActiveRoute: (route: string) => void;
  setExercises: (exercises: Record<string, ExerciseSet[]> | ((prev: Record<string, ExerciseSet[]>) => Record<string, ExerciseSet[]>)) => void;
  markAsSaving: () => void;
  markAsSaved: () => void;
  markAsFailed: (error: any) => void;
  setSaveInProgress: (inProgress: boolean) => void;
  setSaveConfirmed: (confirmed: boolean) => void;
  workoutId?: string;
  handleCompleteSet?: (exerciseName: string, setIndex: number) => void;
  startTime?: number;
}

// Validation helpers
const validateElapsedTime = (time: number): number => {
  const MAX_WORKOUT_TIME = 86400; // 24 hours
  const validatedTime = Math.max(0, Math.min(Math.floor(time), MAX_WORKOUT_TIME));
  
  if (time > MAX_WORKOUT_TIME) {
    console.warn('[WorkoutStore] Timer reset due to excessive value:', time);
  }
  
  return validatedTime;
};

const validateRestTime = (time: number): number => {
  const MAX_REST_TIME = 3600; // 1 hour max rest
  return Math.max(0, Math.min(Math.floor(time), MAX_REST_TIME));
};

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      // Initial state
      isActive: false,
      explicitlyEnded: false,
      workoutStatus: 'idle',
      exercises: {},
      saveInProgress: false,
      saveConfirmed: false,
      saveError: null,
      elapsedTime: 0,
      restTimerActive: false,
      restTimerResetSignal: 0,
      currentRestTime: 0,
      restTimerTargetDuration: 0,
      activeExercise: null,
      trainingConfig: null,
      lastActiveRoute: undefined,
      sessionId: undefined,
      workoutId: undefined,
      startTime: undefined,

      // Actions with enhanced save state management
      startWorkout: (config) => set({
        isActive: true,
        explicitlyEnded: false,
        workoutStatus: 'active',
        elapsedTime: 0,
        saveInProgress: false,
        saveConfirmed: false,
        saveError: null,
        trainingConfig: config || null,
        sessionId: `workout_${Date.now()}`,
        startTime: Date.now()
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
        trainingConfig: null,
        sessionId: undefined,
        workoutId: undefined,
        startTime: undefined,
        saveInProgress: false,
        saveConfirmed: false,
        saveError: null
      }),

      // Safe reset that checks save status
      safeResetWorkout: () => {
        const state = get();
        
        if (state.saveInProgress) {
          console.warn('[WorkoutStore] Cannot reset workout while save is in progress');
          return;
        }

        if (state.isActive && !state.saveConfirmed && Object.keys(state.exercises).length > 0) {
          console.warn('[WorkoutStore] Cannot reset active workout without save confirmation');
          return;
        }

        // Safe to reset
        set({
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
          sessionId: undefined,
          workoutId: undefined,
          startTime: undefined,
          saveInProgress: false,
          saveConfirmed: false,
          saveError: null
        });
      },

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

      deleteExercise: (exerciseName) => set((state) => {
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

      completeSet: (exerciseName, setIndex) => {
        const { updateExerciseSet } = get();
        updateExerciseSet(exerciseName, setIndex, { completed: true });
      },

      addSet: (exerciseName) => set((state) => {
        const exercises = { ...state.exercises };
        if (exercises[exerciseName]) {
          const newSetIndex = exercises[exerciseName].length + 1;
          
          // Get smart defaults using progression service
          const context = {
            exerciseName,
            currentSets: exercises[exerciseName],
            userPreferences: state.trainingConfig || {},
            workoutDuration: state.elapsedTime,
            totalVolume: exercises[exerciseName].reduce((sum, set) => sum + (set.completed ? set.volume : 0), 0)
          };
          
          const suggestion = setProgressionService.calculateNextSet(context);
          
          // Use smart defaults if confidence is high, otherwise use last set values
          let defaultValues;
          if (suggestion.confidence > 0.5) {
            defaultValues = {
              weight: suggestion.weight,
              reps: suggestion.reps,
              restTime: suggestion.restTime
            };
          } else {
            // Fallback to last set values or basic defaults
            const lastSet = exercises[exerciseName][exercises[exerciseName].length - 1];
            defaultValues = lastSet ? {
              weight: lastSet.weight,
              reps: lastSet.reps,
              restTime: lastSet.restTime
            } : {
              weight: 0,
              reps: 0,
              restTime: 60
            };
          }

          exercises[exerciseName].push({
            id: `${exerciseName}-${newSetIndex}`,
            weight: defaultValues.weight,
            reps: defaultValues.reps,
            restTime: defaultValues.restTime,
            completed: false,
            isEditing: false,
            volume: defaultValues.weight * defaultValues.reps,
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

      setElapsedTime: (time) => set({ elapsedTime: validateElapsedTime(time) }),

      setCurrentRestTime: (time) => set({ currentRestTime: validateRestTime(time) }),

      startRestTimer: (duration) => set({
        restTimerActive: true,
        currentRestTime: validateRestTime(duration),
        restTimerTargetDuration: validateRestTime(duration),
      }),

      stopRestTimer: () => set({
        restTimerActive: false,
        currentRestTime: 0,
        restTimerTargetDuration: 0,
      }),

      resetRestTimer: () => set((state) => ({
        restTimerResetSignal: state.restTimerResetSignal + 1,
        restTimerActive: false,
        currentRestTime: 0,
        restTimerTargetDuration: 0,
      })),

      setTrainingConfig: (config) => set({ trainingConfig: config }),

      setWorkoutStatus: (status) => set({ workoutStatus: status }),

      updateLastActiveRoute: (route) => set({ lastActiveRoute: route }),

      setExercises: (exercises) => set((state) => ({
        exercises: typeof exercises === 'function' ? exercises(state.exercises) : exercises
      })),

      markAsSaving: () => set({ 
        workoutStatus: 'saving',
        saveInProgress: true,
        saveError: null 
      }),

      markAsSaved: () => set({ 
        workoutStatus: 'saved',
        saveInProgress: false,
        saveConfirmed: true,
        saveError: null 
      }),

      markAsFailed: (error) => set({ 
        workoutStatus: 'failed',
        saveInProgress: false,
        saveError: error?.message || 'Save failed' 
      }),

      setSaveInProgress: (inProgress) => set({ saveInProgress: inProgress }),
      
      setSaveConfirmed: (confirmed) => set({ saveConfirmed: confirmed }),

      handleCompleteSet: (exerciseName, setIndex) => {
        const state = get();
        // Start rest timer logic here
        set({ restTimerActive: true, currentRestTime: 60 });
      }
    }),
    {
      name: 'workout-storage',
      partialize: (state) => ({
        isActive: state.isActive,
        exercises: state.exercises,
        elapsedTime: validateElapsedTime(state.elapsedTime),
        restTimerActive: state.restTimerActive,
        currentRestTime: state.currentRestTime,
        restTimerTargetDuration: state.restTimerTargetDuration,
        trainingConfig: state.trainingConfig,
        workoutStatus: state.workoutStatus,
        lastActiveRoute: state.lastActiveRoute,
        sessionId: state.sessionId,
        workoutId: state.workoutId,
        saveInProgress: state.saveInProgress,
        saveConfirmed: state.saveConfirmed
      })
    }
  )
);
