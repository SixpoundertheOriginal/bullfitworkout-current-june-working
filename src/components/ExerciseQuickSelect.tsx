
import React from "react";
import { Exercise } from "@/types/exercise";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExerciseQuickRadialSelect } from "./ExerciseQuickRadialSelect";
import { typography } from "@/lib/typography";

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
  // Default: Show up to 8 unique exercises in radial if available (prefer recent first).
  const maxRadial = 8;
  const recentFirst = [...recentExercises.slice(0, 3)];
  const remaining = suggestedExercises.filter(
    e => !recentFirst.some(r => r.id === e.id)
  );
  const quickAccessExercises = [...recentFirst, ...remaining].slice(0, maxRadial);

  // If enough, show radial, else fallback to horizontal scroll with new chip styles.
  if (quickAccessExercises.length > 3) {
    return (
      <ExerciseQuickRadialSelect
        exercises={quickAccessExercises}
        onSelectExercise={onSelectExercise}
        className={className}
      />
    );
  }

  // Fallback: show them as colorful circular chips.
  const CIRCLE_COLORS = [
    "from-purple-500 via-purple-400 to-pink-400",
    "from-blue-500 via-blue-400 to-cyan-400",
    "from-pink-500 via-pink-400 to-orange-400",
    "from-green-500 via-green-400 to-teal-400",
    "from-yellow-400 via-yellow-300 to-orange-300",
    "from-teal-500 via-teal-400 to-cyan-400",
    "from-red-500 via-pink-400 to-purple-400",
    "from-orange-500 via-yellow-400 to-pink-400",
    "from-lime-500 via-green-400 to-blue-400",
    "from-sky-500 via-blue-400 to-indigo-400",
  ];

  return (
    <div className={cn("space-y-4", className)}>
      <ScrollArea className="w-full whitespace-nowrap pb-4">
        <div className="flex w-max space-x-3 px-1">
          {quickAccessExercises.map((exercise, idx) => (
            <button
              key={exercise.id}
              className={cn(
                "flex flex-col items-center justify-center rounded-full shadow-lg transition hover:scale-105 outline-none",
                "w-14 h-14 border-2 border-white/10 bg-gradient-to-br text-white hover:ring-2 hover:ring-white/30 focus-visible:ring-2 focus-visible:ring-white/50",
                "animate-pulse-slow",
                CIRCLE_COLORS[idx % CIRCLE_COLORS.length],
              )}
              aria-label={exercise.name}
              onClick={() => onSelectExercise(exercise)}
            >
              <Dumbbell className="w-5 h-5 mb-0.5 text-white" />
              <span className={cn(typography.text.primary, "text-xs font-semibold px-0.5 whitespace-nowrap")}>
                {exercise.name}
              </span>
            </button>
          ))}
        </div>
        <ScrollBar orientation="horizontal" className="bg-gray-700/20" />
      </ScrollArea>
    </div>
  );
}
