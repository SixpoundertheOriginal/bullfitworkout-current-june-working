
import { useState, useEffect } from 'react';
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
  const [startTime, setStartTime] = useState<Date>(new Date());
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
  const [lastPersistedTime, setLastPersistedTime] = useState<number>(Date.now());

  // Load workout state from local storage on component mount
  useEffect(() => {
    const savedState = Storage.get(STORAGE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        console.log('Restoring workout state from storage:', parsedState);
        
        // Normalize exercises with proper data structure
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
        
        // Restore other state properties
        if (parsedState.activeExercise) setActiveExercise(parsedState.activeExercise);
        if (parsedState.workoutId) setWorkoutId(parsedState.workoutId);
        if (parsedState.workoutStatus && parsedState.workoutStatus !== 'saved') {
          // Only restore non-saved workout states
          setWorkoutStatus(parsedState.workoutStatus);
        }
        if (parsedState.trainingConfig) setTrainingConfig(parsedState.trainingConfig);
        if (parsedState.lastActiveRoute) setLastActiveRoute(parsedState.lastActiveRoute);
        if (parsedState.restTimerActive !== undefined) setRestTimerActive(parsedState.restTimerActive);
        if (parsedState.currentRestTime !== undefined) setCurrentRestTime(parsedState.currentRestTime);
        
        // Restore elapsed time with time compensation
        if (parsedState.startTime) {
          const storedStartTime = new Date(parsedState.startTime);
          setStartTime(storedStartTime);
          
          // Calculate elapsed time based on stored start time
          if (parsedState.lastPersistedTime) {
            setLastPersistedTime(parsedState.lastPersistedTime);
            
            // Calculate elapsed time accounting for time between sessions
            const storedElapsedTime = parsedState.elapsedTime || 0;
            const timeSinceLastActive = parsedState.isActive ? 
              Math.floor((Date.now() - parsedState.lastPersistedTime) / 1000) : 0;
            
            // Only add time if the workout was active when the user left
            const calculatedElapsedTime = storedElapsedTime + 
              (parsedState.isActive ? timeSinceLastActive : 0);
            
            setElapsedTime(calculatedElapsedTime);
            console.log(`Restored elapsed time: ${calculatedElapsedTime}s (stored: ${storedElapsedTime}s, added: ${timeSinceLastActive}s)`);
          } else {
            setElapsedTime(parsedState.elapsedTime || 0);
          }
        } else if (parsedState.elapsedTime) {
          setElapsedTime(parsedState.elapsedTime);
        }
        
        // Check if there's an active workout to restore based on data presence
        const hasExercises = parsedState.exercises && Object.keys(parsedState.exercises).length > 0;
        const wasActive = parsedState.isActive === true;
        const notSaved = parsedState.workoutStatus !== 'saved';
        
        const shouldBeActive = hasExercises && notSaved && (wasActive || parsedState.elapsedTime > 0);
        console.log(`Determining workout active state: hasExercises=${hasExercises}, wasActive=${wasActive}, notSaved=${notSaved}, shouldBeActive=${shouldBeActive}`);
        
        setIsActive(shouldBeActive);
      } catch (error) {
        console.error('Error parsing saved workout state:', error);
      }
    }
  }, []);

  // Persist workout state to storage whenever relevant state changes
  useEffect(() => {
    // If workout is saved or inactive with no data, remove from storage
    if (workoutStatus === 'saved' || (!isActive && Object.keys(exercises).length === 0)) {
      Storage.remove(STORAGE_KEY);
      console.log('Workout data cleared from storage');
      return;
    }
    
    // Only persist if there's actual workout data or an active session
    if (isActive || Object.keys(exercises).length > 0) {
      const currentTime = Date.now();
      const stateToSave = {
        exercises,
        activeExercise,
        elapsedTime,
        workoutId,
        startTime,
        workoutStatus,
        trainingConfig,
        isActive,
        lastActiveRoute,
        restTimerActive,
        currentRestTime,
        lastPersistedTime: currentTime
      };
      
      Storage.set(STORAGE_KEY, JSON.stringify(stateToSave));
      setLastPersistedTime(currentTime);
      console.log('Workout state persisted to storage', stateToSave);
    }
  }, [
    exercises, activeExercise, elapsedTime, workoutId, 
    workoutStatus, trainingConfig, isActive, lastActiveRoute,
    restTimerActive, currentRestTime, startTime
  ]);

  // Update time periodically for persistence
  useEffect(() => {
    if (isActive) {
      const persistInterval = setInterval(() => {
        const currentTime = Date.now();
        setLastPersistedTime(currentTime);
        
        // Re-save to storage with updated timestamp
        const stateToSave = {
          exercises,
          activeExercise,
          elapsedTime,
          workoutId,
          startTime,
          workoutStatus,
          trainingConfig,
          isActive,
          lastActiveRoute,
          restTimerActive,
          currentRestTime,
          lastPersistedTime: currentTime
        };
        
        Storage.set(STORAGE_KEY, JSON.stringify(stateToSave));
      }, 15000); // Update persistence every 15 seconds
      
      return () => clearInterval(persistInterval);
    }
  }, [
    isActive, exercises, activeExercise, elapsedTime, workoutId, 
    workoutStatus, trainingConfig, lastActiveRoute, restTimerActive, 
    currentRestTime, startTime
  ]);

  const startWorkout = () => {
    const now = new Date();
    setIsActive(true);
    setWorkoutStatus('active');
    setStartTime(now);
    setElapsedTime(0);
    console.log("Workout started at", now);
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
    setStartTime(new Date());
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
    setStartTime,
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
