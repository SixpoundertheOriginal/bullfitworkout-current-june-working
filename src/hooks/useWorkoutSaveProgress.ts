
import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { WorkoutError, SaveProgress } from '@/types/workout';

interface SaveProgressState {
  status: 'idle' | 'saving' | 'validating' | 'complete' | 'failed' | 'retrying';
  progress: SaveProgress | null;
  retryCount: number;
  canRetry: boolean;
  autoRetryEnabled: boolean;
}

export const useWorkoutSaveProgress = () => {
  const [state, setState] = useState<SaveProgressState>({
    status: 'idle',
    progress: null,
    retryCount: 0,
    canRetry: false,
    autoRetryEnabled: true
  });

  const retryTimeoutRef = useRef<NodeJS.Timeout>();
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second

  const updateProgress = useCallback((progress: SaveProgress) => {
    setState(prev => ({
      ...prev,
      progress,
      status: progress.errors.length > 0 ? 'failed' : 'saving'
    }));
  }, []);

  const startSave = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'saving',
      progress: {
        step: 'workout',
        total: 3,
        completed: 0,
        errors: []
      },
      retryCount: 0,
      canRetry: false
    }));
  }, []);

  const markValidating = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'validating'
    }));
  }, []);

  const markComplete = useCallback(() => {
    setState(prev => ({
      ...prev,
      status: 'complete',
      canRetry: false
    }));

    toast({
      title: "Workout saved successfully!",
      description: "Your workout has been saved and added to your progress.",
      variant: "default"
    });
  }, []);

  const markFailed = useCallback((error: WorkoutError) => {
    const canRetry = state.retryCount < maxRetries && error.recoverable;
    
    setState(prev => ({
      ...prev,
      status: 'failed',
      canRetry,
      progress: prev.progress ? {
        ...prev.progress,
        errors: [...prev.progress.errors, error]
      } : null
    }));

    // Show user-friendly error message
    const getErrorMessage = () => {
      switch (error.type) {
        case 'network':
          return 'Network connection issue. Check your internet connection.';
        case 'database':
          return 'Server temporarily unavailable. Your data is safe.';
        case 'validation':
          return 'Data validation failed. Please review your workout.';
        default:
          return 'An unexpected error occurred. Please try again.';
      }
    };

    toast({
      title: "Save failed",
      description: getErrorMessage(),
      variant: "destructive",
      duration: 5000
    });
  }, [state.retryCount]);

  const retry = useCallback(async (retryFunction: () => Promise<void>) => {
    if (!state.canRetry) return;

    setState(prev => ({
      ...prev,
      status: 'retrying',
      retryCount: prev.retryCount + 1,
      canRetry: false
    }));

    // Exponential backoff delay
    const delay = baseDelay * Math.pow(2, state.retryCount);
    
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    retryTimeoutRef.current = setTimeout(async () => {
      try {
        await retryFunction();
      } catch (error) {
        console.error('Retry failed:', error);
      }
    }, delay);
  }, [state.canRetry, state.retryCount, baseDelay]);

  const scheduleAutoRetry = useCallback((retryFunction: () => Promise<void>) => {
    if (!state.autoRetryEnabled || state.retryCount >= maxRetries) return;

    const delay = baseDelay * Math.pow(2, state.retryCount);
    
    retryTimeoutRef.current = setTimeout(() => {
      retry(retryFunction);
    }, delay);
  }, [state.autoRetryEnabled, state.retryCount, retry]);

  const enableAutoRetry = useCallback(() => {
    setState(prev => ({ ...prev, autoRetryEnabled: true }));
  }, []);

  const disableAutoRetry = useCallback(() => {
    setState(prev => ({ ...prev, autoRetryEnabled: false }));
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
  }, []);

  const reset = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }
    setState({
      status: 'idle',
      progress: null,
      retryCount: 0,
      canRetry: false,
      autoRetryEnabled: true
    });
  }, []);

  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  return {
    ...state,
    updateProgress,
    startSave,
    markValidating,
    markComplete,
    markFailed,
    retry,
    scheduleAutoRetry,
    enableAutoRetry,
    disableAutoRetry,
    reset,
    maxRetries
  };
};
