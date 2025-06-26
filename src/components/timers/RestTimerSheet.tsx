
import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { RestTimerControlPanel } from './RestTimerControlPanel';
import { RestTimer } from '@/hooks/useTrainingTimers';

interface RestTimerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restTimer: RestTimer;
  exerciseName?: string;
}

export const RestTimerSheet: React.FC<RestTimerSheetProps> = ({
  open,
  onOpenChange,
  restTimer,
  exerciseName
}) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-gray-900 border-gray-700">
        <SheetHeader>
          <SheetTitle className="text-white">
            Rest Timer Controls
          </SheetTitle>
          <SheetDescription className="text-gray-400">
            {exerciseName ? `Managing rest time for ${exerciseName}` : 'Adjust your rest timer settings'}
          </SheetDescription>
        </SheetHeader>
        
        <div className="mt-6">
          <RestTimerControlPanel 
            restTimer={restTimer}
            className="border-0 bg-transparent p-0"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
