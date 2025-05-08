
import { StateCreator } from 'zustand';
import { WorkoutState, WorkoutExercises } from '../workoutStore';
import { toast } from "@/hooks/use-toast";

export interface ExerciseSlice {
  exercises: WorkoutExercises;
  activeExercise: string | null;
  setExercises: (exercises: WorkoutExercises | ((prev: WorkoutExercises) => WorkoutExercises)) => void;
  setActiveExercise: (exerciseName: string | null) => void;
  handleCompleteSet: (exerciseName: string, setIndex: number) => void;
  deleteExercise: (exerciseName: string) => void;
}

export const createExerciseSlice: StateCreator<
  WorkoutState,
  [],
  [],
  ExerciseSlice
> = (set, get) => ({
  exercises: {},
  activeExercise: null,
  
  setExercises: (exercises) => set((state) => ({
    exercises: typeof exercises === 'function' ? exercises(state.exercises) : exercises,
    lastTabActivity: Date.now(),
  })),
  
  setActiveExercise: (exerciseName) => set({
    activeExercise: exerciseName,
    lastTabActivity: Date.now(),
  }),
  
  handleCompleteSet: (exerciseName, setIndex) => set((state) => {
    const newExercises = { ...state.exercises };
    newExercises[exerciseName] = state.exercises[exerciseName].map((set, i) =>
      i === setIndex ? { ...set, completed: true } : set
    );
    
    return {
      exercises: newExercises,
      restTimerActive: true,
      lastTabActivity: Date.now(),
    };
  }),
  
  deleteExercise: (exerciseName) => set((state) => {
    const newExercises = { ...state.exercises };
    delete newExercises[exerciseName];
    
    toast.success(`Removed ${exerciseName} from workout`);
    
    // Check if this was the last exercise
    setTimeout(() => {
      const exerciseCount = Object.keys(newExercises).length;
      if (exerciseCount === 0) {
        toast.info("No exercises left. Add exercises or end your workout.", {
          action: {
            label: "End Workout",
            onClick: () => {
              get().endWorkout();
              toast.success("Workout ended");
            }
          }
        });
      }
    }, 500);
    
    return {
      exercises: newExercises,
      lastTabActivity: Date.now(),
    };
  }),
});
