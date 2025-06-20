import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExerciseList } from '@/components/training/ExerciseList';
import { useTrainingTimers } from '@/hooks/useTrainingTimers';
import { useWorkoutStore } from '@/store/workoutStore';
import { Exercise } from '@/types/exercise';
import { AddExerciseSheet } from '@/components/training/AddExerciseSheet';
import { EnhancedWorkoutSessionFooter } from '@/components/training/EnhancedWorkoutSessionFooter';
import { useWorkoutActions } from '@/hooks/useWorkoutActions';
import { toast } from '@/hooks/use-toast';
import { LayoutWrapper } from '@/components/layouts/LayoutWrapper';
import { PriorityTimerDisplay } from '@/components/timers/PriorityTimerDisplay';
import { WorkoutRecoveryBanner } from '@/components/training/WorkoutRecoveryBanner';
import { cn } from '@/lib/utils';

// Memoized SessionHeader component to isolate renders
const SessionHeader = React.memo<{
  trainingConfig: any;
  exerciseCount: number;
  completedSetsCount: number;
  hasCompletedSets: boolean;
  isSaving: boolean;
  isSuccess: boolean;
  needsRecovery: boolean;
  onExitWorkout: () => void;
}>(({
  trainingConfig,
  exerciseCount,
  completedSetsCount,
  hasCompletedSets,
  isSaving,
  isSuccess,
  needsRecovery,
  onExitWorkout
}) => (
  <div className="mb-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white">
          {trainingConfig?.trainingType || 'Training Session'}
        </h1>
        <p className="text-gray-400">
          {exerciseCount} exercises
          {hasCompletedSets && (
            <span className="ml-2 text-blue-400">• {completedSetsCount} sets completed</span>
          )}
          {isSaving && (
            <span className="ml-2 text-yellow-400">• Saving...</span>
          )}
          {isSuccess && (
            <span className="ml-2 text-green-400">• Saved</span>
          )}
          {needsRecovery && (
            <span className="ml-2 text-yellow-400">• Recovery needed</span>
          )}
        </p>
      </div>
      <button
        onClick={onExitWorkout}
        disabled={isSaving}
        className="text-gray-400 hover:text-white p-2 disabled:opacity-50 touch-target"
      >
        Exit
      </button>
    </div>
  </div>
));

// Memoized TimerDisplay component
const TimerDisplay = React.memo<{
  elapsedTime: number;
  restTimerActive: boolean;
  currentRestTime: number;
}>(({ elapsedTime, restTimerActive, currentRestTime }) => {
  const formatTime = useCallback((seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  return (
    <div className="sticky top-16 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800/50 -mx-4 px-4 py-4 mb-6">
      <PriorityTimerDisplay
        workoutTime={formatTime(elapsedTime)}
        restTime={restTimerActive ? formatTime(currentRestTime) : undefined}
        isRestActive={restTimerActive}
        onRestTimerClick={() => {/* Handle rest timer click */}}
      />
    </div>
  );
});

const TrainingSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAddExerciseSheetOpen, setAddExerciseSheetOpen] = useState(false);

  const { workoutTimer, restTimer, handleSetCompletion: handleTimerOnComplete } = useTrainingTimers();
  const { 
    exercises, 
    trainingConfig, 
    removeExercise,
    safeResetWorkout,
    elapsedTime,
    restTimerActive,
    currentRestTime,
    needsRecovery,
    detectRecoveryNeeded,
    performRecovery,
    clearRecovery
  } = useWorkoutStore();
  
  // Use useWorkoutActions for all workout operations including save
  const {
    handleFinishWorkout,
    handleAddExerciseWithFeedback,
    isSaving,
    isSuccess,
    error,
    hasExercises,
    exerciseCount // Get exerciseCount from useWorkoutActions which uses workout store
  } = useWorkoutActions();

  // Memoized computations to prevent expensive recalculations - use exercises from workout store
  const hasCompletedSets = useMemo(() => 
    Object.values(exercises).some(sets => sets.some(set => set.completed)), 
    [exercises]
  );
  const completedSetsCount = useMemo(() => 
    Object.values(exercises).reduce((total, sets) => 
      total + sets.filter(set => set.completed).length, 0
    ), 
    [exercises]
  );

  // Check for recovery needs on component mount
  useEffect(() => {
    detectRecoveryNeeded();
  }, [detectRecoveryNeeded]);

  // Stabilized callback functions with proper dependencies
  const handleSelectExercise = useCallback((exercise: Exercise) => {
    console.log('[TrainingSession] Adding exercise:', exercise.name);
    handleAddExerciseWithFeedback(exercise);
    setAddExerciseSheetOpen(false);
    toast({
      title: `${exercise.name} added`,
      description: "You can start tracking your sets now.",
    });
  }, [handleAddExerciseWithFeedback]);
  
  const handleCompleteSet = useCallback((exerciseName: string, setIndex: number) => {
    console.log('[TrainingSession] Completing set:', { exerciseName, setIndex });
    const { completeSet } = useWorkoutStore.getState();
    completeSet(exerciseName, setIndex);
    handleTimerOnComplete(exerciseName, setIndex);
  }, [handleTimerOnComplete]);

  const handleRecoverWorkout = useCallback(() => {
    console.log('[TrainingSession] User chose to recover workout');
    performRecovery();
    toast({
      title: "Workout recovered",
      description: "Your previous workout session has been restored. You can now finish it.",
    });
  }, [performRecovery]);

  const handleDismissRecovery = useCallback(() => {
    console.log('[TrainingSession] User chose to start fresh');
    clearRecovery();
    safeResetWorkout();
    toast({
      title: "Started fresh",
      description: "Previous workout data cleared. You can start a new workout.",
    });
  }, [clearRecovery, safeResetWorkout]);

  const handleExitWorkout = useCallback(() => {
    if (isSaving) {
      toast({
        title: "Cannot exit during save",
        description: "Please wait for the workout to finish saving.",
        variant: "destructive"
      });
      return;
    }

    if (exerciseCount > 0 && !isSuccess) {
      toast({
        title: "Unsaved workout data",
        description: "Your workout data will be lost. Save your workout first.",
        variant: "destructive"
      });
      return;
    }

    safeResetWorkout();
    navigate('/overview');
  }, [isSaving, exerciseCount, isSuccess, safeResetWorkout, navigate]);

  const handleAddExercise = useCallback(() => {
    setAddExerciseSheetOpen(true);
  }, []);

  return (
    <LayoutWrapper>
      <div className={cn(
        "container mx-auto px-4",
        // Mobile-optimized layout with proper footer clearance
        "min-h-screen pb-32 lg:pb-20"
      )}>
        {/* Recovery Banner */}
        {needsRecovery && (
          <div className="sticky top-16 z-50 -mx-4 px-4 py-2">
            <WorkoutRecoveryBanner
              onRecover={handleRecoverWorkout}
              onDismiss={handleDismissRecovery}
              exerciseCount={exerciseCount}
              completedSetsCount={completedSetsCount}
            />
          </div>
        )}

        {/* Sticky Timer Display at Top */}
        <TimerDisplay
          elapsedTime={elapsedTime}
          restTimerActive={restTimerActive}
          currentRestTime={currentRestTime}
        />

        {/* Session Header */}
        <SessionHeader
          trainingConfig={trainingConfig}
          exerciseCount={exerciseCount}
          completedSetsCount={completedSetsCount}
          hasCompletedSets={hasCompletedSets}
          isSaving={isSaving}
          isSuccess={isSuccess}
          needsRecovery={needsRecovery}
          onExitWorkout={handleExitWorkout}
        />

        {/* Exercise List with mobile padding */}
        <div className={cn(
          "pb-4",
          // Additional bottom padding for mobile footer clearance
          "mb-safe-bottom"
        )}>
          <ExerciseList
            exercises={exercises}
            onCompleteSet={handleCompleteSet}
            onDeleteExercise={removeExercise}
            onAddExercise={handleAddExercise}
          />
        </div>
      </div>

      {/* Enhanced Mobile Footer */}
      <EnhancedWorkoutSessionFooter
        onAddExercise={handleAddExercise}
        onFinishWorkout={handleFinishWorkout}
        hasExercises={hasExercises}
        isSaving={isSaving}
      />

      <AddExerciseSheet
        open={isAddExerciseSheetOpen}
        onOpenChange={setAddExerciseSheetOpen}
        onSelectExercise={handleSelectExercise}
        trainingType={trainingConfig?.trainingType || ''}
      />
    </LayoutWrapper>
  );
};

export default TrainingSessionPage;
