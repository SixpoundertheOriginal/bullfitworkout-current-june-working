
import { StateCreator } from 'zustand';
import { WorkoutState, WorkoutStatus, WorkoutError } from '../workoutStore';
import { toast } from "@/hooks/use-toast";

// Generate a unique session ID
const generateSessionId = () => 
  crypto.randomUUID ? crypto.randomUUID() : `session-${Date.now()}`;

export interface SessionSlice {
  isActive: boolean;
  workoutStatus: WorkoutStatus;
  lastActiveRoute: string;
  sessionId: string;
  explicitlyEnded: boolean;
  lastTabActivity: number;
  workoutId: string | null;
  startTime: string | null;
  savingErrors: WorkoutError[];
  
  updateLastActiveRoute: (route: string) => void;
  setWorkoutStatus: (status: WorkoutStatus) => void;
  startWorkout: () => void;
  endWorkout: () => void;
  resetSession: () => void;
  markAsSaving: () => void;
  markAsSaved: () => void;
  markAsFailed: (error: WorkoutError) => void;
}

export const createSessionSlice: StateCreator<
  WorkoutState,
  [],
  [],
  SessionSlice
> = (set, get) => ({
  isActive: false,
  workoutStatus: 'idle',
  lastActiveRoute: '/training-session',
  sessionId: generateSessionId(),
  explicitlyEnded: false,
  lastTabActivity: Date.now(),
  workoutId: null,
  startTime: null,
  savingErrors: [],
  
  updateLastActiveRoute: (route) => set((state) => {
    if (state.lastActiveRoute !== route) {
      return { 
        lastActiveRoute: route,
        lastTabActivity: Date.now(),
      };
    }
    return {};
  }),
  
  setWorkoutStatus: (status) => set({ 
    workoutStatus: status,
    lastTabActivity: Date.now(),
  }),
  
  startWorkout: () => {
    const now = new Date();
    set({ 
      isActive: true,
      explicitlyEnded: false,
      workoutStatus: 'active',
      startTime: now.toISOString(),
      elapsedTime: 0,
      sessionId: generateSessionId(),
      lastTabActivity: Date.now(),
    });
    
    // Show a toast notification
    toast.success("Workout started", {
      description: "Your workout session has begun"
    });
    
    console.log("Workout started at:", now);
  },
  
  endWorkout: () => {
    set({ 
      isActive: false,
      explicitlyEnded: true,
      workoutStatus: 'idle',
      lastTabActivity: Date.now(),
    });
    console.log("Workout ended");
  },
  
  resetSession: () => {
    set({ 
      exercises: {},
      activeExercise: null,
      elapsedTime: 0,
      workoutId: null,
      startTime: null,
      workoutStatus: 'idle',
      trainingConfig: null,
      restTimerActive: false,
      currentRestTime: 60,
      isActive: false,
      explicitlyEnded: true,
      sessionId: generateSessionId(),
      lastTabActivity: Date.now(),
      savingErrors: [],
    });
    console.log("Workout session reset");
  },
  
  markAsSaving: () => set({ 
    workoutStatus: 'saving',
    lastTabActivity: Date.now(),
  }),
  
  markAsSaved: () => {
    set({ 
      workoutStatus: 'saved',
      isActive: false,
      explicitlyEnded: true,
      lastTabActivity: Date.now(),
    });
    
    // Show success notification
    toast.success("Workout saved successfully!");
    
    // Reset the session after a short delay
    setTimeout(() => {
      get().resetSession();
    }, 500);
  },
  
  markAsFailed: (error) => set((state) => ({ 
    workoutStatus: 'failed',
    savingErrors: [...state.savingErrors, error],
    lastTabActivity: Date.now(),
  })),
});
