
import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrainingConfig } from '@/hooks/useTrainingSetupPersistence';
import { useWorkoutStore } from '@/store/workoutStore';
import { toast } from "@/hooks/use-toast";
import { usePageVisibility } from '@/hooks/usePageVisibility';
import { ExerciseList } from '@/components/training/ExerciseList';
import { WorkoutSessionHeader } from '@/components/training/WorkoutSessionHeader';
import { WorkoutSessionFooter } from '@/components/training/WorkoutSessionFooter';
import { AddExerciseSheet } from '@/components/training/AddExerciseSheet';

interface TrainingSessionProps {
  trainingConfig: TrainingConfig | null;
  onComplete: () => void;
  onCancel: () => void;
}

export const TrainingSession: React.FC<TrainingSessionProps> = ({ 
  trainingConfig,
  onComplete,
  onCancel
}) => {
  const navigate = useNavigate();
  const { isVisible } = usePageVisibility();
  const [isAddExerciseSheetOpen, setIsAddExerciseSheetOpen] = useState(false);
  
  const { 
    resetWorkout, 
    setTrainingConfig, 
    startWorkout, 
    updateLastActiveRoute, 
    isActive, 
    exercises, 
    elapsedTime,
    sessionId,
    completeSet,
    removeExercise,
    addExercise,
    restTimerActive,
    currentRestTime,
    restTimerResetSignal,
    restTimerTargetDuration,
    stopRestTimer,
    resetRestTimer,
    workoutStatus,
    needsRecovery,
    recoveryData,
    performRecovery,
    clearRecovery
  } = useWorkoutStore();
  
  // Debug logging for component state
  useEffect(() => {
    console.log('TrainingSession rendered with:', { 
      trainingConfig, 
      isActive, 
      exerciseCount: Object.keys(exercises).length,
      elapsedTime,
      sessionId,
      isVisible 
    });
  }, [trainingConfig, isActive, exercises, elapsedTime, sessionId, isVisible]);

  // Calculate metrics for header
  const exerciseCount = Object.keys(exercises).length;
  const completedSets = Object.values(exercises).reduce((total, sets) => 
    total + sets.filter(set => set.completed).length, 0
  );
  const totalSets = Object.values(exercises).reduce((total, sets) => 
    total + sets.length, 0
  );
  const totalVolume = Object.values(exercises).reduce((total, sets) => 
    total + sets.filter(set => set.completed).reduce((setTotal, set) => 
      setTotal + (set.weight * set.reps), 0
    ), 0
  );
  const totalReps = Object.values(exercises).reduce((total, sets) => 
    total + sets.filter(set => set.completed).reduce((setTotal, set) => 
      setTotal + set.reps, 0
    ), 0
  );

  // Map workout store status to WorkoutStatus type for header
  const mapWorkoutStatus = (status: string) => {
    switch (status) {
      case 'idle': return 'idle' as const;
      case 'active': return 'active' as const;
      case 'paused': return 'idle' as const; // Map paused to idle for display
      case 'completed': return 'saved' as const;
      default: return 'idle' as const;
    }
  };

  // Exercise list handlers
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

  // Header action handlers
  const handleRetrySave = useCallback(() => {
    // Implement retry save logic if needed
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
    // Could open a rest timer modal or sheet
    console.log('Show rest timer requested');
  }, []);

  const handleRestTimerReset = useCallback(() => {
    resetRestTimer();
  }, [resetRestTimer]);

  // Footer handlers
  const handleFinishWorkout = useCallback(() => {
    onComplete();
  }, [onComplete]);

  // Session initialization logic - using useCallback to prevent multiple executions
  const initializeSession = useCallback(() => {
    if (trainingConfig && !isActive) {
      console.log('Starting new workout session with config:', trainingConfig);
      
      // Reset any existing session first to ensure clean slate
      resetWorkout();
      
      // Set up the new training session
      setTrainingConfig(trainingConfig);
      
      // Start workout and update route - order matters here
      updateLastActiveRoute('/training-session');
      startWorkout();
      
      // Show toast to confirm workout started
      toast({
        title: "Workout started",
        description: "You can return to it anytime from the banner"
      });
    } 
    // Case 2: Active session exists - show training interface
    else if (isActive) {
      console.log('Continuing existing active workout session');
      
      // Only show toast if we have exercises (not just a new session)
      if (Object.keys(exercises).length > 0) {
        toast({
          title: "Resuming your active workout"
        });
      }
    }
    // Case 3: No config, no active session - This should be handled by parent component
  }, [
    trainingConfig, 
    isActive, 
    resetWorkout, 
    setTrainingConfig, 
    startWorkout, 
    updateLastActiveRoute, 
    exercises
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
        <WorkoutSessionHeader 
          elapsedTime={elapsedTime}
          exerciseCount={exerciseCount}
          completedSets={completedSets}
          totalSets={totalSets}
          totalVolume={totalVolume}
          totalReps={totalReps}
          workoutStatus={mapWorkoutStatus(workoutStatus)}
          isRecoveryMode={needsRecovery}
          saveProgress={null}
          onRetrySave={handleRetrySave}
          onResetWorkout={handleResetWorkout}
          restTimerActive={restTimerActive}
          onRestTimerComplete={handleRestTimerComplete}
          onShowRestTimer={handleShowRestTimer}
          onRestTimerReset={handleRestTimerReset}
          restTimerResetSignal={restTimerResetSignal}
          currentRestTime={currentRestTime}
        />
        <div className="flex-1 overflow-y-auto">
          <ExerciseList 
            exercises={exercises}
            onCompleteSet={handleCompleteSet}
            onDeleteExercise={handleDeleteExercise}
            onAddExercise={handleAddExercise}
          />
        </div>
        <WorkoutSessionFooter 
          onAddExercise={handleAddExercise}
          onFinishWorkout={handleFinishWorkout}
          hasExercises={exerciseCount > 0}
          isSaving={workoutStatus === 'active'} // Use active as proxy since store doesn't have saving
        />
        
        <AddExerciseSheet 
          open={isAddExerciseSheetOpen}
          onOpenChange={setIsAddExerciseSheetOpen}
          onSelectExercise={(exercise) => handleAddExerciseFromSheet(exercise.name)}
        />
      </div>
    );
  }

  // This should not happen due to parent component logic, but just in case
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-white">No active workout session found</p>
    </div>
  );
};
