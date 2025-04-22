
import React from "react";
import { Exercise } from "@/types/exercise";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Search, Plus, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { theme } from "@/lib/theme";

interface ExerciseQuickSelectProps {
  onSelectExercise: (exercise: string | Exercise) => void;
  suggestedExercises?: Exercise[];
  recentExercises?: Exercise[];
  className?: string;
}

export function ExerciseQuickSelect({
  onSelectExercise,
  suggestedExercises = [],
  recentExercises = [],
  className
}: ExerciseQuickSelectProps) {
  const quickAccessExercises = [
    ...recentExercises.slice(0, 3),
    ...suggestedExercises.slice(0, 5)
  ].slice(0, 5);

  return (
    <div className={cn("space-y-4", className)}>
      <ScrollArea className="w-full whitespace-nowrap pb-4">
        <div className="flex w-max space-x-2 px-1">
          {quickAccessExercises.map((exercise) => (
            <Button
              key={exercise.id}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 bg-gray-800/50 border-gray-700/50 hover:bg-gray-700/50 text-white exercise-suggestion value-text"
              onClick={() => onSelectExercise(exercise)}
            >
              <Dumbbell className="w-4 h-4 text-purple-400" />
              <span className="text-white font-medium value-text">{exercise.name}</span>
            </Button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="bg-gray-700/20" />
      </ScrollArea>
    </div>
  );
}
