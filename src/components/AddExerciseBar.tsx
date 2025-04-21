
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExerciseAutocomplete } from "@/components/ExerciseAutocomplete";
import { ExerciseQuickSelect } from "@/components/ExerciseQuickSelect";
import { Exercise } from "@/types/exercise";
import { useIsMobile } from "@/hooks/use-mobile";
import { useExerciseSuggestions } from "@/hooks/useExerciseSuggestions";
import { theme } from "@/lib/theme";

interface AddExerciseBarProps {
  onSelectExercise: (exercise: Exercise) => void;
  onAddExercise: () => void;
  trainingType?: string;
}

export function AddExerciseBar({ 
  onSelectExercise, 
  onAddExercise,
  trainingType = ""
}: AddExerciseBarProps) {
  const isMobile = useIsMobile();
  const { suggestedExercises } = useExerciseSuggestions(trainingType);
  
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-900 via-gray-900/95 to-gray-900/0 z-40">
      <div className="space-y-4">
        <ExerciseQuickSelect
          onSelectExercise={onSelectExercise}
          suggestedExercises={suggestedExercises}
          className="mb-2"
        />
        
        <div className={cn(
          "flex gap-4",
          isMobile ? "flex-col" : "flex-row"
        )}>
          <div className={cn(
            "flex-1",
            isMobile ? "order-2" : "order-1"
          )}>
            <ExerciseAutocomplete 
              onSelectExercise={onSelectExercise} 
              className="w-full bg-gray-800/50 border-gray-700/50 text-white"
            />
          </div>
          <Button 
            onClick={onAddExercise}
            className={cn(
              "px-8 py-6 font-medium rounded-xl",
              "bg-gradient-to-r from-purple-600 to-pink-500",
              "hover:from-purple-700 hover:to-pink-600",
              "transform transition-all duration-300",
              "hover:scale-[1.02] active:scale-[0.98]",
              "shadow-lg hover:shadow-purple-500/25",
              "border border-purple-500/20",
              "text-white",
              isMobile ? "order-1 w-full flex justify-center items-center gap-2" : "order-2"
            )}
          >
            <Plus className="w-5 h-5" />
            {isMobile && <span className={theme.textStyles.primary}>Add Exercise</span>}
          </Button>
        </div>
      </div>
    </div>
  );
}
