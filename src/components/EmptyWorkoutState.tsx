
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Exercise } from "@/types/exercise";
import { ExerciseQuickSelect } from "@/components/ExerciseQuickSelect";
import { useExerciseSuggestions } from "@/hooks/useExerciseSuggestions";
import { useNavigate } from "react-router-dom";
import { CircularGradientButton } from "@/components/CircularGradientButton";
import { Search } from "lucide-react";

interface EmptyWorkoutStateProps {
  onTemplateSelect: (exercise: string | Exercise) => void;
}

// We'll show the suggestions for "strength" as default for now.
// You can wire up trainingType prop if you want it dynamic.
export const EmptyWorkoutState: React.FC<EmptyWorkoutStateProps> = ({ onTemplateSelect }) => {
  const { suggestedExercises } = useExerciseSuggestions("strength");
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-10">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Begin Your Workout</h2>
        <p className="text-gray-400">Add exercises to start tracking your session</p>
      </div>
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <div>
            <h3 className="font-semibold mb-3 text-white text-center">Quick Add Exercises</h3>
            <ExerciseQuickSelect 
              onSelectExercise={onTemplateSelect}
              suggestedExercises={suggestedExercises}
              className="mb-4"
            />
          </div>
          <div className="mt-8 flex justify-center">
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
