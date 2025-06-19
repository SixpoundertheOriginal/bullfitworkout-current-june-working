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
  timestamp?: number;
}

export interface WorkoutState {
  // Core workout state - SIMPLIFIED
  isActive: boolean;
  explicitlyEnded: boolean;
  workoutStatus: 'idle' | 'active'; // REMOVED save states - React Query handles this
  exercises: Record<string, ExerciseSet[]>;
  
  // REMOVED: Dual state management with React Query
  // saveInProgress, saveConfirmed, saveError - React Query handles all save states
  
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
  
  // Recovery support
  startTime?: number;
  needsRecovery?: boolean;
  
  // Actions - SIMPLIFIED (removed save state actions)
  startWorkout: (config?: any) => void;
  endWorkout: () => void;
  resetWorkout: () => void;
  safeResetWorkout: () => void;
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
  setWorkoutStatus: (status: 'idle' | 'active') => void; // SIMPLIFIED
  updateLastActiveRoute: (route: string) => void;
  setExercises: (exercises: Record<string, ExerciseSet[]> | ((prev: Record<string, ExerciseSet[]>) => Record<string, ExerciseSet[]>)) => void;
  
  // REMOVED: Save state management actions - React Query handles these
  // markAsSaving, markAsSaved, markAsFailed, setSaveInProgress, setSaveConfirmed
  
  workoutId?: string;
  handleCompleteSet?: (exerciseName: string, setIndex: number) => void;
  
  // Recovery methods
  detectRecoveryNeeded: () => void;
  performRecovery: () => void;
  clearRecovery: () => void;
}

// Recovery helper functions
const inferTrainingTypeFromExercises = (exercises: Record<string, ExerciseSet[]>): string => {
  const exerciseNames = Object.keys(exercises).map(name => name.toLowerCase());
  
  if (exerciseNames.some(name => name.includes('squat') || name.includes('deadlift') || name.includes('bench'))) {
    return 'Strength';
  }
  if (exerciseNames.some(name => name.includes('pushup') || name.includes('pullup') || name.includes('dip'))) {
    return 'Calisthenics';
  }
  if (exerciseNames.some(name => name.includes('run') || name.includes('bike') || name.includes('cardio'))) {
    return 'Cardio';
  }
  
  return 'General';
};

const calculateWorkoutStartTime = (exercises: Record<string, ExerciseSet[]>): number => {
  let earliestTimestamp = Date.now();
  
  // Look for the earliest timestamp in completed sets
  Object.values(exercises).forEach(sets => {
    sets.forEach(set => {
      if (set.completed && set.timestamp && set.timestamp < earliestTimestamp) {
        earliestTimestamp = set.timestamp;
      }
    });
  });
  
  // If no timestamps found, estimate based on typical workout duration
  if (earliestTimestamp === Date.now()) {
    const totalSets = Object.values(exercises).reduce((total, sets) => total + sets.filter(s => s.completed).length, 0);
    const estimatedDuration = totalSets * 3 * 60 * 1000; // 3 minutes per set average
    earliestTimestamp = Date.now() - estimatedDuration;
  }
  
  return earliestTimestamp;
};

export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get) => ({
      // Initial state - SIMPLIFIED
      isActive: false,
      explicitlyEnded: false,
      workoutStatus: 'idle', // SIMPLIFIED - only idle/active
      exercises: {},
      // REMOVED: saveInProgress, saveConfirmed, saveError
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
      needsRecovery: false,

      // Enhanced actions - SIMPLIFIED
      startWorkout: (config) => {
        const now = Date.now();
        set({
          isActive: true,
          explicitlyEnded: false,
          workoutStatus: 'active',
          elapsedTime: 0,
          // REMOVED: Save state resets - React Query handles this
          trainingConfig: config || null,
          sessionId: `workout_${now}`,
          startTime: now,
          needsRecovery: false
        });
      },

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
        // REMOVED: Save state resets
        needsRecovery: false
      }),

      // Safe reset - SIMPLIFIED (removed save state checks)
      safeResetWorkout: () => {
        const state = get();
        
        // SIMPLIFIED: Just check if workout is active and has exercises
        if (state.isActive && Object.keys(state.exercises).length > 0) {
          console.warn('[WorkoutStore] Cannot reset active workout with exercises');
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
          needsRecovery: false
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
            duration: '0:00',
            timestamp: Date.now()
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
        updateExerciseSet(exerciseName, setIndex, { 
          completed: true,
          timestamp: Date.now()
        });
      },

      addSet: (exerciseName) => set((state) => {
        const exercises = { ...state.exercises };
        if (exercises[exerciseName]) {
          const newSetIndex = exercises[exerciseName].length + 1;
          
          const context = {
            exerciseName,
            currentSets: exercises[exerciseName],
            userPreferences: state.trainingConfig || {},
            workoutDuration: state.elapsedTime,
            totalVolume: exercises[exerciseName].reduce((sum, set) => sum + (set.completed ? set.volume : 0), 0)
          };
          
          const suggestion = setProgressionService.calculateNextSet(context);
          
          let defaultValues;
          if (suggestion.confidence > 0.5) {
            defaultValues = {
              weight: suggestion.weight,
              reps: suggestion.reps,
              restTime: suggestion.restTime
            };
          } else {
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
            duration: '0:00',
            timestamp: Date.now()
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

      handleCompleteSet: (exerciseName, setIndex) => {
        const state = get();
        set({ restTimerActive: true, currentRestTime: 60 });
      },

      detectRecoveryNeeded: () => {
        const state = get();
        const hasExercises = Object.keys(state.exercises).length > 0;
        const hasCompletedSets = Object.values(state.exercises).some(sets => 
          sets.some(set => set.completed)
        );
        const missingMetadata = !state.startTime || !state.trainingConfig;
        
        if (hasExercises && hasCompletedSets && missingMetadata) {
          console.log('[WorkoutStore] Recovery needed - has exercises but missing metadata');
          set({ needsRecovery: true });
        }
      },

      performRecovery: () => {
        const state = get();
        console.log('[WorkoutStore] Performing workout recovery');
        
        const recoveredStartTime = calculateWorkoutStartTime(state.exercises);
        const recoveredTrainingType = inferTrainingTypeFromExercises(state.exercises);
        
        const recoveredConfig = {
          trainingType: recoveredTrainingType,
          tags: [],
          duration: 60 // Default duration
        };

        // Calculate elapsed time based on recovered start time
        const recoveredElapsedTime = Math.floor((Date.now() - recoveredStartTime) / 1000);

        set({
          startTime: recoveredStartTime,
          trainingConfig: recoveredConfig,
          elapsedTime: recoveredElapsedTime,
          isActive: true,
          workoutStatus: 'active',
          needsRecovery: false,
          sessionId: state.sessionId || `recovered_${Date.now()}`
        });

        console.log('[WorkoutStore] Recovery completed', {
          startTime: new Date(recoveredStartTime),
          trainingType: recoveredTrainingType,
          elapsedTime: recoveredElapsedTime
        });
      },

      clearRecovery: () => set({ needsRecovery: false })
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
        // REMOVED: Save state persistence
        startTime: state.startTime,
        needsRecovery: state.needsRecovery
      })
    }
  )
);

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
