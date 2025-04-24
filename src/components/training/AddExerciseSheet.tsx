
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { ExerciseSelector } from "@/components/exercises/ExerciseSelector";
import { useExerciseSuggestions } from "@/hooks/useExerciseSuggestions";
import { Exercise } from "@/types/exercise";

interface AddExerciseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectExercise: (exercise: string | Exercise) => void;
  trainingType?: string;
  currentExercises?: string[];
}

export const AddExerciseSheet: React.FC<AddExerciseSheetProps> = ({
  open,
  onOpenChange,
  onSelectExercise,
  trainingType = "",
  currentExercises = []
}) => {
  const isMobile = useIsMobile();

  // Get suggested exercises based on training type
  const { suggestedExercises } = useExerciseSuggestions(trainingType);
  
  // Get primary muscle groups from current exercises to suggest related exercises
  const currentFocus = React.useMemo(() => {
    const muscleGroups = new Set<string>();
    if (currentExercises.length > 0) {
      // Here we could analyze current exercises to determine focus areas
      // This would require passing the full exercise objects instead of just names
      return Array.from(muscleGroups);
    }
    return [];
  }, [currentExercises]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={isMobile ? "bottom" : "right"} className="overflow-y-scroll max-h-[90vh]">
        <SheetHeader>
          <SheetTitle>Add an Exercise</SheetTitle>
        </SheetHeader>
        <ExerciseSelector
          onSelectExercise={onSelectExercise}
          trainingType={trainingType}
          bodyFocus={currentFocus}
          useLegacyDesign={false}
          className="mt-4"
        />
      </SheetContent>
    </Sheet>
  );
};
