
import React from "react";
import { Exercise } from "@/types/exercise";
import { Dumbbell, ArrowRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { typography } from "@/lib/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MinimalisticExerciseSelectProps {
  onSelectExercise: (exercise: string | Exercise) => void;
  suggestedExercises?: Exercise[];
  recentExercises?: Exercise[];
  trainingType?: string;
  className?: string;
}

export function MinimalisticExerciseSelect({
  onSelectExercise,
  suggestedExercises = [],
  recentExercises = [],
  trainingType = "",
  className
}: MinimalisticExerciseSelectProps) {
  // Combine recent and suggested exercises, ensuring no duplicates
  const recentFirst = [...recentExercises.slice(0, 3)];
  const remaining = suggestedExercises.filter(
    e => !recentFirst.some(r => r.id === e.id)
  );
  const allExercises = [...recentFirst, ...remaining].slice(0, 12); // Show up to 12 exercises
  
  // Split into recommended and other exercises
  const recommendedExercises = allExercises.slice(0, 4);
  const otherExercises = allExercises.slice(4);

  return (
    <div className={cn("space-y-5", className)}>
      {recentFirst.length > 0 && (
        <div className="space-y-2">
          <h3 className={cn(typography.headings.h4, "text-purple-300 px-1")}>
            Recently Used
          </h3>
          <div className="space-y-2">
            {recentFirst.map((exercise) => (
              <ExerciseItem 
                key={exercise.id}
                exercise={exercise}
                onSelectExercise={onSelectExercise}
                isRecent={true}
              />
            ))}
          </div>
        </div>
      )}

      {recommendedExercises.length > 0 && (
        <div className="space-y-2">
          <h3 className={cn(typography.headings.h4, "text-purple-300 px-1")}>
            Recommended for {trainingType || "Your Workout"}
          </h3>
          <div className="space-y-2">
            {recommendedExercises.map((exercise) => (
              <ExerciseItem 
                key={exercise.id}
                exercise={exercise}
                onSelectExercise={onSelectExercise}
                isRecommended={true}
              />
            ))}
          </div>
        </div>
      )}

      {otherExercises.length > 0 && (
        <div className="space-y-2">
          <h3 className={cn(typography.headings.h4, "text-gray-400 px-1")}>
            Other Exercises
          </h3>
          <div className="space-y-2">
            {otherExercises.map((exercise) => (
              <ExerciseItem 
                key={exercise.id}
                exercise={exercise}
                onSelectExercise={onSelectExercise}
              />
            ))}
          </div>
        </div>
      )}

      <Button 
        variant="outline" 
        className="w-full py-5 flex items-center justify-center gap-2 border-dashed border-gray-700"
        onClick={() => onSelectExercise("Browse All")}
      >
        <Plus size={16} className="text-purple-400" />
        Browse All Exercises
        <ArrowRight size={16} className="ml-2" />
      </Button>
    </div>
  );
}

interface ExerciseItemProps {
  exercise: Exercise;
  onSelectExercise: (exercise: string | Exercise) => void;
  isRecent?: boolean;
  isRecommended?: boolean;
}

function ExerciseItem({ exercise, onSelectExercise, isRecent, isRecommended }: ExerciseItemProps) {
  // Determine main muscle group for badge
  const primaryMuscle = exercise.primary_muscle_groups?.[0] || "general";
  
  return (
    <Card 
      className={cn(
        "transition-all duration-200 hover:scale-[1.02] overflow-hidden",
        "border border-gray-800 bg-gradient-to-r",
        isRecent ? "from-purple-900/20 to-purple-800/5" : 
        isRecommended ? "from-blue-900/20 to-blue-800/5" : 
        "from-gray-900 to-gray-800/50"
      )}
      onClick={() => onSelectExercise(exercise)}
    >
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center mr-3",
              isRecent ? "bg-purple-500/20" : 
              isRecommended ? "bg-blue-500/20" : 
              "bg-gray-800"
            )}>
              <Dumbbell className={cn(
                "w-4 h-4",
                isRecent ? "text-purple-300" : 
                isRecommended ? "text-blue-300" : 
                "text-gray-400"
              )} />
            </div>
            <div>
              <p className={cn(typography.text.primary, "font-medium")}>
                {exercise.name}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-xs py-0 px-2 h-5 capitalize",
                    primaryMuscle === "chest" ? "text-red-300 border-red-800/50" :
                    primaryMuscle === "back" ? "text-blue-300 border-blue-800/50" :
                    primaryMuscle === "legs" ? "text-green-300 border-green-800/50" :
                    primaryMuscle === "shoulders" ? "text-yellow-300 border-yellow-800/50" :
                    primaryMuscle === "arms" ? "text-purple-300 border-purple-800/50" :
                    primaryMuscle === "core" ? "text-orange-300 border-orange-800/50" :
                    "text-gray-300 border-gray-700"
                  )}
                >
                  {primaryMuscle}
                </Badge>
                {exercise.equipment_type && exercise.equipment_type[0] && (
                  <span className="text-xs text-gray-500 capitalize">
                    {exercise.equipment_type[0]}
                  </span>
                )}
              </div>
            </div>
          </div>
          <ArrowRight size={16} className="text-gray-500" />
        </div>
      </CardContent>
    </Card>
  );
}
