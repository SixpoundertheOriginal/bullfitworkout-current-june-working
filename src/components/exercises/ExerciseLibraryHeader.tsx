
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, ChevronLeft } from 'lucide-react';

interface ExerciseLibraryHeaderProps {
  standalone: boolean;
  onBack?: () => void;
  onAdd: () => void;
}

export const ExerciseLibraryHeader: React.FC<ExerciseLibraryHeaderProps> = ({
  standalone,
  onBack,
  onAdd
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      {onBack && (
        <Button 
          variant="ghost"
          size="sm" 
          onClick={onBack}
          className="flex items-center gap-2 -ml-2"
        >
          <ChevronLeft size={18} />
          Back
        </Button>
      )}
      
      <div className="flex-1 flex justify-center">
        <h1 className="text-xl font-semibold text-center">
          {standalone ? "Exercise Library" : "Browse Exercises"}
        </h1>
      </div>
      
      {standalone && (
        <Button 
          onClick={onAdd}
          size="sm"
          variant="outline"
          className="h-9 px-3 rounded-full bg-purple-900/30 border-purple-500/30 hover:bg-purple-800/50"
        >
          <Plus size={16} className="mr-1" />
          New Exercise
        </Button>
      )}
    </div>
  );
};
