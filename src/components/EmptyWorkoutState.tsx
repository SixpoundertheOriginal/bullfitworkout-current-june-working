
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Exercise } from "@/types/exercise";
import { ExerciseQuickSelect } from "@/components/ExerciseQuickSelect";
import { useExerciseSuggestions } from "@/hooks/useExerciseSuggestions";
import { useNavigate } from "react-router-dom";
import { CircularGradientButton } from "@/components/CircularGradientButton";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyWorkoutStateProps {
  onTemplateSelect: (exercise: string | Exercise) => void;
}

export const EmptyWorkoutState: React.FC<EmptyWorkoutStateProps> = ({ onTemplateSelect }) => {
  const { suggestedExercises } = useExerciseSuggestions("strength");
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-10">
      <Card 
        className={cn(
          "w-full max-w-md",
          "bg-gradient-to-br from-purple-600/10 via-purple-600/5 to-pink-500/10",
          "border border-purple-500/20 shadow-lg hover:shadow-xl transition-shadow duration-300",
          "backdrop-blur-sm"
        )}
      >
        <CardContent className="p-6 space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-1">Begin Your Workout</h2>
            <div className="mb-1 mt-0.5 text-purple-100 text-md font-medium">
              Embark on a new fitness adventure.
            </div>
            <p className="text-purple-200 text-sm">
              Sculpt your strength, one rep at a time. Your fitness journey starts now.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-3 text-white text-center">Quick Add Exercises</h3>
            <ExerciseQuickSelect 
              onSelectExercise={onTemplateSelect}
              suggestedExercises={suggestedExercises}
              className="mb-4"
            />
          </div>
          
          <div className="flex justify-center">
            <CircularGradientButton
              size={84}
              onClick={() => navigate("/all-exercises")}
              icon={<Search size={28} className="text-white" />}
              className="shadow-xl"
            >
              Browse All
            </CircularGradientButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
