
import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { ExerciseSelector } from "@/components/exercises/ExerciseSelector";
import { useExerciseSuggestions } from "@/hooks/useExerciseSuggestions";
import { Exercise } from "@/types/exercise";
import AllExercisesPage from "@/pages/AllExercisesPage";

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
      // This would require passing the full exercise objects instead of just names
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
              <button 
                onClick={handleBackToSuggestions}
                className="bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back
              </button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
