import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast as shadToast } from "@/hooks/use-toast"; // Renamed to avoid conflict
import { useWorkoutStore } from '@/store/workoutStore';
import { useTrainingTimers } from '@/hooks/useTrainingTimers';
import { useFeedback } from '@/components/training/InteractionFeedback';
import { Exercise, ExerciseSet } from "@/types/exercise";
import { generateWorkoutTemplate, convertTemplateToStoreFormat } from "@/services/workoutTemplateService";

// Make sure to use shadToast for shadcn toasts
const toast = (options: Parameters<typeof shadToast>[0]) => shadToast(options);


export const useWorkoutActions = () => {
  const navigate = useNavigate();
  const [isAddExerciseSheetOpen, setIsAddExerciseSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const {
    exercises: storeExercises,
    setExercises: setStoreExercises,
    activeExercise,
    setActiveExercise,
    elapsedTime,
    workoutStatus,
    markAsSaving,
    markAsFailed,
    workoutId,
    deleteExercise,
    startWorkout,
    trainingConfig,
    isActive,
    setTrainingConfig,
    setWorkoutStatus
  } = useWorkoutStore();
  
  const { handleSetCompletion } = useTrainingTimers();
  const { showFeedback } = useFeedback();
  
  const exerciseCount = Object.keys(storeExercises).length;
  const hasExercises = exerciseCount > 0;

  // Define the onAddSet function to add a basic set to an exercise
  const handleAddSet = (exerciseName: string) => {
    setStoreExercises(prev => {
      const currentSets = prev[exerciseName] || [];
      const newSetNumber = currentSets.length + 1;
      const newSet: ExerciseSet = { 
        id: `${exerciseName}-set-${newSetNumber}-${Date.now()}`, // Unique ID
        weight: 0, 
        reps: 0, 
        duration: '0:00', // Required
        completed: false, 
        volume: 0, // Required (0*0=0)
        restTime: 60, 
        isEditing: true, // Start in editing mode or ready to be filled
        exercise_name: exerciseName,
        set_number: newSetNumber,
      };
      return {
        ...prev,
        [exerciseName]: [...currentSets, newSet]
      };
    });
  };

  // Enhanced set completion with unified timer system
  const handleCompleteSetWithFeedback = (exerciseName: string, setIndex: number) => {
    handleSetCompletion(exerciseName, setIndex);
    showFeedback(
      `Set ${setIndex + 1} completed! Rest timer started 💪`,
      'success'
    );
  };

  // Enhanced exercise addition with feedback
  const handleAddExerciseWithFeedback = (exercise: Exercise | string) => {
    const name = typeof exercise === 'string' ? exercise : exercise.name;
    if (storeExercises[name]) {
      toast({ title: "Exercise already added", description: `${name} is already in your workout.` }); // Use object for toast
      return;
    }
    
    const newSet: ExerciseSet = { 
      id: `${name}-set-1-${Date.now()}`, // Unique ID
      weight: 0, 
      reps: 0, 
      duration: '0:00', // Required
      completed: false, 
      volume: 0, // Required
      restTime: 60, 
      isEditing: true, // Start in editing mode
      exercise_name: name,
      set_number: 1,
    };
    
    setStoreExercises(prev => ({ 
      ...prev, 
      [name]: [newSet] 
    }));
    setActiveExercise(name);
    if (workoutStatus === 'idle') startWorkout();
    setIsAddExerciseSheetOpen(false);
    
    showFeedback(
      `${name} added to workout`,
      'info'
    );
  };

  // Enhanced exercise deletion with feedback
  const handleDeleteExerciseWithFeedback = (exerciseName: string) => {
    deleteExercise(exerciseName);
    showFeedback(
      `${exerciseName} removed from workout`,
      'warning'
    );
  };

  const handleAutoPopulateWorkout = () => {
    if (!trainingConfig) return;
    
    const workoutTemplate = generateWorkoutTemplate(trainingConfig);
    // convertTemplateToStoreFormat now returns Record<string, ExerciseSet[]>
    const autoExercises: Record<string, ExerciseSet[]> = convertTemplateToStoreFormat(workoutTemplate);
    setStoreExercises(autoExercises);
    
    const firstExercise = Object.keys(autoExercises)[0];
    if (firstExercise) {
      setActiveExercise(firstExercise);
    }
    
    startWorkout();
    
    toast({ // Use object for toast
      title: "Workout loaded!",
      description: `${Object.keys(autoExercises).length} exercises ready to go`
    });
  };

  const handleFinishWorkout = async () => {
    if (!hasExercises) {
      toast({ title: "Error", description: "Add at least one exercise before finishing your workout", variant: "destructive" });
      return;
    }
    try {
      setIsSaving(true);
      markAsSaving();
      const now = new Date();
      const startTime = new Date(now.getTime() - elapsedTime * 1000);
      
      // storeExercises is already Record<string, ExerciseSet[]>
      // The structure for WorkoutCompletePage might need adjustment if it's different
      // from the database schema. For now, we assume it matches ExerciseSet closely.
      const convertedExercises: Record<string, ExerciseSet[]> = {};
      Object.entries(storeExercises).forEach(([exerciseName, sets]) => {
        convertedExercises[exerciseName] = sets.map((set, index) => ({
          ...set, // Spread the full ExerciseSet object
          set_number: set.set_number || index + 1, // Ensure set_number
          exercise_name: set.exercise_name || exerciseName, // Ensure exercise_name
          workout_id: set.workout_id || workoutId || 'temp' 
        }));
      });
      
      const [completedSets, totalSets] = Object.entries(storeExercises).reduce(
        ([completed, total], [_, sets]) => [
          completed + sets.filter(s => s.completed).length,
          total + sets.length
        ],
        [0, 0]
      );
      
      const workoutData = {
        exercises: convertedExercises, // This is now Record<string, ExerciseSet[]>
        duration: elapsedTime,
        startTime,
        endTime: now,
        trainingType: trainingConfig?.trainingType || "Strength",
        name: trainingConfig?.trainingType || "Workout",
        trainingConfig: trainingConfig || null,
        notes: "",
        metrics: {
          trainingConfig: trainingConfig || null,
          performance: { completedSets, totalSets, restTimers: { defaultTime: 60, wasUsed: false } },
          progression: {
            timeOfDay: startTime.getHours() < 12 ? 'morning' :
                       startTime.getHours() < 17 ? 'afternoon' : 'evening',
            totalVolume: Object.values(storeExercises).flat().reduce((acc, s) => acc + (s.completed ? s.volume : 0), 0) // Use s.volume
          },
          sessionDetails: { exerciseCount, averageRestTime: 60, workoutDensity: completedSets / (elapsedTime / 60) }
        }
      };
      navigate("/workout-complete", { state: { workoutData } });
    } catch (err) {
      console.error("Error preparing workout data:", err);
      markAsFailed({ type: 'unknown', message: err instanceof Error ? err.message : 'Save failed', timestamp: new Date().toISOString(), recoverable: true });
      toast({ title: "Error", description: "Failed to complete workout", variant: "destructive" });
      setIsSaving(false);
    }
  };

  // Function to handle exercise updates from ExerciseList component
  const handleSetExercises = (updatedExercises: Record<string, ExerciseSet[]> | ((prev: Record<string, ExerciseSet[]>) => Record<string, ExerciseSet[]>)) => {
    if (typeof updatedExercises === 'function') {
      setStoreExercises(prev => updatedExercises(prev));
    } else {
      setStoreExercises(updatedExercises);
    }
  };

  return {
    // State
    isAddExerciseSheetOpen,
    setIsAddExerciseSheetOpen,
    isSaving,
    setIsSaving,
    
    // Actions
    handleAddSet,
    handleCompleteSetWithFeedback,
    handleAddExerciseWithFeedback,
    handleDeleteExerciseWithFeedback,
    handleAutoPopulateWorkout,
    handleFinishWorkout,
    handleSetExercises,
    
    // Store state
    storeExercises,
    setStoreExercises, // Expose setStoreExercises if direct manipulation is needed elsewhere
    showFeedback,
    
    // Computed values
    hasExercises,
    exerciseCount
  };
};
