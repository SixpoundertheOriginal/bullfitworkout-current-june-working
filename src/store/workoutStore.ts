
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { TrainingConfig } from '@/hooks/useTrainingSetupPersistence';
import React from 'react';
import { createTimerSlice, TimerSlice } from './workoutStoreSlices/timerSlice';
import { createExerciseSlice, ExerciseSlice } from './workoutStoreSlices/exerciseSlice';
import { createSessionSlice, SessionSlice } from './workoutStoreSlices/sessionSlice';
import { createConfigSlice, ConfigSlice } from './workoutStoreSlices/configSlice';

export interface ExerciseSet {
  weight: number;
  reps: number;
  restTime: number;
  completed: boolean;
  isEditing: boolean;
}

export interface WorkoutExercises {
  [key: string]: ExerciseSet[];
}

export type WorkoutStatus = 
  | 'idle'        // Initial state
  | 'active'      // Workout in progress
  | 'saving'      // Saving in progress
  | 'saved'       // Successfully saved
  | 'failed'      // Save failed
  | 'partial'     // Partially saved
  | 'recovering'; // Attempting recovery

export interface WorkoutError {
  type: 'network' | 'database' | 'validation' | 'unknown';
  message: string;
  timestamp: string;
  recoverable: boolean;
}

// Combine all slices into a single state type
export interface WorkoutState extends 
  TimerSlice, 
  ExerciseSlice, 
  SessionSlice, 
  ConfigSlice {}

// Create the persistent store with all slices
export const useWorkoutStore = create<WorkoutState>()(
  persist(
    (set, get, ...rest) => ({
      ...createTimerSlice(set, get, ...rest),
      ...createExerciseSlice(set, get, ...rest),
      ...createSessionSlice(set, get, ...rest),
      ...createConfigSlice(set, get, ...rest),
    }),
    {
      name: 'workout-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these specific parts of the state
        exercises: state.exercises,
        activeExercise: state.activeExercise,
        elapsedTime: state.elapsedTime,
        workoutId: state.workoutId,
        startTime: state.startTime,
        workoutStatus: state.workoutStatus,
        trainingConfig: state.trainingConfig,
        isActive: state.isActive,
        lastActiveRoute: state.lastActiveRoute,
        sessionId: state.sessionId,
        explicitlyEnded: state.explicitlyEnded,
      }),
      onRehydrateStorage: () => {
        return (rehydratedState, error) => {
          if (error) {
            console.error('Error rehydrating workout state:', error);
            return;
          }
          
          if (rehydratedState && rehydratedState.isActive) {
            console.log('Rehydrated workout state:', rehydratedState);
            
            // Update elapsed time based on stored start time for active workouts
            if (rehydratedState.isActive && rehydratedState.startTime) {
              const storedStartTime = new Date(rehydratedState.startTime);
              const currentTime = new Date();
              const calculatedElapsedTime = Math.floor(
                (currentTime.getTime() - storedStartTime.getTime()) / 1000
              );
              
              // Only update if calculated time is greater than stored time
              if (calculatedElapsedTime > (rehydratedState.elapsedTime || 0)) {
                setTimeout(() => {
                  // Using the Zustand store's set function through the get() method
                  const store = useWorkoutStore.getState();
                  store.setElapsedTime(calculatedElapsedTime);
                  console.log(`Restored elapsed time: ${calculatedElapsedTime}s`);
                }, 100);
              }
              
              // Show recovery notification
              setTimeout(() => {
                const { toast } = require('@/hooks/use-toast');
                toast.info("Workout session recovered");
              }, 1000);
            }
          }
        };
      }
    }
  )
);

// Create a hook for handling page visibility changes
export const useWorkoutPageVisibility = () => {
  const { isActive, setElapsedTime, startTime } = useWorkoutStore();
  
  React.useEffect(() => {
    if (!document || !isActive) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive) {
        // When tab becomes visible again, update elapsed time
        if (startTime) {
          const storedStartTime = new Date(startTime);
          const currentTime = new Date();
          const calculatedElapsedTime = Math.floor(
            (currentTime.getTime() - storedStartTime.getTime()) / 1000
          );
          
          setElapsedTime(calculatedElapsedTime);
          console.log(`Updated elapsed time after tab switch: ${calculatedElapsedTime}s`);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isActive, setElapsedTime, startTime]);
};
