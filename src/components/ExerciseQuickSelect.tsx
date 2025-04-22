
import React from "react";
import { Exercise } from "@/types/exercise";
import { Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";
import { typography } from "@/lib/typography";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface ExerciseQuickSelectProps {
  onSelectExercise: (exercise: string | Exercise) => void;
  suggestedExercises?: Exercise[];
  recentExercises?: Exercise[];
  className?: string;
}

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

export function ExerciseQuickSelect({
  onSelectExercise,
  suggestedExercises = [],
  recentExercises = [],
  className
}: ExerciseQuickSelectProps) {
  // Combine recent and suggested exercises, ensuring no duplicates
  const recentFirst = [...recentExercises.slice(0, 3)];
  const remaining = suggestedExercises.filter(
    e => !recentFirst.some(r => r.id === e.id)
  );
  const allExercises = [...recentFirst, ...remaining].slice(0, 12); // Show up to 12 exercises
  
  // Split exercises into two rows
  const firstRowExercises = allExercises.slice(0, Math.ceil(allExercises.length / 2));
  const secondRowExercises = allExercises.slice(Math.ceil(allExercises.length / 2));

  return (
    <div className={cn("space-y-3", className)}>
      <div className="w-full">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2">
            {firstRowExercises.map((exercise, idx) => (
              <CarouselItem key={exercise.id} className="pl-2 basis-1/3 md:basis-1/4 lg:basis-1/5">
                <button
                  onClick={() => onSelectExercise(exercise)}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-full w-16 h-16 mx-auto",
                    "border border-white/10 bg-gradient-to-br shadow-md",
                    "transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/20",
                    "animate-pulse-slow",
                    CIRCLE_COLORS[idx % CIRCLE_COLORS.length]
                  )}
                  aria-label={exercise.name}
                >
                  <Dumbbell className="w-5 h-5 mb-0.5 text-white" />
                  <span className={cn(typography.text.primary, "text-xs font-medium text-center px-1 max-w-full truncate")}>
                    {exercise.name}
                  </span>
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0 text-white border-white/20 bg-black/30 hover:bg-black/50" />
          <CarouselNext className="right-0 text-white border-white/20 bg-black/30 hover:bg-black/50" />
        </Carousel>
      </div>

      {secondRowExercises.length > 0 && (
        <div className="w-full">
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-2">
              {secondRowExercises.map((exercise, idx) => (
                <CarouselItem key={exercise.id} className="pl-2 basis-1/3 md:basis-1/4 lg:basis-1/5">
                  <button
                    onClick={() => onSelectExercise(exercise)}
                    className={cn(
                      "flex flex-col items-center justify-center rounded-full w-16 h-16 mx-auto",
                      "border border-white/10 bg-gradient-to-br shadow-md",
                      "transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/20",
                      "animate-pulse-slow",
                      CIRCLE_COLORS[(idx + firstRowExercises.length) % CIRCLE_COLORS.length]
                    )}
                    aria-label={exercise.name}
                  >
                    <Dumbbell className="w-5 h-5 mb-0.5 text-white" />
                    <span className={cn(typography.text.primary, "text-xs font-medium text-center px-1 max-w-full truncate")}>
                      {exercise.name}
                    </span>
                  </button>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="left-0 text-white border-white/20 bg-black/30 hover:bg-black/50" />
            <CarouselNext className="right-0 text-white border-white/20 bg-black/30 hover:bg-black/50" />
          </Carousel>
        </div>
      )}
    </div>
  );
}
