
import React from 'react';
import { SetRow } from '@/components/SetRow';
import { LocalExerciseSet } from '@/hooks/useWorkoutState';
import { CircularGradientButton } from '@/components/CircularGradientButton';
import { PlusCircle } from 'lucide-react';
import { calculateSetVolume } from '@/utils/exerciseUtils';
import { Progress } from '@/components/ui/progress';
import { Exercise } from '@/types/exercise';

interface ExerciseListProps {
  exercises: Record<string, LocalExerciseSet[]>;
  activeExercise: string | null;
  onAddSet: (exerciseName: string) => void;
  onCompleteSet: (exerciseName: string, setIndex: number) => void;
  onRemoveSet: (exerciseName: string, setIndex: number) => void;
  onEditSet: (exerciseName: string, setIndex: number) => void;
  onSaveSet: (exerciseName: string, setIndex: number) => void;
  onWeightChange: (exerciseName: string, setIndex: number, value: string) => void;
  onRepsChange: (exerciseName: string, setIndex: number, value: string) => void;
  onRestTimeChange: (exerciseName: string, setIndex: number, value: string) => void;
  onWeightIncrement: (exerciseName: string, setIndex: number, increment: number) => void;
  onRepsIncrement: (exerciseName: string, setIndex: number, increment: number) => void;
  onRestTimeIncrement: (exerciseName: string, setIndex: number, increment: number) => void;
  onShowRestTimer: () => void;
  onResetRestTimer: () => void;
  onOpenAddExercise: () => void;
}

export const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  activeExercise,
  onAddSet,
  onCompleteSet,
  onRemoveSet,
  onEditSet,
  onSaveSet,
  onWeightChange,
  onRepsChange,
  onRestTimeChange,
  onWeightIncrement,
  onRepsIncrement,
  onRestTimeIncrement,
  onShowRestTimer,
  onResetRestTimer,
  onOpenAddExercise,
}) => {
  return (
    <div className="mb-4">
      {Object.entries(exercises).map(([exerciseName, sets]) => {
        const completedSets = sets.filter(set => set.completed).length;
        const totalVolume = sets.reduce((acc, set) => {
          // Create a compatible object for calculateSetVolume that only needs the weight and reps properties
          const volumeCalcSet = { weight: set.weight, reps: set.reps };
          return acc + calculateSetVolume(volumeCalcSet);
        }, 0);
        const progressPercent = (completedSets / sets.length) * 100;

        return (
          <div 
            key={exerciseName} 
            id={`exercise-${exerciseName}`}
            className="mb-8 bg-gray-900/50 rounded-lg p-4 border border-gray-800"
          >
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-white">{exerciseName}</h3>
                <span className="text-sm text-purple-400">
                  Total Volume: {Math.round(totalVolume)}kg
                </span>
              </div>
              <Progress value={progressPercent} className="h-1 bg-gray-800" />
            </div>

            <div className="space-y-2">
              {sets.map((set, index) => (
                <SetRow
                  key={`${exerciseName}-${index}`}
                  setNumber={index + 1}
                  weight={set.weight}
                  reps={set.reps}
                  restTime={set.restTime}
                  completed={set.completed}
                  isEditing={set.isEditing}
                  exerciseName={exerciseName}
                  onComplete={() => onCompleteSet(exerciseName, index)}
                  onEdit={() => onEditSet(exerciseName, index)}
                  onSave={() => onSaveSet(exerciseName, index)}
                  onRemove={() => onRemoveSet(exerciseName, index)}
                  onWeightChange={(e) => onWeightChange(exerciseName, index, e.target.value)}
                  onRepsChange={(e) => onRepsChange(exerciseName, index, e.target.value)}
                  onRestTimeChange={
                    (e) => onRestTimeChange(exerciseName, index, e.target.value)
                  }
                  onWeightIncrement={(value) => onWeightIncrement(exerciseName, index, value)}
                  onRepsIncrement={(value) => onRepsIncrement(exerciseName, index, value)}
                  onRestTimeIncrement={(value) => onRestTimeIncrement(exerciseName, index, value)}
                  weightUnit="kg"
                />
              ))}

              <button
                onClick={() => onAddSet(exerciseName)}
                className="w-full p-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-md text-gray-300 transition-colors mt-2"
              >
                + Add Set
              </button>
            </div>
          </div>
        );
      })}
      
      {/* Add Exercise Button */}
      <div className="flex justify-center mt-8">
        <CircularGradientButton
          onClick={onOpenAddExercise}
          icon={<PlusCircle size={32} className="text-white" />}
          size={96}
        >
          Add Exercise
        </CircularGradientButton>
      </div>
    </div>
  );
};
