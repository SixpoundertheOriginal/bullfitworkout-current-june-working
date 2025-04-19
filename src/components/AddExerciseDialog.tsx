
import React, { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExerciseAutocomplete } from "@/components/ExerciseAutocomplete";
import { Exercise } from "@/types/exercise";

interface AddExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddExercise: (exerciseName: string) => Promise<void>;
}

export function AddExerciseDialog({
  open,
  onOpenChange,
  onAddExercise
}: AddExerciseDialogProps) {
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [isAdding, setIsAdding] = useState(false);

  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise.name);
  };

  const handleAddExercise = async () => {
    if (!selectedExercise) return;
    
    try {
      setIsAdding(true);
      await onAddExercise(selectedExercise);
      setSelectedExercise("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding exercise:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">Add Exercise</DialogTitle>
          <DialogDescription className="text-gray-400">
            Select an exercise to add to your workout.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <ExerciseAutocomplete onSelectExercise={handleSelectExercise} />
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleAddExercise}
            disabled={!selectedExercise || isAdding}
            className="bg-purple-600 text-white hover:bg-purple-700"
          >
            {isAdding ? "Adding..." : "Add Exercise"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
