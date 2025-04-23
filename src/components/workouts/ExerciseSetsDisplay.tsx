
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ClipboardEdit, Trash2 } from "lucide-react";
import { ExerciseSet } from "@/types/exercise";

interface ExerciseSetsDisplayProps {
  exerciseName: string;
  sets: ExerciseSet[];
  onEdit: (exerciseName: string) => void;
  onDelete: (exerciseName: string) => void;
}

export const ExerciseSetsDisplay: React.FC<ExerciseSetsDisplayProps> = ({
  exerciseName,
  sets,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-gray-800/50 rounded-lg p-3">
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium text-sm">{exerciseName}</h4>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(exerciseName)}
            className="h-7 w-7 text-gray-400 hover:text-white hover:bg-gray-700"
          >
            <ClipboardEdit size={14} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(exerciseName)}
            className="h-7 w-7 text-gray-400 hover:text-red-400 hover:bg-gray-700"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1 text-xs text-gray-400">
        <div>Set</div>
        <div className="text-right">Weight</div>
        <div className="text-right">Reps</div>
        <div className="text-right">Volume</div>
      </div>
      <Separator className="my-1 bg-gray-700" />
      {sets.map((set) => (
        <div key={set.id} className="grid grid-cols-4 gap-1 text-sm py-1">
          <div>{set.set_number}</div>
          <div className="text-right font-mono">{set.weight}</div>
          <div className="text-right font-mono">{set.reps}</div>
          <div className="text-right font-mono">{set.weight * set.reps}</div>
        </div>
      ))}
    </div>
  );
};
