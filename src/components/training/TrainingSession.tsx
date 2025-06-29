
import React, { useEffect, useCallback, useState } from 'react';
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
  
  // Split store subscriptions for optimal performance
  const timerState = useWorkoutTimer();
  const exerciseState = useWorkoutExercises();
  const sessionState = useWorkoutSession();
  const actions = useWorkoutActions();
  
  // Destructure for cleaner code
  const { elapsedTime } = timerState;
  const { exercises, isActive, workoutStatus } = exerciseState;
  const { sessionId, needsRecovery, recoveryData } = sessionState;
  const {
    resetWorkout, 
    setTrainingConfig, 
    startWorkout, 
    updateLastActiveRoute, 
    completeSet,
    removeExercise,
    addExercise,
    stopRestTimer,
    resetRestTimer,
    performRecovery,
    clearRecovery
  } = actions;
  
  // Memoized workout metrics - only recalculates when exercises change
  const metrics = useOptimizedWorkoutMetrics(exercises);
  
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
    completeSet(exerciseName, setIndex);
    toast({
      title: "Set completed!",
      description: "Rest timer started"
    });
  }, [completeSet]);

  const handleDeleteExercise = useCallback((exerciseName: string) => {
    removeExercise(exerciseName);
    toast({
      title: "Exercise removed",
      description: `${exerciseName} has been removed from your workout`
    });
  }, [removeExercise]);

  const handleAddExercise = useCallback(() => {
    setIsAddExerciseSheetOpen(true);
  }, []);

  const handleAddExerciseFromSheet = useCallback((exerciseName: string) => {
    addExercise(exerciseName);
    setIsAddExerciseSheetOpen(false);
    toast({
      title: "Exercise added",
      description: `${exerciseName} has been added to your workout`
    });
  }, [addExercise]);

  const handleRetrySave = useCallback(() => {
    console.log('Retry save requested');
  }, []);

  const handleResetWorkout = useCallback(() => {
    resetWorkout();
    navigate('/');
  }, [resetWorkout, navigate]);

  const handleRestTimerComplete = useCallback(() => {
    stopRestTimer();
    toast({
      title: "Rest time complete!",
      description: "Ready for your next set"
    });
  }, [stopRestTimer]);

  const handleShowRestTimer = useCallback(() => {
    console.log('Show rest timer requested');
  }, []);

  const handleRestTimerReset = useCallback(() => {
    resetRestTimer();
  }, [resetRestTimer]);

  const handleFinishWorkout = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // Session initialization logic - using useCallback to prevent multiple executions
  const initializeSession = useCallback(() => {
    if (trainingConfig && !isActive) {
      console.log('Starting new workout session with config:', trainingConfig);
      
      resetWorkout();
      setTrainingConfig(trainingConfig);
      updateLastActiveRoute('/training-session');
      startWorkout();
      
      toast({
        title: "Workout started",
        description: "You can return to it anytime from the banner"
      });
    } 
    else if (isActive) {
      console.log('Continuing existing active workout session');
      
      if (metrics.exerciseCount > 0) {
        toast({
          title: "Resuming your active workout"
        });
      }
    }
  }, [
    trainingConfig, 
    isActive, 
    resetWorkout, 
    setTrainingConfig, 
    startWorkout, 
    updateLastActiveRoute, 
    metrics.exerciseCount
  ]);

  // Run initialization once on mount
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // Show loading state only during initial setup
  if (trainingConfig && !isActive) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white">Initializing workout...</p>
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
    <div className="flex items-center justify-center h-full">
      <p className="text-white">No active workout session found</p>
    </div>
  );
};
