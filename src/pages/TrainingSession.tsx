
import React, { useState, useCallback, useEffect } from 'react';
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
    saveInProgress,
    saveConfirmed,
    markAsSaving,
    markAsSaved,
    markAsFailed,
    setSaveInProgress,
    setSaveConfirmed
  } = useWorkoutStore();
  
  const { 
    saveWorkoutAsync, 
    isSaving, 
    isSuccess, 
    error, 
    saveProgress, 
    saveStatus 
  } = useEnhancedWorkoutSave();

  // Sync save state with workout store
  useEffect(() => {
    setSaveInProgress(isSaving);
  }, [isSaving, setSaveInProgress]);

  useEffect(() => {
    if (isSuccess) {
      setSaveConfirmed(true);
      markAsSaved();
    }
  }, [isSuccess, setSaveConfirmed, markAsSaved]);

  useEffect(() => {
    if (error) {
      markAsFailed(error);
    }
  }, [error, markAsFailed]);

  const handleSelectExercise = useCallback((exercise: Exercise) => {
    addExercise(exercise.name);
    setAddExerciseSheetOpen(false);
    toast({
      title: `${exercise.name} added`,
      description: "You can start tracking your sets now.",
    });
  }, [addExercise]);
  
  const handleCompleteSet = useCallback((exerciseName: string, setIndex: number) => {
    completeSet(exerciseName, setIndex);
    handleTimerOnComplete(exerciseName, setIndex);
  }, [completeSet, handleTimerOnComplete]);

  const handleFinishWorkout = async () => {
    workoutTimer.pause();
    restTimer.stop();
    
    if (!startTime || !trainingConfig) {
      toast({
        title: "Could Not Finish Workout",
        description: "Workout data is incomplete. Cannot save.",
        variant: "destructive",
      });
      return;
    }

    markAsSaving();

    const workoutData = {
      exercises,
      duration: elapsedTime,
      startTime: new Date(startTime),
      endTime: new Date(),
      trainingType: trainingConfig.trainingType,
      name: trainingConfig.trainingType ? `${trainingConfig.trainingType} Workout` : 'Workout',
      trainingConfig,
    };

    try {
      console.log('[TrainingSession] Starting workout save process');
      const result = await saveWorkoutAsync(workoutData);
      
      if (result.success) {
        console.log('[TrainingSession] Workout saved successfully, safe to navigate');
        
        // Wait a moment for subscriptions to process the save
        setTimeout(() => {
          safeResetWorkout();
          navigate('/overview');
        }, 1000);
      }
    } catch (saveError) {
      console.error('[TrainingSession] Save failed:', saveError);
      // Error is already handled by the hook and store
    }
  };

  const handleExitWorkout = () => {
    if (saveInProgress) {
      toast({
        title: "Cannot exit during save",
        description: "Please wait for the workout to finish saving.",
        variant: "destructive"
      });
      return;
    }

    if (Object.keys(exercises).length > 0 && !saveConfirmed) {
      toast({
        title: "Unsaved workout data",
        description: "Your workout data will be lost. Save your workout first.",
        variant: "destructive"
      });
      return;
    }

    safeResetWorkout();
    navigate('/overview');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const hasExercises = Object.keys(exercises).length > 0;
  const handleAddExercise = () => setAddExerciseSheetOpen(true);

  // Show save progress if saving
  const showSaveProgress = saveInProgress && saveProgress > 0;

  return (
    <LayoutWrapper>
      <div className="container mx-auto px-4">
        {/* Sticky Timer Display at Top */}
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

        {/* Session Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">
                {trainingConfig?.trainingType || 'Training Session'}
              </h1>
              <p className="text-gray-400">
                {Object.keys(exercises).length} exercises
                {saveInProgress && (
                  <span className="ml-2 text-yellow-400">• Saving...</span>
                )}
                {saveConfirmed && (
                  <span className="ml-2 text-green-400">• Saved</span>
                )}
              </p>
            </div>
            <button
              onClick={handleExitWorkout}
              disabled={saveInProgress}
              className="text-gray-400 hover:text-white p-2 disabled:opacity-50"
            >
              Exit
            </button>
          </div>
        </div>

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
        isSaving={saveInProgress}
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
