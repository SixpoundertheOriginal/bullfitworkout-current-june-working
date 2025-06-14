
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ExerciseList } from '@/components/training/ExerciseList';
import { UnifiedTimerDisplay } from '@/components/timers/UnifiedTimerDisplay';
import { useTrainingTimers } from '@/hooks/useTrainingTimers';
import { useWorkoutStore } from '@/store/workoutStore';
import { Exercise } from '@/types/exercise';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { AddExerciseSheet } from '@/components/training/AddExerciseSheet';
import { WorkoutSessionFooter } from '@/components/training/WorkoutSessionFooter';
import { useWorkoutSave } from '@/hooks/useWorkoutSave';
import { PageHeader } from '@/components/navigation/PageHeader';
import { toast } from '@/hooks/use-toast';

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

  const hasExercises = Object.keys(exercises).length > 0;

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <PageHeader 
        title={trainingConfig?.trainingType || 'Training Session'}
        showBackButton
        onBack={() => {
          // TODO: Add a confirmation dialog before resetting
          resetWorkout();
          navigate('/overview');
        }}
      >
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => {
            // TODO: Add a confirmation dialog before resetting
            resetWorkout();
            navigate('/overview');
          }} 
          aria-label="Cancel Workout"
        >
          <X className="h-6 w-6" />
        </Button>
      </PageHeader>
      
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 pt-4">
          <UnifiedTimerDisplay
            workoutTimer={workoutTimer}
            restTimer={restTimer}
            className="mb-6"
          />
        </div>

        <div className="container mx-auto px-4 pb-4">
          <ExerciseList
            exercises={exercises}
            onCompleteSet={handleCompleteSet}
            onDeleteExercise={removeExercise}
          />
        </div>
      </div>

      <WorkoutSessionFooter
        onAddExercise={() => setAddExerciseSheetOpen(true)}
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
    </div>
  );
};

export default TrainingSessionPage;
