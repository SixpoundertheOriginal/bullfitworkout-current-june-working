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
    exercises: storeExercises,
    setExercises: setStoreExercises,
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
    safeResetWorkout
  } = useWorkoutStore();
  
  const { isSaving, saveWorkoutAsync, isSuccess, error } = useEnhancedWorkoutSave();
  const { handleSetCompletion } = useTrainingTimers();
  const { showFeedback } = useFeedback();
  
  const exerciseCount = Object.keys(storeExercises).length;
  const hasExercises = exerciseCount > 0;
  const hasCompletedSets = Object.values(storeExercises).some(sets => sets.some(set => set.completed));

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
    console.log('[WorkoutActions] Finish workout clicked');

    // Check if already saving
    if (isSaving) {
      console.log('[WorkoutActions] Save already in progress, ignoring click');
      return;
    }

    // Validate workout has exercises and completed sets
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
        exercises: storeExercises,
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
    exerciseCount,
    
    // React Query save states
    isSuccess,
    error
  };
};
