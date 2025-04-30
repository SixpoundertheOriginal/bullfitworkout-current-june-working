
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { ExerciseSelector } from "@/components/exercises/ExerciseSelector";
import { useExerciseSuggestions } from "@/hooks/useExerciseSuggestions";
import { Exercise } from "@/types/exercise";
import AllExercisesPage from "@/pages/AllExercisesPage";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

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
  const [showAllExercises, setShowAllExercises] = useState(false);

  // Get suggested exercises based on training type
  const { suggestedExercises } = useExerciseSuggestions(trainingType);
  
  // Get primary muscle groups from current exercises to suggest related exercises
  const currentFocus = React.useMemo(() => {
    const muscleGroups = new Set<string>();
    if (currentExercises.length > 0) {
      // Here we could analyze current exercises to determine focus areas
      return Array.from(muscleGroups);
    }
    return [];
  }, [currentExercises]);

  const handleExerciseSelect = (exercise: string | Exercise) => {
    if (exercise === "Browse All") {
      setShowAllExercises(true);
    } else {
      onSelectExercise(exercise);
    }
  };

  const handleBackToSuggestions = () => {
    setShowAllExercises(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={isMobile ? "bottom" : "right"} className="overflow-y-scroll max-h-[90vh]">
        {!showAllExercises ? (
          <>
            <SheetHeader>
              <SheetTitle>Add an Exercise</SheetTitle>
            </SheetHeader>
            <ExerciseSelector
              onSelectExercise={handleExerciseSelect}
              trainingType={trainingType}
              bodyFocus={currentFocus}
              useLegacyDesign={false}
              className="mt-4"
            />
          </>
        ) : (
          <div className="h-full">
            <AllExercisesPage 
              onSelectExercise={(exercise) => {
                onSelectExercise(exercise);
                setShowAllExercises(false);
                onOpenChange(false);
              }}
            />
            <div className="fixed bottom-4 left-4 z-20">
              <Button 
                onClick={handleBackToSuggestions}
                variant="secondary"
                className="flex items-center gap-2 rounded-full bg-gray-800/70 hover:bg-gray-800 shadow-lg"
              >
                <ChevronLeft size={16} />
                Back
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
