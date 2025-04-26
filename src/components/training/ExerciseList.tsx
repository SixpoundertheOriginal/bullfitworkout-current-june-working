
import React from 'react';
import { ExerciseCard } from './ExerciseCard';
import { LocalExerciseSet } from '@/hooks/useWorkoutState';
import { CircularGradientButton } from '@/components/CircularGradientButton';
import { PlusCircle } from 'lucide-react';

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
