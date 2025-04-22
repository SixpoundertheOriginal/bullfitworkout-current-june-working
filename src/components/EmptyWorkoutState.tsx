
import React from "react";
import { Typography } from "@/components/ui/typography";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ExerciseSelector } from "@/components/exercises/ExerciseSelector";
import { Exercise } from "@/types/exercise";
import { useLocation } from "react-router-dom";

interface EmptyWorkoutStateProps {
  onTemplateSelect: (exercise: string | Exercise) => void;
  className?: string;
}

export const EmptyWorkoutState: React.FC<EmptyWorkoutStateProps> = ({ 
  onTemplateSelect,
  className 
}) => {
  const location = useLocation();
  const locationState = location.state as any;
  const trainingType = locationState?.trainingType || 'strength';

  return (
    <div className={cn("flex flex-col items-center py-6", className)}>
      <Card className="w-full mb-4 bg-card/50 border-gray-800">
        <CardContent className="p-4">
          <h2 className="text-xl font-bold text-white mb-2">Begin Your Workout</h2>
          <p className="text-gray-400 text-sm mb-4">
            Add your first exercise to get started with your {trainingType} workout
          </p>
          
          <ExerciseSelector
            onSelectExercise={onTemplateSelect}
            trainingType={trainingType}
          />
        </CardContent>
      </Card>
    </div>
  );
};
