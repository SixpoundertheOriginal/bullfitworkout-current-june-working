
import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { Storage } from '@/utils/storage';
import { WorkoutStatus, WorkoutError } from '@/types/workout';
import { TrainingConfig } from './useTrainingSetupPersistence';
import { toast } from "@/components/ui/sonner";

export interface ExerciseSet {
  weight: number;
  reps: number;
  restTime: number;
  completed: boolean;
  isEditing: boolean; // Changed from optional to required to match EnhancedExerciseSet
}

export interface WorkoutExercises {
  [key: string]: ExerciseSet[];
}

export function useWorkoutState() {
  const STORAGE_KEY = 'workout_in_progress';

  const [exercises, setExercises] = useState<WorkoutExercises>({});
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [startTime] = useState(new Date());
  const [recoveryAttempted, setRecoveryAttempted] = useState(false);
  const [workoutStatus, setWorkoutStatus] = useState<WorkoutStatus>('idle');
  const [saveProgress, setSaveProgress] = useState<number>(0);
  const [errorDetails, setErrorDetails] = useState<WorkoutError | null>(null);
  const [trainingConfig, setTrainingConfig] = useState<TrainingConfig | null>(null);
  const [restTimerActive, setRestTimerActive] = useState(false);
  const [restTimerResetSignal, setRestTimerResetSignal] = useState(0);
  const [currentRestTime, setCurrentRestTime] = useState(60);
  const [isActive, setIsActive] = useState(false);
  const [lastActiveRoute, setLastActiveRoute] = useState<string | null>('/training-session');

  // Load workout state from local storage on component mount
  useEffect(() => {
    const savedState = Storage.get(STORAGE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        
        // Ensure all sets have the isEditing property
        if (parsedState.exercises) {
          const normalizedExercises: WorkoutExercises = {};
          Object.entries(parsedState.exercises).forEach(([name, sets]) => {
            normalizedExercises[name] = (sets as any[]).map(set => ({
              ...set,
              isEditing: set.isEditing === undefined ? false : set.isEditing
            }));
          });
          setExercises(normalizedExercises);
        }
        
        if (parsedState.activeExercise) setActiveExercise(parsedState.activeExercise);
        if (parsedState.elapsedTime) setElapsedTime(parsedState.elapsedTime);
        if (parsedState.workoutId) setWorkoutId(parsedState.workoutId);
        if (parsedState.workoutStatus && parsedState.workoutStatus !== 'saved') {
          // Only restore non-saved workout states
          setWorkoutStatus(parsedState.workoutStatus);
        }
        if (parsedState.trainingConfig) setTrainingConfig(parsedState.trainingConfig);
        if (parsedState.isActive !== undefined) setIsActive(parsedState.isActive);
        if (parsedState.lastActiveRoute) setLastActiveRoute(parsedState.lastActiveRoute);
      } catch (error) {
        console.error('Error parsing saved workout state:', error);
      }
    }

    // Check if there's an active workout to restore
    const hasActiveWorkout = Object.keys(exercises).length > 0 && elapsedTime > 0 && workoutStatus !== 'saved';
    setIsActive(hasActiveWorkout);
  }, []);

  // Save workout state to local storage when it changes
  useEffect(() => {
    if (workoutStatus === 'saved') {
      // If workout is saved, remove it from storage
      Storage.remove(STORAGE_KEY);
      return;
    }
    
    if (isActive || Object.keys(exercises).length > 0 || activeExercise || elapsedTime > 0 || workoutId) {
      const stateToSave = {
        exercises,
        activeExercise,
        elapsedTime,
        workoutId,
        workoutStatus,
        trainingConfig,
        isActive,
        lastActiveRoute
      };
      Storage.set(STORAGE_KEY, JSON.stringify(stateToSave));
    } else {
      // If no workout data, remove from storage
      Storage.remove(STORAGE_KEY);
    }
  }, [exercises, activeExercise, elapsedTime, workoutId, workoutStatus, trainingConfig, isActive, lastActiveRoute]);

  const startWorkout = () => {
    setIsActive(true);
    setWorkoutStatus('active');
    setElapsedTime(0);
    console.log("Workout started");
  };

  const endWorkout = () => {
    setIsActive(false);
    setWorkoutStatus('idle');
    console.log("Workout ended");
  };

  const resetSession = () => {
    setExercises({});
    setActiveExercise(null);
    setElapsedTime(0);
    setWorkoutId(null);
    setWorkoutStatus('idle');
    setErrorDetails(null);
    setSaveProgress(0);
    setRecoveryAttempted(false);
    setRestTimerActive(false);
    setCurrentRestTime(60);
    setTrainingConfig(null);
    setIsActive(false);
    setLastActiveRoute('/training-session');
    Storage.remove(STORAGE_KEY);
    console.log("Workout session reset");
  };

  const updateLastActiveRoute = (route: string) => {
    setLastActiveRoute(route);
  };

  const markAsSaving = () => {
    setWorkoutStatus('saving');
    setSaveProgress(10);
  };

  const markAsPartialSave = () => {
    setWorkoutStatus('partial');
    setSaveProgress(50);
  };

  const markAsFailed = (error: WorkoutError) => {
    setWorkoutStatus('failed');
    setErrorDetails(error);
    setSaveProgress(0);
  };

  const markAsSaved = () => {
    setWorkoutStatus('saved');
    setSaveProgress(100);
    setIsActive(false);
    
    // Important: When marking as saved, clear the storage immediately
    Storage.remove(STORAGE_KEY);
    
    // Show a toast notification
    toast.success("Workout saved successfully!");
    
    // Reset the session state after a short delay to ensure UI updates properly
    setTimeout(() => {
      resetSession();
    }, 500);
  };

  const attemptRecovery = async () => {
    if (recoveryAttempted) {
      console.warn('Recovery already attempted');
      return;
    }
    
    setRecoveryAttempted(true);
    setWorkoutStatus('saving');
    setSaveProgress(5);
    
    // Here you'd implement actual recovery logic, e.g. retry saving to DB
    console.log('Attempting to recover workout', workoutId);
    
    // For now, just marking as recovered after a delay
    setTimeout(() => {
      // Instead of using an invalid status, use the 'saved' status
      setWorkoutStatus('saved');
      setSaveProgress(100);
      setIsActive(false);
      
      // Reset session after recovery
      resetSession();
    }, 2000);
  };

  const triggerRestTimerReset = () => {
    setRestTimerResetSignal(prev => prev + 1);
  };

  const handleCompleteSet = (exerciseName: string, setIndex: number) => {
    setExercises(prev => {
      const newExercises = { ...prev };
      newExercises[exerciseName] = prev[exerciseName].map((set, i) => 
        i === setIndex ? { ...set, completed: true } : set
      );
      return newExercises;
    });
    
    // Automatically show rest timer when set is completed
    setRestTimerActive(true);
    triggerRestTimerReset();
  };

  const deleteExercise = (exerciseName: string) => {
    setExercises(prev => {
      const newExercises = { ...prev };
      delete newExercises[exerciseName];
      return newExercises;
    });
    toast.success(`Removed ${exerciseName} from workout`);
  };

  return {
    exercises,
    setExercises,
    activeExercise,
    setActiveExercise,
    elapsedTime,
    setElapsedTime,
    workoutId,
    setWorkoutId,
    startTime,
    resetSession,
    workoutStatus,
    saveProgress,
    errorDetails,
    attemptRecovery,
    recoveryAttempted,
    markAsSaving,
    markAsPartialSave,
    markAsSaved,
    markAsFailed,
    trainingConfig,
    setTrainingConfig,
    restTimerActive,
    setRestTimerActive,
    restTimerResetSignal,
    triggerRestTimerReset,
    currentRestTime,
    setCurrentRestTime,
    handleCompleteSet,
    deleteExercise,
    isActive,
    setIsActive,
    startWorkout,
    endWorkout,
    lastActiveRoute,
    updateLastActiveRoute
  };
}
