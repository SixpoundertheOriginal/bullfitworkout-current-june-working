
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

  // Load workout state from local storage on component mount
  useEffect(() => {
    const savedState = Storage.get(STORAGE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        if (parsedState.exercises) setExercises(parsedState.exercises);
        if (parsedState.activeExercise) setActiveExercise(parsedState.activeExercise);
        if (parsedState.elapsedTime) setElapsedTime(parsedState.elapsedTime);
        if (parsedState.workoutId) setWorkoutId(parsedState.workoutId);
        if (parsedState.workoutStatus) setWorkoutStatus(parsedState.workoutStatus);
        if (parsedState.trainingConfig) setTrainingConfig(parsedState.trainingConfig);
      } catch (error) {
        console.error('Error parsing saved workout state:', error);
      }
    }
  }, []);

  // Save workout state to local storage when it changes
  useEffect(() => {
    if (Object.keys(exercises).length > 0 || activeExercise || elapsedTime > 0 || workoutId) {
      const stateToSave = {
        exercises,
        activeExercise,
        elapsedTime,
        workoutId,
        workoutStatus,
        trainingConfig
      };
      Storage.set(STORAGE_KEY, JSON.stringify(stateToSave));
    }
  }, [exercises, activeExercise, elapsedTime, workoutId, workoutStatus, trainingConfig]);

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
    Storage.remove(STORAGE_KEY);
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
    handleCompleteSet
  };
}
