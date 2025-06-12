
import { create } from 'zustand';

interface WorkoutState {
  isActive: boolean;
  startTime: string | null;
  elapsedTime: number;
  setElapsedTime: (time: number) => void;
  startWorkout: () => void;
  endWorkout: () => void;
  handleCompleteSet: (exerciseName: string, setIndex: number) => void;
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  isActive: false,
  startTime: null,
  elapsedTime: 0,
  setElapsedTime: (time: number) => set({ elapsedTime: time }),
  startWorkout: () => set({ 
    isActive: true, 
    startTime: new Date().toISOString(),
    elapsedTime: 0 
  }),
  endWorkout: () => set({ 
    isActive: false, 
    startTime: null,
    elapsedTime: 0 
  }),
  handleCompleteSet: (exerciseName: string, setIndex: number) => {
    console.log(`Set completed: ${exerciseName} set ${setIndex + 1}`);
  }
}));
