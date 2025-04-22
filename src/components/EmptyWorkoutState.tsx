
import React from "react";
import { Dumbbell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyWorkoutStateProps {
  onTemplateSelect: (name: string) => void;
  className?: string;
}

export const EmptyWorkoutState: React.FC<EmptyWorkoutStateProps> = ({ 
  onTemplateSelect, 
  className 
}) => {
  const suggestedExercises = [
    "Bench Press",
    "Squats", 
    "Deadlift",
    "Pull-ups",
    "Leg Press"
  ];

  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center",
      "bg-gray-800/40 rounded-xl border border-gray-700/50",
      "backdrop-blur-sm",
      className
    )}>
      <div className="bg-gray-800/80 p-4 rounded-full mb-6">
        <Dumbbell className="h-10 w-10 text-purple-400" />
      </div>
      
      <h3 className="text-xl font-semibold text-white mb-2">Start Your Workout</h3>
      <p className="text-gray-400 mb-8 max-w-md">
        Add exercises to your workout to start tracking your sets and reps. 
        Choose from suggested exercises or add your own.
      </p>
      
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {suggestedExercises.map((exercise) => (
          <Button
            key={exercise}
            variant="outline"
            size="sm"
            className="bg-gray-700/80 hover:bg-gray-600 border-gray-600 text-white"
            onClick={() => onTemplateSelect(exercise)}
          >
            <Plus className="h-4 w-4 mr-2" />
            {exercise}
          </Button>
        ))}
      </div>
      
      <Button
        className="bg-gradient-to-r from-purple-600 to-pink-500 
          hover:from-purple-700 hover:to-pink-600 text-white"
        onClick={() => onTemplateSelect("Custom Exercise")}
      >
        <Plus className="h-5 w-5 mr-2" />
        Browse All Exercises
      </Button>
    </div>
  );
};
