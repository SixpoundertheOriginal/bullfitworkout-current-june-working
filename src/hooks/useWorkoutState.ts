import { useState, useEffect, useCallback } from 'react';
import { toast } from "@/components/ui/sonner";
import { WorkoutState, WorkoutStatus, WorkoutError, EnhancedExerciseSet } from '@/types/workout';
import { supabase } from "@/integrations/supabase/client";

const STORAGE_VERSION = '1.0.0';

// Define and export the LocalExerciseSet interface
export interface LocalExerciseSet {
  weight: number;
  reps: number;
  restTime: number;
  completed: boolean;
  isEditing: boolean;
  id?: string;
  saveStatus?: 'pending' | 'saving' | 'saved' | 'failed';
  retryCount?: number;
}

export const useWorkoutState = () => {
  const [state, setState] = useState<WorkoutState>({
    exercises: {},
    activeExercise: null,
    elapsedTime: 0,
    restTimerActive: false,
    restTimerResetSignal: 0,
    currentRestTime: 60,
    workoutStatus: 'idle',
    savingErrors: [],
    isRecoveryMode: false
  });

  const exercises = state.exercises;
  const activeExercise = state.activeExercise;
  const elapsedTime = state.elapsedTime;
  const restTimerActive = state.restTimerActive;
  const restTimerResetSignal = state.restTimerResetSignal;
  const currentRestTime = state.currentRestTime;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}')?.currentSession?.user;
    if (!user?.id) return;
    
    const savedWorkout = localStorage.getItem(`workout_session_${user.id}`);
    if (savedWorkout) {
      try {
        const parsed = JSON.parse(savedWorkout);
        
        const version = parsed.version || '0.0.0';
        
        setState(prevState => ({
          ...prevState,
          exercises: parsed.exercises || {},
          activeExercise: parsed.activeExercise || null,
          elapsedTime: parsed.elapsedTime || 0,
          restTimerActive: parsed.restTimerActive !== undefined ? parsed.restTimerActive : false,
          currentRestTime: parsed.currentRestTime || 60,
          workoutId: parsed.workoutId || null,
          lastSyncTimestamp: parsed.lastUpdated || new Date().toISOString(),
          workoutStatus: parsed.workoutStatus === 'saving' ? 'partial' : (parsed.workoutStatus || 'idle'),
          isRecoveryMode: parsed.workoutStatus === 'saving' || parsed.workoutStatus === 'partial'
        }));
        
        if (parsed.workoutStatus === 'saving' || parsed.workoutStatus === 'partial') {
          toast("Workout recovery available", {
            description: "We found an unsaved workout. Continue your session or reset to start fresh.",
            action: {
              label: "Reset",
              onClick: resetSession
            },
            duration: 10000,
          });
        }
      } catch (error) {
        console.error("Error loading saved workout:", error);
      }
    }
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}')?.currentSession?.user;
    if (!user?.id) return;
    
    localStorage.setItem(`workout_session_${user.id}`, JSON.stringify({
      version: STORAGE_VERSION,
      exercises: state.exercises,
      activeExercise: state.activeExercise,
      elapsedTime: state.elapsedTime,
      restTimerActive: state.restTimerActive,
      currentRestTime: state.currentRestTime,
      lastUpdated: new Date().toISOString(),
      workoutStatus: state.workoutStatus,
      workoutId: state.workoutId
    }));
  }, [state]);

  const updateState = useCallback((updates: Partial<WorkoutState>) => {
    setState(prevState => ({
      ...prevState,
      ...updates
    }));
  }, []);

  const setExercises = useCallback((
    newExercises: Record<string, LocalExerciseSet[]> | ((prev: Record<string, LocalExerciseSet[]>) => Record<string, LocalExerciseSet[]>)
  ) => {
    setState(prevState => {
      const updatedExercises = typeof newExercises === 'function'
        ? newExercises(prevState.exercises as Record<string, LocalExerciseSet[]>)
        : newExercises;
        
      return {
        ...prevState,
        exercises: updatedExercises
      };
    });
  }, []);

  const setActiveExercise = useCallback((exercise: string | null) => {
    updateState({ activeExercise: exercise });
  }, [updateState]);

  const setElapsedTime = useCallback((time: number | ((prev: number) => number)) => {
    setState(prevState => ({
      ...prevState,
      elapsedTime: typeof time === 'function' ? time(prevState.elapsedTime) : time
    }));
  }, []);

  const setRestTimerActive = useCallback((active: boolean) => {
    updateState({ restTimerActive: active });
  }, [updateState]);

  const setCurrentRestTime = useCallback((time: number) => {
    updateState({ currentRestTime: time });
  }, [updateState]);

  const resetSession = useCallback(() => {
    updateState({
      exercises: {},
      activeExercise: null,
      elapsedTime: 0,
      restTimerActive: false,
      currentRestTime: 60,
      workoutStatus: 'idle',
      savingErrors: [],
      saveProgress: undefined,
      workoutId: null,
      isRecoveryMode: false
    });
    
    const user = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}')?.currentSession?.user;
    if (user?.id) {
      localStorage.removeItem(`workout_session_${user.id}`);
    }
  }, [updateState]);

  const triggerRestTimerReset = useCallback((restTime?: number) => {
    if (restTime && restTime > 0) {
      setCurrentRestTime(restTime);
    }
    
    setState(prev => ({
      ...prev,
      restTimerResetSignal: prev.restTimerResetSignal + 1
    }));
  }, [setCurrentRestTime]);

  const markAsSaving = useCallback(() => {
    updateState({ 
      workoutStatus: 'saving',
      saveProgress: {
        step: 'workout',
        total: 3,
        completed: 0,
        errors: []
      }
    });
  }, [updateState]);

  const markAsPartialSave = useCallback((errors: WorkoutError[]) => {
    updateState({
      workoutStatus: 'partial',
      savingErrors: [...state.savingErrors, ...errors]
    });

    toast("Workout partially saved", {
      description: "Some data couldn't be saved. You can try again later.",
      duration: 5000,
    });
  }, [updateState, state.savingErrors]);

  const markAsSaved = useCallback((workoutId: string) => {
    updateState({
      workoutStatus: 'saved',
      workoutId,
      savingErrors: []
    });
  }, [updateState]);

  const markAsFailed = useCallback((error: WorkoutError) => {
    updateState({
      workoutStatus: 'failed',
      savingErrors: [...state.savingErrors, error]
    });

    toast.error("Workout save failed", {
      description: error.message,
      duration: 5000,
    });
  }, [updateState, state.savingErrors]);

  const updateSaveProgress = useCallback((step: 'workout' | 'exercise-sets' | 'analytics', completed: number) => {
    setState(prev => {
      if (!prev.saveProgress) return prev;
      
      return {
        ...prev,
        saveProgress: {
          ...prev.saveProgress,
          step,
          completed
        }
      };
    });
  }, []);

  const attemptRecovery = useCallback(async () => {
    if (!state.workoutId) return false;
    
    try {
      updateState({ workoutStatus: 'recovering' });
      
      const { error } = await supabase.functions.invoke('recover-workout', {
        body: { workoutId: state.workoutId }
      });
      
      if (error) {
        console.error("Recovery failed:", error);
        updateState({
          workoutStatus: 'partial',
          savingErrors: [...state.savingErrors, {
            type: 'database',
            message: 'Failed to recover workout data',
            details: error,
            timestamp: new Date().toISOString(),
            recoverable: false
          }]
        });
        
        toast.error("Recovery failed", {
          description: "We couldn't recover your workout data. Please try again.",
        });
        
        return false;
      }
      
      updateState({ 
        workoutStatus: 'saved',
        isRecoveryMode: false,
        savingErrors: [] 
      });
      
      toast("Workout recovered", {
        description: "Your workout data has been successfully recovered.",
      });
      
      return true;
    } catch (error) {
      console.error("Recovery failed:", error);
      updateState({
        workoutStatus: 'partial',
        savingErrors: [...state.savingErrors, {
          type: 'database',
          message: 'Failed to recover workout data',
          details: error,
          timestamp: new Date().toISOString(),
          recoverable: false
        }]
      });
      
      toast.error("Recovery failed", {
        description: "We couldn't recover your workout data. Please try again.",
      });
      
      return false;
    }
  }, [state.workoutId, updateState, state.savingErrors]);

  return {
    exercises,
    setExercises,
    activeExercise,
    setActiveExercise,
    elapsedTime,
    setElapsedTime,
    resetSession,
    restTimerActive,
    setRestTimerActive,
    restTimerResetSignal,
    triggerRestTimerReset,
    currentRestTime,
    setCurrentRestTime,
    workoutStatus: state.workoutStatus,
    isRecoveryMode: state.isRecoveryMode,
    saveProgress: state.saveProgress,
    savingErrors: state.savingErrors,
    workoutId: state.workoutId,
    markAsSaving,
    markAsPartialSave,
    markAsSaved,
    markAsFailed,
    updateSaveProgress,
    attemptRecovery
  };
};
