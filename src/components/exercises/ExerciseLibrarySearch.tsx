
import React from 'react';
import { Button } from '@/components/ui/button';
import { ExerciseSearchBar } from './ExerciseSearchBar';

interface ExerciseLibrarySearchProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isSearching: boolean;
  fromCache: boolean;
  isIndexed: boolean;
  totalExercises: number;
  useVirtualization: boolean;
  onToggleVirtualization: () => void;
}

export const ExerciseLibrarySearch: React.FC<ExerciseLibrarySearchProps> = ({
  searchQuery,
  onSearchChange,
  isSearching,
  fromCache,
  isIndexed,
  totalExercises,
  useVirtualization,
  onToggleVirtualization
}) => {
  return (
    <>
      {/* Search bar */}
      <ExerciseSearchBar
        searchTerm={searchQuery}
        onSearchChange={onSearchChange}
        isLoading={isSearching}
        fromCache={fromCache}
        isIndexed={isIndexed}
        totalExercises={totalExercises}
        className="mb-4"
      />
      
      {/* Virtualization toggle for large lists */}
      {totalExercises > 50 && (
        <div className="flex justify-end mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleVirtualization}
            className="text-xs text-gray-400 hover:text-gray-300"
          >
            {useVirtualization ? 'Standard View' : 'Virtual Scroll'}
          </Button>
        </div>
      )}
    </>
  );
};
