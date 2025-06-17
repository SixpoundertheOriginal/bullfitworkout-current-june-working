import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExerciseList } from '@/components/training/ExerciseList';
import { useTrainingTimers } from '@/hooks/useTrainingTimers';
import { useWorkoutStore } from '@/store/workoutStore';
import { Exercise } from '@/types/exercise';
import { X } from 'lucide-react';
import { AddExerciseSheet } from '@/components/training/AddExerciseSheet';
import { EnhancedWorkoutSessionFooter } from '@/components/training/EnhancedWorkoutSessionFooter';
import { useWorkoutSave } from '@/hooks/useWorkoutSave';
import { toast } from '@/hooks/use-toast';
import { UnifiedLayout } from '@/components/layouts/UnifiedLayout';
import { ContextualHeader } from '@/components/layouts/ContextualHeader';
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

  // Timer Component
  const timerComponent = (
    <PriorityTimerDisplay
      workoutTime={formatTime(elapsedTime)}
      restTime={restTimerActive ? formatTime(currentRestTime) : undefined}
      isRestActive={restTimerActive}
      onRestTimerClick={() => {/* Handle rest timer click */}}
    />
  );

  // Header Component
  const headerComponent = (
    <ContextualHeader
      title={trainingConfig?.trainingType || 'Training Session'}
      variant="overlay"
      showCloseButton
      onClose={handleExitWorkout}
      actions={
        <div className="text-sm text-gray-300">
          {Object.keys(exercises).length} exercises
        </div>
      }
    />
  );

  return (
    <UnifiedLayout
      variant="training"
      timerComponent={timerComponent}
      headerComponent={headerComponent}
    >
      <div className="container mx-auto px-4 pb-24">
        <ExerciseList
          exercises={exercises}
          onCompleteSet={handleCompleteSet}
          onDeleteExercise={removeExercise}
          onAddExercise={handleAddExercise}
        />
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
    </UnifiedLayout>
  );
};

export default TrainingSessionPage;
