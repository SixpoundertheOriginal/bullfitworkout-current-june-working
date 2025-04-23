
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

interface LocalExerciseSet {
  weight: number;
  reps: number;
  restTime: number;
  completed: boolean;
  isEditing: boolean;
}

export type ExerciseSessionState = Record<string, LocalExerciseSet[]>;

export function useWorkoutState() {
  const [exercises, setExercises] = useState<ExerciseSessionState>({});
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const { user } = useAuth();
  
  // Load state from localStorage on component mount
  useEffect(() => {
    if (!user) return;
    
    try {
      const savedSession = localStorage.getItem(`workout_session_${user.id}`);
      if (savedSession) {
        const session = JSON.parse(savedSession);
        setExercises(session.exercises || {});
        setElapsedTime(session.elapsedTime || 0);
        setActiveExercise(session.activeExercise || null);
        
        console.log("Restored workout session from localStorage:", session);
      }
    } catch (error) {
      console.error("Error loading workout session from localStorage:", error);
    }
  }, [user]);
  
  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (!user) return;
    
    try {
      const sessionData = {
        exercises,
        elapsedTime,
        activeExercise,
        lastUpdated: new Date().toISOString()
      };
      
      localStorage.setItem(`workout_session_${user.id}`, JSON.stringify(sessionData));
    } catch (error) {
      console.error("Error saving workout session to localStorage:", error);
    }
  }, [exercises, elapsedTime, activeExercise, user]);
  
  // Wrapper for setExercises that also updates localStorage
  const updateExercises = (
    exercisesUpdate: ExerciseSessionState | ((prev: ExerciseSessionState) => ExerciseSessionState)
  ) => {
    setExercises(exercisesUpdate);
  };
  
  // Wrapper for setElapsedTime that also updates localStorage
  const updateElapsedTime = (
    timeUpdate: number | ((prev: number) => number)
  ) => {
    setElapsedTime(timeUpdate);
  };
  
  const resetSession = () => {
    if (!user) return;
    
    setExercises({});
    setElapsedTime(0);
    setActiveExercise(null);
    
    localStorage.removeItem(`workout_session_${user.id}`);
    console.log("Workout session reset");
  };
  
  return {
    exercises,
    setExercises: updateExercises,
    activeExercise,
    setActiveExercise,
    elapsedTime,
    setElapsedTime: updateElapsedTime,
    resetSession
  };
}
