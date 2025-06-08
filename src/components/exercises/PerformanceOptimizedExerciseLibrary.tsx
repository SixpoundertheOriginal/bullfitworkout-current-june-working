
import React, { useMemo, useCallback, useEffect } from 'react';
import { Exercise } from '@/types/exercise';
import { ExerciseLibraryContainer } from './ExerciseLibraryContainer';
import { OptimizedExerciseSearchBar } from './OptimizedExerciseSearchBar';
import { VirtualizedExerciseGrid } from './VirtualizedExerciseGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface PerformanceOptimizedExerciseLibraryProps {
  onSelectExercise?: (exercise: Exercise) => void;
  showCreateButton?: boolean;
}

export const PerformanceOptimizedExerciseLibrary: React.FC<PerformanceOptimizedExerciseLibraryProps> = React.memo(({
  onSelectExercise,
  showCreateButton = false
}) => {
  return (
    <ExerciseLibraryContainer>
      {({
        state,
        actions,
        exercises,
        currentExercises,
        isLoading,
        isSearching,
        isError,
        searchFilters
      }) => {
        // Add comprehensive debug logging
        console.log('PerformanceOptimizedExerciseLibrary render:', {
          totalExercises: exercises?.length || 0,
          currentExercises: currentExercises?.length || 0,
          searchQuery: state.searchQuery,
          activeFilters: Object.keys(searchFilters).length,
          isLoading,
          isSearching
        });

        // Log the actual exercise data being passed to the grid
        console.log('Exercises being passed to VirtualizedExerciseGrid:', {
          count: currentExercises?.length || 0,
          sampleNames: currentExercises?.slice(0, 3)?.map(e => e?.name) || []
        });

        if (isError) {
          return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-red-400 space-y-2">
                <p className="text-lg font-medium">Error loading exercises</p>
                <p className="text-sm">Please try refreshing the page</p>
              </div>
            </div>
          );
        }

        return (
          <div className="flex flex-col h-full space-y-6">
            {/* Search Bar */}
            <OptimizedExerciseSearchBar
              searchTerm={state.searchQuery}
              onSearchChange={actions.setSearchQuery}
              totalExercises={exercises?.length || 0}
              filteredCount={currentExercises?.length || 0}
              isLoading={isLoading || isSearching}
              hasActiveFilters={Object.keys(searchFilters).length > 0}
            />

            {/* Create Button */}
            {showCreateButton && (
              <div className="flex justify-end">
                <Button 
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => {/* Handle create */}}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Exercise
                </Button>
              </div>
            )}

            {/* Exercise Grid */}
            <div className="flex-1 min-h-0">
              {isLoading && !currentExercises?.length ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-48 bg-gray-800/50 rounded-lg" />
                  ))}
                </div>
              ) : (
                <VirtualizedExerciseGrid
                  exercises={currentExercises || []}
                  onSelectExercise={onSelectExercise}
                  isLoading={isLoading}
                  className="h-full"
                />
              )}
            </div>
          </div>
        );
      }}
    </ExerciseLibraryContainer>
  );
});

PerformanceOptimizedExerciseLibrary.displayName = 'PerformanceOptimizedExerciseLibrary';
