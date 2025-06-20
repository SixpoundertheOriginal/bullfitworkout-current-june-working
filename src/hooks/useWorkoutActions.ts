
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast as shadToast } from "@/hooks/use-toast";
import { useWorkoutStore } from '@/store/workoutStore';
import { useTrainingTimers } from '@/hooks/useTrainingTimers';
import { useFeedback } from '@/components/training/InteractionFeedback';
import { useEnhancedWorkoutSave } from '@/hooks/useEnhancedWorkoutSave';
import { Exercise, ExerciseSet } from "@/types/exercise";
import { generateWorkoutTemplate, convertTemplateToStoreFormat } from "@/services/workoutTemplateService";

const toast = (options: Parameters<typeof shadToast>[0]) => shadToast(options);

export const useWorkoutActions = () => {
  const navigate = useNavigate();
  const [isAddExerciseSheetOpen, setIsAddExerciseSheetOpen] = useState(false);
  
  const {
    exercises, // Use exercises from workout store directly
    setExercises, // Use setExercises from workout store directly
    activeExercise,
    setActiveExercise,
    elapsedTime,
    workoutStatus,
    workoutId,
    deleteExercise,
    startWorkout,
    trainingConfig,
    isActive,
    setTrainingConfig,
    setWorkoutStatus,
    startTime,
    safeResetWorkout,
    addExercise // Use addExercise from workout store
  } = useWorkoutStore();
  
  const { isSaving, saveWorkoutAsync, isSuccess, error } = useEnhancedWorkoutSave();
  const { handleSetCompletion } = useTrainingTimers();
  const { showFeedback } = useFeedback();
  
  // Fix validation to use exercises from workout store
  const exerciseCount = Object.keys(exercises).length;
  const hasExercises = exerciseCount > 0;
  const hasCompletedSets = Object.values(exercises).some(sets => sets.some(set => set.completed));

  // Define the onAddSet function to add a basic set to an exercise
  const handleAddSet = (exerciseName: string) => {
    setExercises(prev => {
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

  // Enhanced exercise addition with feedback - use workout store's addExercise
  const handleAddExerciseWithFeedback = (exercise: Exercise | string) => {
    const name = typeof exercise === 'string' ? exercise : exercise.name;
    if (exercises[name]) {
      toast({ title: "Exercise already added", description: `${name} is already in your workout.` });
      return;
    }
    
    // Use workout store's addExercise method
    addExercise(name);
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
    setExercises(autoExercises);
    
    const firstExercise = Object.keys(autoExercises)[0];
    if (firstExercise) {
      setActiveExercise(firstExercise);
    }
    
    startWorkout();
    
    toast({
      title: "Workout loaded!",
      description: `${Object.keys(autoExercises).length} exercises ready to go`
    });
  };

  const handleFinishWorkout = async () => {
    console.log('[WorkoutActions] Finish workout clicked');

    // Check if already saving
    if (isSaving) {
      console.log('[WorkoutActions] Save already in progress, ignoring click');
      return;
    }

    // Validate workout has exercises and completed sets - using exercises from workout store
    if (!hasExercises) {
      toast({ 
        title: "No exercises added", 
        description: "Add at least one exercise to finish your workout.", 
        variant: "destructive" 
      });
      return;
    }

    if (!hasCompletedSets) {
      toast({ 
        title: "No sets completed", 
        description: "Complete at least one set to finish your workout.", 
        variant: "destructive" 
      });
      return;
    }

    // Validate required workout metadata
    if (!startTime || !trainingConfig) {
      toast({ 
        title: "Missing workout data", 
        description: "Cannot save workout - missing session information.", 
        variant: "destructive" 
      });
      return;
    }

    try {
      console.log('[WorkoutActions] Starting save with React Query');

      const workoutData = {
        exercises: exercises, // Use exercises from workout store
        duration: elapsedTime,
        startTime: new Date(startTime),
        endTime: new Date(),
        trainingType: trainingConfig.trainingType || "Strength",
        name: trainingConfig.trainingType ? `${trainingConfig.trainingType} Workout` : 'Workout',
        trainingConfig: trainingConfig,
        notes: "",
      };
      
      console.log('[WorkoutActions] Calling saveWorkoutAsync with data:', workoutData);
      const result = await saveWorkoutAsync(workoutData);
      console.log('[WorkoutActions] Save result:', result);
      
      if (result?.success) {
        console.log('[WorkoutActions] Workout saved successfully, navigating to overview');
        
        // Reset workout and navigate after short delay to show success state
        setTimeout(() => {
          safeResetWorkout();
          navigate('/overview');
        }, 2000);
      }
    } catch (saveError) {
      console.error('[WorkoutActions] Save failed with error:', saveError);
      toast({ 
        title: "Error saving workout", 
        description: "There was a problem saving your workout. Please try again.", 
        variant: "destructive" 
      });
    }
  };

  return {
    // State
    isAddExerciseSheetOpen,
    setIsAddExerciseSheetOpen,
    isSaving,
    
    // Actions
    handleAddSet,
    handleCompleteSetWithFeedback,
    handleAddExerciseWithFeedback,
    handleDeleteExerciseWithFeedback,
    handleAutoPopulateWorkout,
    handleFinishWorkout,
    
    // Store state - use exercises from workout store
    exercises,
    setExercises,
    showFeedback,
    
    // Computed values
    hasExercises,
    exerciseCount,
    
    // React Query save states
    isSuccess,
    error
  };
};
