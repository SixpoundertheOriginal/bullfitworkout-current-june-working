
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExerciseAutocomplete } from "@/components/ExerciseAutocomplete";
import { Exercise } from "@/types/exercise";

interface AddExerciseBarProps {
  onSelectExercise: (exercise: Exercise) => void;
  onAddExercise: () => void;
}

export function AddExerciseBar({ onSelectExercise, onAddExercise }: AddExerciseBarProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-900 via-gray-900/95 to-gray-900/0">
      <div className="flex gap-4">
        <div className="flex-1">
          <ExerciseAutocomplete 
            onSelectExercise={onSelectExercise} 
            className="w-full bg-gray-800/50 border-gray-700/50"
          />
        </div>
        <Button 
          onClick={onAddExercise}
          className={cn(
            "px-8 py-6 font-medium rounded-xl",
            "bg-gradient-to-r from-purple-600 to-pink-500",
            "hover:from-purple-700 hover:to-pink-600",
            "transform transition-all duration-300",
            "hover:scale-[1.02] active:scale-[0.98]",
            "shadow-lg hover:shadow-purple-500/25",
            "border border-purple-500/20"
          )}
        >
          <Plus className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
