
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "@/hooks/use-toast";
import { useWorkoutStore } from '@/store/workoutStore';
import { useTrainingTimers } from '@/hooks/useTrainingTimers';
import { useFeedback } from '@/components/training/InteractionFeedback';
import { Exercise, ExerciseSet } from "@/types/exercise";
import { generateWorkoutTemplate, convertTemplateToStoreFormat } from "@/services/workoutTemplateService";

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
    setStoreExercises(prev => ({
      ...prev,
      [exerciseName]: [...prev[exerciseName], { 
        id: `${exerciseName}-${prev[exerciseName].length + 1}`,
        weight: 0, 
        reps: 0, 
        restTime: 60, 
        completed: false, 
        isEditing: false,
        volume: 0,
        duration: '0:00'
      } as ExerciseSet]
    }));
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
      toast({ title: "Exercise already added", description: `${name} is already in your workout` });
      return;
    }
    setStoreExercises(prev => ({ 
      ...prev, 
      [name]: [{ 
        id: `${name}-1`,
        weight: 0, 
        reps: 0, 
        restTime: 60, 
        completed: false, 
        isEditing: false,
        volume: 0,
        duration: '0:00'
      } as ExerciseSet] 
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
    const autoExercises = convertTemplateToStoreFormat(workoutTemplate);
    setStoreExercises(autoExercises);
    
    // Set the first exercise as active
    const firstExercise = Object.keys(autoExercises)[0];
    if (firstExercise) {
      setActiveExercise(firstExercise);
    }
    
    // Start the workout
    startWorkout();
    
    toast({
      title: "Workout loaded!",
      description: `${Object.keys(autoExercises).length} exercises ready to go`
    });
  };

  const handleFinishWorkout = async () => {
    if (!hasExercises) {
      toast.error("Add at least one exercise before finishing your workout");
      return;
    }
    try {
      setIsSaving(true);
      markAsSaving();
      const now = new Date();
      const startTime = new Date(now.getTime() - elapsedTime * 1000);
      
      // Convert store exercise format to the format expected by WorkoutCompletePage
      const convertedExercises: Record<string, any[]> = {};
      Object.entries(storeExercises).forEach(([exerciseName, sets]) => {
        convertedExercises[exerciseName] = sets.map((set, index) => ({
          id: `${exerciseName}_${index}`,
          weight: set.weight,
          reps: set.reps,
          restTime: set.restTime,
          completed: set.completed,
          isEditing: set.isEditing,
          set_number: index + 1,
          exercise_name: exerciseName,
          workout_id: workoutId || 'temp'
        }));
      });
      
      // Calculate completed sets and total sets
      const [completedSets, totalSets] = Object.entries(storeExercises).reduce(
        ([completed, total], [_, sets]) => [
          completed + sets.filter(s => s.completed).length,
          total + sets.length
        ],
        [0, 0]
      );
      
      const workoutData = {
        exercises: convertedExercises,
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
            totalVolume: Object.values(storeExercises).flat().reduce((acc, s) => acc + (s.completed ? s.weight * s.reps : 0), 0)
          },
          sessionDetails: { exerciseCount, averageRestTime: 60, workoutDensity: completedSets / (elapsedTime / 60) }
        }
      };
      navigate("/workout-complete", { state: { workoutData } });
    } catch (err) {
      console.error("Error preparing workout data:", err);
      markAsFailed({ type: 'unknown', message: err instanceof Error ? err.message : 'Save failed', timestamp: new Date().toISOString(), recoverable: true });
      toast.error("Failed to complete workout");
      setIsSaving(false);
    }
  };

  // Function to handle exercise updates from ExerciseList component
  const handleSetExercises = (updatedExercises: any) => {
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
    setStoreExercises,
    showFeedback,
    
    // Computed values
    hasExercises,
    exerciseCount
  };
};
