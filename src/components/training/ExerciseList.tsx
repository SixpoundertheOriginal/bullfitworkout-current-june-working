
import React from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlusCircle, Trash2 } from 'lucide-react';
import ExerciseCard from "@/components/exercises/ExerciseCard";

interface ExerciseListProps {
  exercises: {
    [key: string]: {
      weight: number;
      reps: number;
      restTime?: number;
      completed: boolean;
      isEditing?: boolean;
    }[];
  };
  activeExercise: string | null;
  onAddSet: (exerciseName: string) => void;
  onCompleteSet: (exerciseName: string, setIndex: number) => void;
  onRemoveSet: (exerciseName: string, setIndex: number) => void;
  onEditSet: (exerciseName: string, setIndex: number) => void;
  onSaveSet: (exerciseName: string, setIndex: number) => void;
  onWeightChange: (exerciseName: string, setIndex: number, value: string) => void;
  onRepsChange: (exerciseName: string, setIndex: number, value: string) => void;
  onRestTimeChange?: (exerciseName: string, setIndex: number, value: string) => void;
  onWeightIncrement: (exerciseName: string, setIndex: number, increment: number) => void;
  onRepsIncrement: (exerciseName: string, setIndex: number, increment: number) => void;
  onRestTimeIncrement?: (exerciseName: string, setIndex: number, increment: number) => void;
  onOpenAddExercise: () => void;
  onShowRestTimer: () => void;
  onResetRestTimer: () => void;
  onDeleteExercise: (exerciseName: string) => void;
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
  onOpenAddExercise,
  onShowRestTimer,
  onResetRestTimer,
  onDeleteExercise
}) => {
  const handleCompleteSet = (exerciseName: string, setIndex: number) => {
    onCompleteSet(exerciseName, setIndex);
    // Automatically show the rest timer when a set is completed
    onShowRestTimer();
    // Reset the rest timer to ensure it starts from zero
    onResetRestTimer();
  };
  
  if (Object.keys(exercises).length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <p className="mb-4">No exercises added yet</p>
        <Button
          onClick={onOpenAddExercise}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700"
        >
          <PlusCircle size={18} />
          Add Exercise
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ScrollArea className="h-full">
        {Object.keys(exercises).map(exerciseName => (
          <div key={exerciseName} className="mb-6 relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 hover:bg-red-500/10 hover:text-red-500"
              onClick={() => onDeleteExercise(exerciseName)}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
            <ExerciseCard 
              exercise={exerciseName}
              sets={exercises[exerciseName]}
              onAddSet={onAddSet}
              onCompleteSet={handleCompleteSet}
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
      </ScrollArea>
      
      <Button
        onClick={onOpenAddExercise}
        className="w-full py-3 flex items-center justify-center gap-2 
          bg-gradient-to-r from-purple-700/90 to-blue-700/90 
          hover:from-purple-700 hover:to-blue-700 
          text-white font-medium rounded-lg 
          transition-all duration-200 
          shadow-lg hover:shadow-xl"
      >
        <PlusCircle size={20} />
        Add Exercise
      </Button>
    </div>
  );
};
