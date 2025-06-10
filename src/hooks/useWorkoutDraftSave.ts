
import { useEffect, useCallback, useRef } from 'react';
import { EnhancedExerciseSet } from '@/types/workout';
import { workoutLogger } from '@/services/workoutLogger';

interface WorkoutDraft {
  timestamp: string;
  exercises: Record<string, EnhancedExerciseSet[]>;
  elapsedTime: number;
  trainingConfig?: any;
}

export const useWorkoutDraftSave = (
  exercises: Record<string, EnhancedExerciseSet[]>,
  elapsedTime: number,
  trainingConfig?: any
) => {
  const saveIntervalRef = useRef<NodeJS.Timeout>();
  const lastSaveRef = useRef<string>('');

  const saveDraft = useCallback(() => {
    try {
      const draft: WorkoutDraft = {
        timestamp: new Date().toISOString(),
        exercises,
        elapsedTime,
        trainingConfig
      };

      const draftString = JSON.stringify(draft);
      
      // Only save if data has changed
      if (draftString !== lastSaveRef.current) {
        localStorage.setItem('workout_draft', draftString);
        lastSaveRef.current = draftString;
        
        workoutLogger.logInfo('Workout draft saved', {
          exerciseCount: Object.keys(exercises).length,
          elapsedTime
        });
      }
    } catch (error) {
      workoutLogger.logError('Failed to save workout draft', error);
    }
  }, [exercises, elapsedTime, trainingConfig]);

  const loadDraft = useCallback((): WorkoutDraft | null => {
    try {
      const draftString = localStorage.getItem('workout_draft');
      if (!draftString) return null;

      const draft: WorkoutDraft = JSON.parse(draftString);
      
      // Check if draft is recent (within 24 hours)
      const draftAge = Date.now() - new Date(draft.timestamp).getTime();
      if (draftAge > 24 * 60 * 60 * 1000) {
        clearDraft();
        return null;
      }

      return draft;
    } catch (error) {
      workoutLogger.logError('Failed to load workout draft', error);
      return null;
    }
  }, []);

  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem('workout_draft');
      lastSaveRef.current = '';
      workoutLogger.logInfo('Workout draft cleared');
    } catch (error) {
      workoutLogger.logError('Failed to clear workout draft', error);
    }
  }, []);

  const hasDraft = useCallback((): boolean => {
    return localStorage.getItem('workout_draft') !== null;
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (Object.keys(exercises).length > 0) {
      saveIntervalRef.current = setInterval(saveDraft, 30000);
    }

    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
      }
    };
  }, [saveDraft, exercises]);

  // Save draft when component unmounts
  useEffect(() => {
    return () => {
      if (Object.keys(exercises).length > 0) {
        saveDraft();
      }
    };
  }, [saveDraft, exercises]);

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft
  };
};
