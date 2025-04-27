
import React from 'react';
import { ExerciseCard as ExerciseCardInfo } from './ExerciseCard';
import { LocalExerciseSet } from '@/hooks/useWorkoutState';
import { CircularGradientButton } from '@/components/CircularGradientButton';
import { PlusCircle } from 'lucide-react';
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

// This is a simplified version of ExerciseCard that uses string names instead of Exercise objects
interface ExerciseCardProps {
  exercise: string;
  sets: LocalExerciseSet[];
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
  isActive: boolean;
  onShowRestTimer: () => void;
  onResetRestTimer: () => void;
}

// Temporary ExerciseCard component that accepts exercise names instead of Exercise objects
const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  sets,
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
  isActive,
  onShowRestTimer,
  onResetRestTimer,
}) => {
  return (
    <div className={`p-4 rounded-lg border ${isActive ? 'border-blue-500' : 'border-gray-700'}`}>
      <h3 className="font-medium text-lg mb-2">{exercise}</h3>
      <div className="space-y-2">
        {sets.map((set, index) => (
          <div key={index} className="flex justify-between items-center p-2 bg-gray-800 rounded">
            <div>Set {index + 1}</div>
            <div>Weight: {set.weight} • Reps: {set.reps}</div>
            <div className="space-x-2">
              <button
                onClick={() => onCompleteSet(exercise, index)}
                className="p-1 text-xs bg-green-600 rounded"
              >
                {set.completed ? "Completed" : "Complete"}
              </button>
              <button
                onClick={() => onEditSet(exercise, index)}
                className="p-1 text-xs bg-gray-700 rounded"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
        <button
          onClick={() => onAddSet(exercise)}
          className="w-full p-2 bg-gray-700 rounded text-center"
        >
          + Add Set
        </button>
      </div>
    </div>
  );
};

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
      {Object.entries(exercises).map(([exerciseName, sets]) => (
        <div 
          key={exerciseName} 
          id={`exercise-${exerciseName}`}
          className="mb-4"
        >
          <ExerciseCard
            exercise={exerciseName}
            sets={sets}
            onAddSet={onAddSet}
            onCompleteSet={onCompleteSet}
            onRemoveSet={onRemoveSet}
            onEditSet={onEditSet}
            onSaveSet={onSaveSet}
            onWeightChange={onWeightChange}
            onRepsChange={onRepsChange}
            onRestTimeChange={onRestTimeChange}
            onWeightIncrement={onWeightIncrement}
            onRepsIncrement={onRepsIncrement}
            onRestTimeIncrement={onRestTimeIncrement}
            isActive={activeExercise === exerciseName}
            onShowRestTimer={onShowRestTimer}
            onResetRestTimer={onResetRestTimer}
          />
        </div>
      ))}
      
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
