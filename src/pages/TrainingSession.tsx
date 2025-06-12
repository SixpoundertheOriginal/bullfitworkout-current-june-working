
import React, { useState } from 'react';
import { ExerciseList } from '@/components/training/ExerciseList';
import { UnifiedTimerDisplay } from '@/components/timers/UnifiedTimerDisplay';
import { useTrainingTimers } from '@/hooks/useTrainingTimers';
import { useWorkoutStore } from '@/store/workoutStore';
import { ExerciseSet } from '@/types/exercise';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

const TrainingSessionPage: React.FC = () => {
  const [exercises, setExercises] = useState<Record<string, ExerciseSet[]>>({});
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const { workoutTimer, restTimer, handleSetCompletion } = useTrainingTimers();
  const { startWorkout } = useWorkoutStore();

  React.useEffect(() => {
    startWorkout();
    console.log('Workout started at:', new Date());
    console.log('TrainingSession page state:', { exercises, activeExercise });
  }, []);

  const handleAddExercise = () => {
    const exerciseName = `Exercise ${Object.keys(exercises).length + 1}`;
    setExercises(prev => ({
      ...prev,
      [exerciseName]: [
        {
          id: 1,
          weight: 0,
          reps: 0,
          duration: '0',
          completed: false,
          volume: 0
        }
      ]
    }));
  };

  const handleDeleteExercise = (exerciseName: string) => {
    setExercises(prev => {
      const newExercises = { ...prev };
      delete newExercises[exerciseName];
      return newExercises;
    });
  };

  const handleAddSet = (exerciseName: string) => {
    setExercises(prev => ({
      ...prev,
      [exerciseName]: [
        ...prev[exerciseName],
        {
          id: prev[exerciseName].length + 1,
          weight: 0,
          reps: 0,
          duration: '0',
          completed: false,
          volume: 0
        }
      ]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Training Session</h1>
            <Button variant="ghost" size="icon">
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Timer Display */}
      <div className="container mx-auto px-4 py-4">
        <UnifiedTimerDisplay
          workoutTimer={workoutTimer}
          restTimer={restTimer}
          className="mb-6"
        />
      </div>

      {/* Exercise List */}
      <div className="container mx-auto px-4 pb-20">
        <ExerciseList
          exercises={exercises}
          activeExercise={activeExercise}
          onAddSet={handleAddSet}
          onCompleteSet={handleSetCompletion}
          onDeleteExercise={handleDeleteExercise}
          onRemoveSet={() => {}}
          onEditSet={() => {}}
          onSaveSet={() => {}}
          onWeightChange={() => {}}
          onRepsChange={() => {}}
          onRestTimeChange={() => {}}
          onWeightIncrement={() => {}}
          onRepsIncrement={() => {}}
          onRestTimeIncrement={() => {}}
          onShowRestTimer={() => {}}
          onResetRestTimer={() => {}}
          onOpenAddExercise={handleAddExercise}
          setExercises={setExercises}
        />

        {/* Add Exercise Button */}
        {Object.keys(exercises).length === 0 && (
          <div className="flex justify-center">
            <Button 
              onClick={handleAddExercise}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add Exercise
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingSessionPage;
