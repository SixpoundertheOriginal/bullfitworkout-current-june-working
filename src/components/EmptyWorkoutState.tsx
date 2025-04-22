
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dumbbell, Plus, Search } from "lucide-react";
import { Exercise } from "@/types/exercise";

interface EmptyWorkoutStateProps {
  onTemplateSelect: (exercise: string | Exercise) => void;
}

const popularExercises = [
  "Bench Press",
  "Squats",
  "Deadlift",
  "Pull-ups",
  "Push-ups",
  "Shoulder Press",
  "Decline Push-Up on Handrails"
];

export const EmptyWorkoutState: React.FC<EmptyWorkoutStateProps> = ({ onTemplateSelect }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-10">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Begin Your Workout</h2>
        <p className="text-gray-400">Add exercises to start tracking your session</p>
      </div>
      
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <h3 className="font-semibold mb-3">Popular Exercises</h3>
          <div className="grid grid-cols-2 gap-2">
            {popularExercises.map(exercise => (
              <Button
                key={exercise}
                variant="outline"
                size="sm"
                className="justify-start bg-gray-800/50 border-gray-700/50 text-white"
                onClick={() => onTemplateSelect(exercise)}
              >
                <Dumbbell className="w-4 h-4 mr-2 text-purple-400" />
                {exercise}
              </Button>
            ))}
          </div>
          
          <div className="mt-6">
            <Button 
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
              size="lg"
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
