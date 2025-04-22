
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Exercise } from "@/types/exercise";
import { ExerciseQuickSelect } from "@/components/ExerciseQuickSelect";
import { useExerciseSuggestions } from "@/hooks/useExerciseSuggestions";

interface EmptyWorkoutStateProps {
  onTemplateSelect: (exercise: string | Exercise) => void;
}

// We'll show the suggestions for "strength" as default for now.
// You can wire up trainingType prop if you want it dynamic.
export const EmptyWorkoutState: React.FC<EmptyWorkoutStateProps> = ({ onTemplateSelect }) => {
  const { suggestedExercises } = useExerciseSuggestions("strength");

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-10">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Begin Your Workout</h2>
        <p className="text-gray-400">Add exercises to start tracking your session</p>
      </div>
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          {/* Suggestions in the center */}
          <div>
            <h3 className="font-semibold mb-3 text-white text-center">Quick Add Exercises</h3>
            <ExerciseQuickSelect 
              onSelectExercise={onTemplateSelect}
              suggestedExercises={suggestedExercises}
              className="mb-4"
            />
          </div>
          <div className="mt-6">
            <Button 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
              size="lg"
              onClick={() => { /* Could open an all-exercises modal/search in future */ }}
            >
              <Search className="w-4 h-4 mr-2" />
              Browse All Exercises
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
