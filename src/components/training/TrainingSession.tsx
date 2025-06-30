
import React, { useEffect, useCallback, useState, useRef, useMemo, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrainingConfig } from '@/hooks/useTrainingSetupPersistence';
import { toast } from "@/hooks/use-toast";
import { usePageVisibility } from '@/hooks/usePageVisibility';
import { ExerciseList } from '@/components/training/ExerciseList';
import { WorkoutSessionHeader } from '@/components/training/WorkoutSessionHeader';
import { WorkoutSessionFooter } from '@/components/training/WorkoutSessionFooter';
import { AddExerciseSheet } from '@/components/training/AddExerciseSheet';
import { OptimizedTimerHeader } from '@/components/training/OptimizedTimerHeader';
import { useOptimizedWorkoutMetrics } from '@/hooks/useOptimizedWorkoutMetrics';
import { 
  useWorkoutTimer,
  useWorkoutExercises, 
  useWorkoutSession,
  useWorkoutActions 
} from '@/hooks/useWorkoutStoreSelectors';

interface TrainingSessionProps {
  trainingConfig: TrainingConfig | null;
  onComplete: () => void;
  onCancel: () => void;
}

// Memoized components to prevent unnecessary re-renders
const MemoizedWorkoutSessionHeader = React.memo(WorkoutSessionHeader);
const MemoizedExerciseList = React.memo(ExerciseList);
const MemoizedWorkoutSessionFooter = React.memo(WorkoutSessionFooter);

export const TrainingSession: React.FC<TrainingSessionProps> = ({ 
  trainingConfig,
  onComplete,
  onCancel
}) => {
  const navigate = useNavigate();
  const { isVisible } = usePageVisibility();
  const [isAddExerciseSheetOpen, setIsAddExerciseSheetOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const initializationRef = useRef(false);
  
  console.log('[TrainingSession] Starting component render with props:', { trainingConfig });
  
  // Split store subscriptions for optimal performance with error handling
  let timerState, exerciseState, sessionState, actions;
  
  try {
    timerState = useWorkoutTimer();
    exerciseState = useWorkoutExercises();
    sessionState = useWorkoutSession();
    actions = useWorkoutActions();
    
    console.log('[TrainingSession] Successfully got store states');
  } catch (error) {
    console.error('[TrainingSession] Error accessing workout store:', error);
    
    // Provide fallback values
    timerState = { 
      elapsedTime: 0, 
      restTimerActive: false, 
      currentRestTime: 0, 
      restTimerResetSignal: 0, 
      restTimerTargetDuration: 60 
    };
    exerciseState = { 
      exercises: {}, 
      isActive: false, 
      workoutStatus: 'idle' as const 
    };
    sessionState = { 
      sessionId: null, 
      needsRecovery: false, 
      recoveryData: null, 
      trainingConfig: null 
    };
    actions = {
      resetWorkout: () => {},
      setTrainingConfig: () => {},
      startWorkout: () => {},
      updateLastActiveRoute: () => {},
      completeSet: () => {},
      removeExercise: () => {},
      addExercise: () => {},
      stopRestTimer: () => {},
      resetRestTimer: () => {},
      performRecovery: () => {},
      clearRecovery: () => {}
    };
  }
  
  // Destructure for cleaner code with null checks
  const { elapsedTime = 0 } = timerState || {};
  const { exercises = {}, isActive = false, workoutStatus = 'idle' } = exerciseState || {};
  const { sessionId = null, needsRecovery = false, recoveryData = null } = sessionState || {};
  const {
    resetWorkout = () => {}, 
    setTrainingConfig = () => {}, 
    startWorkout = () => {}, 
    updateLastActiveRoute = () => {}, 
    completeSet = () => {},
    removeExercise = () => {},
    addExercise = () => {},
    stopRestTimer = () => {},
    resetRestTimer = () => {},
    performRecovery = () => {},
    clearRecovery = () => {}
  } = actions || {};
  
  // Memoize exercises to prevent unnecessary metrics recalculation
  const memoizedExercises = useMemo(() => exercises, [JSON.stringify(exercises)]);
  
  // Memoized workout metrics - only recalculates when exercises change
  const metrics = useOptimizedWorkoutMetrics(memoizedExercises || {});
  
  // Debug logging for component state
  useEffect(() => {
    console.log('TrainingSession rendered with:', { 
      trainingConfig, 
      isActive, 
      exerciseCount: metrics.exerciseCount,
      elapsedTime,
      sessionId,
      isVisible 
    });
  }, [trainingConfig, isActive, metrics.exerciseCount, elapsedTime, sessionId, isVisible]);

  // Map workout store status to WorkoutStatus type for header
  const mapWorkoutStatus = useCallback((status: string) => {
    switch (status) {
      case 'idle': return 'idle' as const;
      case 'active': return 'active' as const;
      case 'paused': return 'idle' as const; // Map paused to idle for display
      case 'completed': return 'saved' as const;
      default: return 'idle' as const;
    }
  }, []);

  // Memoized handlers to prevent recreation on every render
  const handleCompleteSet = useCallback((exerciseName: string, setIndex: number) => {
    try {
      completeSet(exerciseName, setIndex);
      toast({
        title: "Set completed!",
        description: "Rest timer started"
      });
    } catch (error) {
      console.error('[TrainingSession] Error completing set:', error);
      toast({
        title: "Error completing set",
        description: "Please try again",
        variant: "destructive"
      });
    }
  }, [completeSet]);

  const handleDeleteExercise = useCallback((exerciseName: string) => {
    try {
      removeExercise(exerciseName);
      toast({
        title: "Exercise removed",
        description: `${exerciseName} has been removed from your workout`
      });
    } catch (error) {
      console.error('[TrainingSession] Error removing exercise:', error);
      toast({
        title: "Error removing exercise",
        description: "Please try again",
        variant: "destructive"
      });
    }
  }, [removeExercise]);

  const handleAddExercise = useCallback(() => {
    setIsAddExerciseSheetOpen(true);
  }, []);

  const handleAddExerciseFromSheet = useCallback((exerciseName: string) => {
    try {
      addExercise(exerciseName);
      setIsAddExerciseSheetOpen(false);
      toast({
        title: "Exercise added",
        description: `${exerciseName} has been added to your workout`
      });
    } catch (error) {
      console.error('[TrainingSession] Error adding exercise:', error);
      toast({
        title: "Error adding exercise",
        description: "Please try again",
        variant: "destructive"
      });
    }
  }, [addExercise]);

  const handleRetrySave = useCallback(() => {
    console.log('Retry save requested');
  }, []);

  const handleResetWorkout = useCallback(() => {
    try {
      resetWorkout();
      navigate('/');
    } catch (error) {
      console.error('[TrainingSession] Error resetting workout:', error);
      navigate('/');
    }
  }, [resetWorkout, navigate]);

  const handleRestTimerComplete = useCallback(() => {
    try {
      stopRestTimer();
      toast({
        title: "Rest time complete!",
        description: "Ready for your next set"
      });
    } catch (error) {
      console.error('[TrainingSession] Error stopping rest timer:', error);
    }
  }, [stopRestTimer]);

  const handleShowRestTimer = useCallback(() => {
    console.log('Show rest timer requested');
  }, []);

  const handleRestTimerReset = useCallback(() => {
    try {
      resetRestTimer();
    } catch (error) {
      console.error('[TrainingSession] Error resetting rest timer:', error);
    }
  }, [resetRestTimer]);

  const handleFinishWorkout = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // Session initialization logic - using useLayoutEffect to run before paint
  const initializeSession = useCallback(() => {
    // Prevent multiple initializations
    if (initializationRef.current) {
      console.log('[TrainingSession] Already initialized, skipping');
      return;
    }

    try {
      if (trainingConfig && !isActive) {
        console.log('Starting new workout session with config:', trainingConfig);
        
        resetWorkout();
        setTrainingConfig(trainingConfig);
        updateLastActiveRoute('/training-session');
        startWorkout();
        
        initializationRef.current = true;
        setIsInitialized(true);
        
        toast({
          title: "Workout started",
          description: "You can return to it anytime from the banner"
        });
      } 
      else if (isActive) {
        console.log('Continuing existing active workout session');
        
        initializationRef.current = true;
        setIsInitialized(true);
        
        if (Object.keys(exercises).length > 0) {
          toast({
            title: "Resuming your active workout"
          });
        }
      } else {
        // No training config and not active - set as initialized to prevent loading state
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('[TrainingSession] Error initializing session:', error);
      setIsInitialized(true); // Set initialized even on error to prevent loading loop
      toast({
        title: "Error starting workout",
        description: "Please try again",
        variant: "destructive"
      });
    }
  }, [
    trainingConfig, 
    isActive, 
    resetWorkout, 
    setTrainingConfig, 
    startWorkout, 
    updateLastActiveRoute,
    exercises
  ]);

  // Use layoutEffect for critical initialization to run before paint
  useLayoutEffect(() => {
    if (!isInitialized) {
      initializeSession();
    }
  }, [initializeSession, isInitialized]);

  // Set loading to false once initialization is complete
  useEffect(() => {
    if (isInitialized) {
      setIsLoading(false);
    }
  }, [isInitialized]);

  // Show loading state during initialization
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p>Initializing workout...</p>
        </div>
      </div>
    );
  }

  // If we have training config or active workout, show the full training interface
  if (trainingConfig || isActive) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <MemoizedWorkoutSessionHeader 
          elapsedTime={elapsedTime}
          exerciseCount={metrics.exerciseCount}
          completedSets={metrics.completedSets}
          totalSets={metrics.totalSets}
          totalVolume={metrics.totalVolume}
          totalReps={metrics.totalReps}
          workoutStatus={mapWorkoutStatus(workoutStatus)}
          isRecoveryMode={needsRecovery}
          saveProgress={null}
          onRetrySave={handleRetrySave}
          onResetWorkout={handleResetWorkout}
          restTimerActive={false}
          onRestTimerComplete={handleRestTimerComplete}
          onShowRestTimer={handleShowRestTimer}
          onRestTimerReset={handleRestTimerReset}
          restTimerResetSignal={0}
          currentRestTime={0}
        />
        <div className="flex-1 overflow-y-auto">
          <MemoizedExerciseList 
            exercises={exercises}
            onCompleteSet={handleCompleteSet}
            onDeleteExercise={handleDeleteExercise}
            onAddExercise={handleAddExercise}
          />
        </div>
        <MemoizedWorkoutSessionFooter 
          onAddExercise={handleAddExercise}
          onFinishWorkout={handleFinishWorkout}
          hasExercises={metrics.exerciseCount > 0}
          isSaving={workoutStatus === 'active'}
        />
        
        <AddExerciseSheet 
          open={isAddExerciseSheetOpen}
          onOpenChange={setIsAddExerciseSheetOpen}
          onSelectExercise={(exercise) => handleAddExerciseFromSheet(exercise.name)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-2xl font-bold mb-4">No Active Workout</h1>
        <p className="text-gray-400 mb-6">Start a workout from the home page to begin training.</p>
        <a 
          href="/" 
          className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          Go Home
        </a>
      </div>
    </div>
  );
};
