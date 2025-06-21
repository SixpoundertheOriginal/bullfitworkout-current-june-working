import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast as shadToast } from "@/hooks/use-toast";
import { useWorkoutStore } from '@/store/workoutStore';
import { useTrainingTimers } from '@/hooks/useTrainingTimers';
import { useFeedback } from '@/components/training/InteractionFeedback';
import { useEnhancedWorkoutSave } from '@/hooks/useEnhancedWorkoutSave';
import { useModal } from '@/hooks/useModal';
import { Exercise, ExerciseSet } from "@/types/exercise";
import { generateWorkoutTemplate, convertTemplateToStoreFormat } from "@/services/workoutTemplateService";

const toast = (options: Parameters<typeof shadToast>[0]) => shadToast(options);

export const useWorkoutActions = () => {
  const navigate = useNavigate();
  const [isAddExerciseSheetOpen, setIsAddExerciseSheetOpen] = useState(false);
  
  const {
    exercises,
    setExercises,
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
    addExercise
  } = useWorkoutStore();
  
  const { isSaving, saveWorkoutAsync, isSuccess, error } = useEnhancedWorkoutSave();
  const { handleSetCompletion } = useTrainingTimers();
  const { showFeedback } = useFeedback();
  
  // Completion dialog state
  const {
    isOpen: isCompletionDialogOpen,
    openModal: openCompletionDialog,
    closeModal: closeCompletionDialog
  } = useModal();
  
  // Fix validation to use exercises from workout store
  const exerciseCount = Object.keys(exercises).length;
  const hasExercises = exerciseCount > 0;
  const hasCompletedSets = Object.values(exercises).some(sets => sets.some(set => set.completed));
  const completedSetsCount = Object.values(exercises).reduce((total, sets) => 
    total + sets.filter(set => set.completed).length, 0
  );

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

  // Main finish workout handler - now opens completion dialog
  const handleFinishWorkout = () => {
    console.log('[WorkoutActions] Finish workout clicked - opening completion dialog');
    openCompletionDialog();
  };

  // Save workout with completed sets (normal save)
  const handleSaveWorkout = async () => {
    console.log('[WorkoutActions] Saving completed workout');
    await performWorkoutSave(false);
  };

  // Save workout as draft (allows incomplete workouts)
  const handleSaveAsDraft = async () => {
    console.log('[WorkoutActions] Saving workout as draft');
    await performWorkoutSave(true);
  };

  // Discard workout completely
  const handleDiscardWorkout = () => {
    console.log('[WorkoutActions] Discarding workout');
    safeResetWorkout();
    showFeedback('Workout discarded', 'info');
    navigate('/overview');
  };

  // Continue working out (close dialog)
  const handleContinueWorkout = () => {
    console.log('[WorkoutActions] Continuing workout');
    showFeedback('Keep going! 💪', 'success');
  };

  // Core save logic (extracted for reuse)
  const performWorkoutSave = async (isDraft: boolean = false) => {
    console.log('[WorkoutActions] Starting save process', { isDraft });

    // Check if already saving
    if (isSaving) {
      console.log('[WorkoutActions] Save already in progress, ignoring click');
      return;
    }

    // Only validate critical metadata - removed blocking validations
    if (!startTime) {
      console.log('[WorkoutActions] VALIDATION FAILED: No start time');
      // Auto-generate start time if missing
      const estimatedStartTime = Date.now() - (elapsedTime * 1000);
      console.log('[WorkoutActions] Auto-generating start time:', new Date(estimatedStartTime));
    }

    if (!trainingConfig) {
      console.log('[WorkoutActions] VALIDATION FAILED: No training config');
      // Auto-generate basic config if missing
      const autoConfig = {
        trainingType: hasExercises ? "General" : "Quick Session",
        tags: [],
        duration: 60
      };
      setTrainingConfig(autoConfig);
      console.log('[WorkoutActions] Auto-generated training config:', autoConfig);
    }

    console.log('[WorkoutActions] Proceeding with save');

    try {
      const workoutData = {
        exercises: exercises,
        duration: elapsedTime,
        startTime: new Date(startTime || Date.now() - (elapsedTime * 1000)),
        endTime: new Date(),
        trainingType: trainingConfig?.trainingType || "General",
        name: isDraft 
          ? `${trainingConfig?.trainingType || 'General'} Draft` 
          : `${trainingConfig?.trainingType || 'General'} Workout`,
        trainingConfig: trainingConfig,
        notes: isDraft ? "Saved as draft - incomplete workout" : "",
        metadata: {
          isDraft,
          completedSetsCount,
          exerciseCount
        }
      };
      
      console.log('[WorkoutActions] Calling saveWorkoutAsync with data:', workoutData);
      const result = await saveWorkoutAsync(workoutData);
      console.log('[WorkoutActions] Save result:', result);
      
      if (result?.success) {
        console.log('[WorkoutActions] Workout saved successfully, navigating to overview');
        
        // Show appropriate success message
        if (isDraft) {
          toast({
            title: "Draft saved!",
            description: "Your workout progress has been saved as a draft."
          });
        } else {
          toast({
            title: "Workout completed!",
            description: "Great job! Your workout has been saved."
          });
        }
        
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
    isCompletionDialogOpen,
    closeCompletionDialog,
    
    // Actions
    handleAddSet,
    handleCompleteSetWithFeedback,
    handleAddExerciseWithFeedback,
    handleDeleteExerciseWithFeedback,
    handleAutoPopulateWorkout,
    handleFinishWorkout,
    handleSaveWorkout,
    handleSaveAsDraft,
    handleDiscardWorkout,
    handleContinueWorkout,
    
    // Store state
    exercises,
    setExercises,
    showFeedback,
    
    // Computed values
    hasExercises,
    exerciseCount,
    completedSetsCount,
    
    // React Query save states
    isSuccess,
    error
  };
};
