
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Exercise } from "@/types/exercise";
import { ExerciseQuickSelect } from "@/components/ExerciseQuickSelect";
import { useExerciseSuggestions } from "@/hooks/useExerciseSuggestions";
import { useNavigate } from "react-router-dom";
import { CircularGradientButton } from "@/components/CircularGradientButton";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { theme } from "@/lib/theme";
import { typography } from "@/lib/typography";

interface EmptyWorkoutStateProps {
  onTemplateSelect: (exercise: string | Exercise) => void;
}

export const EmptyWorkoutState: React.FC<EmptyWorkoutStateProps> = ({ onTemplateSelect }) => {
  const { suggestedExercises } = useExerciseSuggestions("strength");
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center space-y-6 py-10">
      <div className="w-full max-w-md">
        <Card 
          className={cn(
            "w-full",
            "bg-gradient-to-br from-gray-900 via-gray-900/98 to-gray-900/95",
            "border border-purple-500/20 shadow-lg hover:shadow-xl transition-shadow duration-300",
            "backdrop-blur-sm"
          )}
        >
          <CardContent className="p-6 space-y-6">
            <div 
              className={cn(
                "rounded-xl p-4 md:p-5 bg-gradient-to-r from-purple-600/30 to-pink-500/30", 
                "border border-purple-500/20 shadow-lg backdrop-blur-sm",
                "hover:shadow-purple-500/10 transition-all duration-300"
              )}
            >
              <div className="text-center">
                <h2 className={cn(typography.headings.primary, "text-2xl mb-1")}>
                  Begin Your Workout
                </h2>
                <div className={cn(typography.text.secondary, "mb-1 mt-0.5 text-md")}>
                  Embark on a new fitness adventure
                </div>
                <p className={cn(typography.text.muted, "text-sm")}>
                  Sculpt your strength, one rep at a time. Your fitness journey starts now.
                </p>
              </div>
            </div>
            
            <div>
              <h3 className={cn(typography.headings.section, "mb-3 text-center")}>
                Quick Add Exercises
              </h3>
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
    </div>
  );
};
