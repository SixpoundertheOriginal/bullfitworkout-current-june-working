
import { create } from 'zustand';
import { WorkoutStatus, EnhancedExerciseSet } from '@/types/workout';

interface TrainingConfig {
  trainingType: string;
  tags: string[];
  duration: number;
  rankedExercises?: {
    recommended: any[];
    other: any[];
    matchData: Record<string, { score: number, reasons: string[] }>;
  };
  timeOfDay?: string;
  intensity?: number;
}

interface WorkoutState {
  isActive: boolean;
  startTime: string | null;
  elapsedTime: number;
  exercises: Record<string, EnhancedExerciseSet[]>;
  workoutStatus: WorkoutStatus;
  explicitlyEnded: boolean;
  sessionId: string | null;
  trainingConfig: TrainingConfig | null;
  lastActiveRoute: string | null;
  
  // Actions
  setElapsedTime: (time: number) => void;
  startWorkout: () => void;
  endWorkout: () => void;
  handleCompleteSet: (exerciseName: string, setIndex: number) => void;
  resetSession: () => void;
  setTrainingConfig: (config: TrainingConfig) => void;
  updateLastActiveRoute: (route: string) => void;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  isActive: false,
  startTime: null,
  elapsedTime: 0,
  exercises: {},
  workoutStatus: 'idle',
  explicitlyEnded: false,
  sessionId: null,
  trainingConfig: null,
  lastActiveRoute: null,

  setElapsedTime: (time: number) => set({ elapsedTime: time }),
  
  startWorkout: () => set({ 
    isActive: true, 
    startTime: new Date().toISOString(),
    elapsedTime: 0,
    workoutStatus: 'active',
    explicitlyEnded: false,
    sessionId: Math.random().toString(36).substring(2, 9)
  }),
  
  endWorkout: () => set({ 
    isActive: false, 
    startTime: null,
    elapsedTime: 0,
    workoutStatus: 'saved',
    explicitlyEnded: true
  }),
  
  handleCompleteSet: (exerciseName: string, setIndex: number) => {
    console.log(`Set completed: ${exerciseName} set ${setIndex + 1}`);
  },
  
  resetSession: () => set({
    isActive: false,
    startTime: null,
    elapsedTime: 0,
    exercises: {},
    workoutStatus: 'idle',
    explicitlyEnded: false,
    sessionId: null,
    trainingConfig: null
  }),
  
  setTrainingConfig: (config: TrainingConfig) => set({ trainingConfig: config }),
  
  updateLastActiveRoute: (route: string) => set({ lastActiveRoute: route })
}));
