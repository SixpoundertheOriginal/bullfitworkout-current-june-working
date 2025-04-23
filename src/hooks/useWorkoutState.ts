
import { useState, useEffect, useCallback } from 'react';

export interface LocalExerciseSet {
  weight: number;
  reps: number;
  restTime: number;
  completed: boolean;
  isEditing: boolean;
}

export const useWorkoutState = () => {
  const [exercises, setExercises] = useState<Record<string, LocalExerciseSet[]>>({});
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [restTimerActive, setRestTimerActive] = useState(false);
  const [restTimerResetSignal, setRestTimerResetSignal] = useState(0);
  const [currentRestTime, setCurrentRestTime] = useState(60);
  
  // Load workout state from localStorage if it exists
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}')?.currentSession?.user;
    if (!user?.id) return;
    
    const savedWorkout = localStorage.getItem(`workout_session_${user.id}`);
    if (savedWorkout) {
      const parsed = JSON.parse(savedWorkout);
      if (parsed.exercises) setExercises(parsed.exercises);
      if (parsed.activeExercise) setActiveExercise(parsed.activeExercise);
      if (parsed.elapsedTime) setElapsedTime(parsed.elapsedTime);
    }
  }, []);
  
  // Save workout state to localStorage when it changes
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}')?.currentSession?.user;
    if (!user?.id) return;
    
    localStorage.setItem(`workout_session_${user.id}`, JSON.stringify({
      exercises,
      activeExercise,
      elapsedTime,
      lastUpdated: new Date().toISOString()
    }));
  }, [exercises, activeExercise, elapsedTime]);
  
  const resetSession = useCallback(() => {
    setExercises({});
    setActiveExercise(null);
    setElapsedTime(0);
    setRestTimerActive(false);
    
    const user = JSON.parse(localStorage.getItem('supabase.auth.token') || '{}')?.currentSession?.user;
    if (user?.id) {
      localStorage.removeItem(`workout_session_${user.id}`);
    }
  }, []);
  
  const triggerRestTimerReset = useCallback((restTime?: number) => {
    // Update current rest time if provided
    if (restTime && restTime > 0) {
      setCurrentRestTime(restTime);
    }
    
    // Increment the reset signal to trigger the timer reset
    setRestTimerResetSignal(prev => prev + 1);
  }, []);
  
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
    currentRestTime
  };
};
