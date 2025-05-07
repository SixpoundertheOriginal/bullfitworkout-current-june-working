
import React, { memo } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ExerciseEmptyStateProps {
  hasSearch: boolean;
  hasActiveFilters: boolean;
  onClearFilters?: () => void;
  onAddNew?: () => void;
}

const ExerciseEmptyState: React.FC<ExerciseEmptyStateProps> = ({
  hasSearch,
  hasActiveFilters,
  onClearFilters,
  onAddNew
}) => {
  return (
    <div className="text-center py-12">
      <div className="bg-gray-800/50 rounded-lg py-10 px-6 max-w-md mx-auto">
        {hasSearch || hasActiveFilters ? (
          <>
            <h3 className="text-xl font-medium mb-2">No matching exercises</h3>
            <p className="text-gray-400 mb-6">Try adjusting your filters or search query</p>
            {onClearFilters && (
              <Button variant="outline" onClick={onClearFilters}>Clear filters</Button>
            )}
          </>
        ) : (
          <>
            <h3 className="text-xl font-medium mb-2">No exercises found</h3>
            <p className="text-gray-400 mb-6">Create your first exercise to get started</p>
            {onAddNew && (
              <Button variant="gradient" onClick={onAddNew}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Exercise
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default memo(ExerciseEmptyState);
