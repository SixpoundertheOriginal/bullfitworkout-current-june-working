
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExerciseList } from '@/components/training/ExerciseList';
import { useTrainingTimers } from '@/hooks/useTrainingTimers';
import { useWorkoutStore } from '@/store/workoutStore';
import { Exercise } from '@/types/exercise';
import { AddExerciseSheet } from '@/components/training/AddExerciseSheet';
import { EnhancedWorkoutSessionFooter } from '@/components/training/EnhancedWorkoutSessionFooter';
import { useWorkoutSave } from '@/hooks/useWorkoutSave';
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
    resetWorkout,
    elapsedTime,
    startTime,
    restTimerActive,
    currentRestTime,
  } = useWorkoutStore();
  
  const { saveWorkout, isSaving } = useWorkoutSave();

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

    const workoutData = {
      exercises,
      duration: elapsedTime,
      startTime: new Date(startTime),
      endTime: new Date(),
      trainingType: trainingConfig.trainingType,
      name: trainingConfig.trainingType ? `${trainingConfig.trainingType} Workout` : 'Workout',
      trainingConfig,
    };

    await saveWorkout(workoutData);
    resetWorkout();
    navigate('/overview');
  };

  const handleExitWorkout = () => {
    resetWorkout();
    navigate('/overview');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const hasExercises = Object.keys(exercises).length > 0;
  const handleAddExercise = () => setAddExerciseSheetOpen(true);

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
              </p>
            </div>
            <button
              onClick={handleExitWorkout}
              className="text-gray-400 hover:text-white p-2"
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
