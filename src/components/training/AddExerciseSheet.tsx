
import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import AllExercisesPage from "@/pages/AllExercisesPage";
import { useIsMobile } from "@/hooks/use-mobile";

interface AddExerciseSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectExercise: (exercise: string | any) => void;
}

export const AddExerciseSheet: React.FC<AddExerciseSheetProps> = ({
  open,
  onOpenChange,
  onSelectExercise
}) => {
  const isMobile = useIsMobile();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={isMobile ? "bottom" : "right"} className="overflow-y-scroll max-h-[90vh]">
        <SheetHeader>
          <SheetTitle>Add an Exercise</SheetTitle>
        </SheetHeader>
        <AllExercisesPage onSelectExercise={onSelectExercise} />
      </SheetContent>
    </Sheet>
  );
};
