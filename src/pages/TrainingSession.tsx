
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExerciseList } from '@/components/training/ExerciseList';
import { useTrainingTimers } from '@/hooks/useTrainingTimers';
import { useWorkoutStore } from '@/store/workoutStore';
import { Exercise } from '@/types/exercise';
import { AddExerciseSheet } from '@/components/training/AddExerciseSheet';
import { EnhancedWorkoutSessionFooter } from '@/components/training/EnhancedWorkoutSessionFooter';
import { useEnhancedWorkoutSave } from '@/hooks/useEnhancedWorkoutSave';
import { toast } from '@/hooks/use-toast';
import { LayoutWrapper } from '@/components/layouts/LayoutWrapper';
import { PriorityTimerDisplay } from '@/components/timers/PriorityTimerDisplay';
import { WorkoutRecoveryBanner } from '@/components/training/WorkoutRecoveryBanner';

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
        className="text-gray-400 hover:text-white p-2 disabled:opacity-50"
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
  saveProgress: number;
  showSaveProgress: boolean;
}>(({ elapsedTime, restTimerActive, currentRestTime, saveProgress, showSaveProgress }) => {
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
      
      {/* Save Progress Indicator */}
      {showSaveProgress && (
        <div className="mt-2 bg-gray-800 rounded-full h-2 overflow-hidden">
          <div 
            className="h-full bg-green-500 transition-all duration-300"
            style={{ width: `${saveProgress}%` }}
          />
        </div>
      )}
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
    addExercise, 
    completeSet,
    removeExercise,
    safeResetWorkout,
    elapsedTime,
    startTime,
    restTimerActive,
    currentRestTime,
    needsRecovery,
    detectRecoveryNeeded,
    performRecovery,
    clearRecovery
  } = useWorkoutStore();
  
  const { 
    saveWorkoutAsync, 
    isSaving, 
    isSuccess, 
    error, 
    saveProgress, 
    saveStatus 
  } = useEnhancedWorkoutSave();

  // Memoized computations to prevent expensive recalculations
  const exerciseCount = useMemo(() => Object.keys(exercises).length, [exercises]);
  const hasExercises = useMemo(() => exerciseCount > 0, [exerciseCount]);
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
  const showSaveProgress = useMemo(() => 
    isSaving && saveProgress > 0, 
    [isSaving, saveProgress]
  );

  // Check for recovery needs on component mount
  useEffect(() => {
    detectRecoveryNeeded();
  }, [detectRecoveryNeeded]);

  // Stabilized callback functions with proper dependencies
  const handleSelectExercise = useCallback((exercise: Exercise) => {
    console.log('[TrainingSession] Adding exercise:', exercise.name);
    addExercise(exercise.name);
    setAddExerciseSheetOpen(false);
    toast({
      title: `${exercise.name} added`,
      description: "You can start tracking your sets now.",
    });
  }, [addExercise]);
  
  const handleCompleteSet = useCallback((exerciseName: string, setIndex: number) => {
    console.log('[TrainingSession] Completing set:', { exerciseName, setIndex });
    completeSet(exerciseName, setIndex);
    handleTimerOnComplete(exerciseName, setIndex);
  }, [completeSet, handleTimerOnComplete]);

  const handleFinishWorkout = useCallback(async () => {
    console.log('[TrainingSession] Finish workout clicked');

    // Check if already saving
    if (isSaving) {
      console.log('[TrainingSession] Save already in progress, ignoring click');
      return;
    }

    // Check for exercises with completed sets
    if (!hasExercises) {
      toast({
        title: "No exercises added",
        description: "Add at least one exercise to finish your workout.",
        variant: "destructive",
      });
      return;
    }

    if (!hasCompletedSets) {
      toast({
        title: "No sets completed",
        description: "Complete at least one set to finish your workout.",
        variant: "destructive",
      });
      return;
    }

    workoutTimer.pause();
    restTimer.stop();
    
    // Enhanced validation with recovery support
    let finalStartTime = startTime;
    let finalTrainingConfig = trainingConfig;
    
    if (!finalStartTime || !finalTrainingConfig) {
      console.log('[TrainingSession] Missing metadata, attempting recovery');
      
      // Perform automatic recovery
      performRecovery();
      
      // Get updated values after recovery
      const state = useWorkoutStore.getState();
      finalStartTime = state.startTime;
      finalTrainingConfig = state.trainingConfig;
    }

    if (!finalStartTime || !finalTrainingConfig) {
      console.error('[TrainingSession] Recovery failed, cannot save workout');
      toast({
        title: "Could Not Finish Workout",
        description: "Unable to recover workout session data. Please start a new workout.",
        variant: "destructive",
      });
      return;
    }

    console.log('[TrainingSession] Starting save process with recovered data');

    const workoutData = {
      exercises,
      duration: elapsedTime,
      startTime: new Date(finalStartTime),
      endTime: new Date(),
      trainingType: finalTrainingConfig.trainingType,
      name: finalTrainingConfig.trainingType ? `${finalTrainingConfig.trainingType} Workout` : 'Workout',
      trainingConfig: finalTrainingConfig,
    };

    try {
      console.log('[TrainingSession] Calling saveWorkoutAsync with data:', workoutData);
      const result = await saveWorkoutAsync(workoutData);
      console.log('[TrainingSession] Save result:', result);
      
      if (result?.success) {
        console.log('[TrainingSession] Workout saved successfully, navigating to overview');
        
        setTimeout(() => {
          safeResetWorkout();
          navigate('/overview');
        }, 2000);
      }
    } catch (saveError) {
      console.error('[TrainingSession] Save failed with error:', saveError);
      toast({
        title: "Error saving workout",
        description: "There was a problem saving your workout. Please try again.",
        variant: "destructive"
      });
    }
  }, [
    isSaving, hasExercises, hasCompletedSets, workoutTimer, restTimer, 
    startTime, trainingConfig, performRecovery, exercises, elapsedTime, 
    saveWorkoutAsync, safeResetWorkout, navigate
  ]);

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
      <div className="container mx-auto px-4">
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
          saveProgress={saveProgress}
          showSaveProgress={showSaveProgress}
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

        {/* Exercise List */}
        <div className="pb-24">
          <ExerciseList
            exercises={exercises}
            onCompleteSet={handleCompleteSet}
            onDeleteExercise={removeExercise}
            onAddExercise={handleAddExercise}
          />
        </div>
      </div>

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
