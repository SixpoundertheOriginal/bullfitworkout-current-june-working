
import { useState, useCallback } from 'react';
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { saveWorkout, processRetryQueue, recoverPartiallyCompletedWorkout } from "@/services/workoutSaveService";
import { WorkoutError, EnhancedExerciseSet } from "@/types/workout";
import { ExerciseSet } from '@/hooks/useWorkoutState';
import { useWorkoutSaveProgress } from './useWorkoutSaveProgress';
import { useWorkoutDraftSave } from './useWorkoutDraftSave';

export const useWorkoutSave = (exercises: Record<string, ExerciseSet[]>, elapsedTime: number, resetSession: () => void) => {
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const { user } = useAuth();
  
  const saveProgress = useWorkoutSaveProgress();
  const draftSave = useWorkoutDraftSave(
    // Convert to EnhancedExerciseSet format for draft saving
    Object.fromEntries(
      Object.entries(exercises).map(([name, sets]) => [
        name, 
        sets.map(set => ({
          ...set,
          volume: (set.weight || 0) * (set.reps || 0)
        }))
      ])
    ),
    elapsedTime
  );

  const handleCompleteWorkout = async (trainingConfig?: any): Promise<string | null> => {
    if (!Object.keys(exercises).length) {
      toast({
        title: "No exercises added",
        description: "Please add at least one exercise before completing your workout",
        variant: "destructive"
      });
      return null;
    }
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to save workouts",
        variant: "destructive"
      });
      return null;
    }

    const performSave = async (): Promise<string | null> => {
      try {
        saveProgress.startSave();
        
        const now = new Date();
        const startTime = new Date(now.getTime() - elapsedTime * 1000);
        
        // Format data for the workout save service
        const workoutData = {
          name: trainingConfig?.trainingType ? `${trainingConfig.trainingType} Workout` : `Workout ${now.toLocaleDateString()}`,
          training_type: trainingConfig?.trainingType || 'strength',
          start_time: startTime.toISOString(),
          end_time: now.toISOString(),
          duration: elapsedTime || 0,
          notes: null,
          metadata: trainingConfig ? JSON.stringify({ trainingConfig }) : null
        };
        
        console.log("Saving workout with data:", workoutData);
        
        // Convert ExerciseSet to EnhancedExerciseSet with proper volume calculation
        const enhancedExercises: Record<string, EnhancedExerciseSet[]> = {};
        Object.entries(exercises).forEach(([exerciseName, sets]) => {
          enhancedExercises[exerciseName] = sets.map(set => ({
            ...set,
            isEditing: set.isEditing === undefined ? false : set.isEditing,
            volume: (set.weight || 0) * (set.reps || 0) // Calculate volume for save
          }));
        });
        
        saveProgress.markValidating();
        
        const saveResult = await saveWorkout({
          userData: user,
          workoutData,
          exercises: enhancedExercises,
          onProgressUpdate: saveProgress.updateProgress
        });
        
        if (saveResult.success) {
          const savedWorkoutId = saveResult.workoutId || '';
          setWorkoutId(savedWorkoutId);
          
          if (saveResult.partialSave) {
            // Schedule auto-retry for partial saves
            saveProgress.scheduleAutoRetry(() => performSave());
            return savedWorkoutId;
          } else {
            saveProgress.markComplete();
            draftSave.clearDraft(); // Clear draft on successful save
            resetSession();
            return savedWorkoutId;
          }
        } else {
          const error = saveResult.error || {
            type: 'unknown' as const,
            message: 'Unknown error during save',
            timestamp: new Date().toISOString(),
            recoverable: false
          };
          
          saveProgress.markFailed(error);
          
          // Schedule auto-retry for recoverable errors
          if (error.recoverable) {
            saveProgress.scheduleAutoRetry(() => performSave());
          }
          
          return null;
        }
      } catch (error) {
        const saveError: WorkoutError = {
          type: 'unknown',
          message: error instanceof Error ? error.message : 'Unknown error occurred',
          timestamp: new Date().toISOString(),
          recoverable: true
        };
        
        saveProgress.markFailed(saveError);
        saveProgress.scheduleAutoRetry(() => performSave());
        
        return null;
      }
    };

    return performSave();
  };

  const attemptRecovery = useCallback(async (recoveryWorkoutId: string) => {
    try {
      saveProgress.startSave();
      
      const { success, error } = await recoverPartiallyCompletedWorkout(recoveryWorkoutId);
      
      if (!success) {
        const recoveryError = error || {
          type: 'database' as const,
          message: 'Failed to recover workout data',
          timestamp: new Date().toISOString(),
          recoverable: false
        };
        
        saveProgress.markFailed(recoveryError);
        return false;
      }
      
      if (user?.id) {
        await processRetryQueue(user.id);
      }
      
      saveProgress.markComplete();
      return true;
    } catch (error) {
      const recoveryError: WorkoutError = {
        type: 'database',
        message: 'Failed to recover workout data',
        details: error,
        timestamp: new Date().toISOString(),
        recoverable: false
      };
      
      saveProgress.markFailed(recoveryError);
      return false;
    }
  }, [user, saveProgress]);

  const retryCurrentSave = useCallback(() => {
    saveProgress.retry(() => handleCompleteWorkout());
  }, [saveProgress]);

  const saveLater = useCallback(() => {
    draftSave.saveDraft();
    saveProgress.reset();
    
    toast({
      title: "Workout saved as draft",
      description: "You can complete the save later from your drafts",
      variant: "default"
    });
  }, [draftSave, saveProgress]);

  return {
    // Save progress state
    saveStatus: saveProgress.status,
    saveProgress: saveProgress.progress,
    savingErrors: saveProgress.progress?.errors || [],
    retryCount: saveProgress.retryCount,
    canRetry: saveProgress.canRetry,
    workoutId,
    
    // Save actions
    handleCompleteWorkout,
    attemptRecovery,
    retryCurrentSave,
    saveLater,
    
    // Draft functionality
    ...draftSave,
    
    // Progress control
    enableAutoRetry: saveProgress.enableAutoRetry,
    disableAutoRetry: saveProgress.disableAutoRetry,
    resetSaveProgress: saveProgress.reset
  };
};
