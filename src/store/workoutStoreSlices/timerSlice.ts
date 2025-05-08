
import { StateCreator } from 'zustand';
import { WorkoutState } from '../workoutStore';

export interface TimerSlice {
  elapsedTime: number;
  restTimerActive: boolean;
  currentRestTime: number;
  setElapsedTime: (time: number | ((prev: number) => number)) => void;
  setRestTimerActive: (active: boolean) => void;
  setCurrentRestTime: (time: number) => void;
}

export const createTimerSlice: StateCreator<
  WorkoutState,
  [],
  [],
  TimerSlice
> = (set) => ({
  elapsedTime: 0,
  restTimerActive: false,
  currentRestTime: 60,
  
  setElapsedTime: (time) => set((state) => ({
    elapsedTime: typeof time === 'function' ? time(state.elapsedTime) : time,
    lastTabActivity: Date.now(),
  })),
  
  setRestTimerActive: (active) => set({
    restTimerActive: active,
    lastTabActivity: Date.now(),
  }),
  
  setCurrentRestTime: (time) => set({
    currentRestTime: time,
    lastTabActivity: Date.now(),
  }),
});
