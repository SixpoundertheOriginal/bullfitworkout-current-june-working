
import React from 'react';
import { Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  className?: string;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({
  viewMode,
  onViewModeChange,
  className
}) => {
  return (
    <div className={cn("flex items-center border border-gray-700 rounded-md", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewModeChange('grid')}
        className={cn(
          "px-3 py-1.5 rounded-l-md rounded-r-none border-r border-gray-700",
          viewMode === 'grid' 
            ? "bg-gray-700 text-white" 
            : "text-gray-400 hover:text-gray-300 hover:bg-gray-800"
        )}
        aria-label="Grid view"
      >
        <Grid className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onViewModeChange('list')}
        className={cn(
          "px-3 py-1.5 rounded-r-md rounded-l-none",
          viewMode === 'list' 
            ? "bg-gray-700 text-white" 
            : "text-gray-400 hover:text-gray-300 hover:bg-gray-800"
        )}
        aria-label="List view"
      >
        <List className="w-4 h-4" />
      </Button>
    </div>
  );
};
