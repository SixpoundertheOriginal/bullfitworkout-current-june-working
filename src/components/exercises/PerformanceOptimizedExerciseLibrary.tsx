
import React, { useMemo, useCallback, useEffect, useState } from 'react';
import { Exercise } from '@/types/exercise';
import { ExerciseLibraryContainer } from './ExerciseLibraryContainer';
import { PremiumSearchBar } from './PremiumSearchBar';
import { SmartFilterChips } from './SmartFilterChips';
import { VisualEquipmentFilter } from './VisualEquipmentFilter';
import { VirtualizedExerciseGrid } from './VirtualizedExerciseGrid';
import { ExerciseFilters } from './ExerciseFilters';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerformanceOptimizedExerciseLibraryProps {
  onSelectExercise?: (exercise: Exercise) => void;
  onCreateExercise?: () => void;
  showCreateButton?: boolean;
}

export const PerformanceOptimizedExerciseLibrary: React.FC<PerformanceOptimizedExerciseLibraryProps> = React.memo(({
  onSelectExercise,
  onCreateExercise,
  showCreateButton = false
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
        console.log('PerformanceOptimizedExerciseLibrary render:', {
          totalExercises: exercises?.length || 0,
          currentExercises: currentExercises?.length || 0,
          searchQuery: state.searchQuery,
          activeFilters: Object.keys(searchFilters).length,
          isLoading,
          isSearching
        });

        if (isError) {
          return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <div className="w-8 h-8 text-red-400">⚠️</div>
              </div>
              <div className="text-red-400 space-y-2">
                <p className="text-lg font-medium">Error loading exercises</p>
                <p className="text-sm">Please try refreshing the page</p>
              </div>
            </div>
          );
        }

        return (
          <div className="flex flex-col h-full space-y-6">
            {/* Premium Header */}
            <div className="space-y-4">
              {/* Enhanced Search Bar */}
              <PremiumSearchBar
                searchTerm={state.searchQuery}
                onSearchChange={actions.setSearchQuery}
                totalExercises={exercises?.length || 0}
                filteredCount={currentExercises?.length || 0}
                onFiltersToggle={() => setShowFilters(!showFilters)}
                hasActiveFilters={Object.keys(searchFilters).length > 0}
                isLoading={isLoading || isSearching}
              />

              {/* Smart Filter Chips */}
              <SmartFilterChips
                selectedMuscleGroup={state.selectedMuscleGroup}
                selectedEquipment={state.selectedEquipment}
                selectedDifficulty={state.selectedDifficulty}
                onMuscleGroupChange={actions.setSelectedMuscleGroup}
                onEquipmentChange={actions.setSelectedEquipment}
                onDifficultyChange={actions.setSelectedDifficulty}
                onClearAll={() => {
                  actions.setSelectedMuscleGroup('all');
                  actions.setSelectedEquipment('all');
                  actions.setSelectedDifficulty('all');
                  actions.setSearchQuery('');
                }}
              />

              {/* Toolbar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* View Mode Toggle */}
                  <div className="flex items-center bg-gray-900/50 rounded-lg p-1 border border-gray-800">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 w-8 p-0 transition-all duration-200",
                        viewMode === 'grid'
                          ? "bg-purple-600 text-white"
                          : "text-gray-400 hover:text-gray-300"
                      )}
                      onClick={() => setViewMode('grid')}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 w-8 p-0 transition-all duration-200",
                        viewMode === 'list'
                          ? "bg-purple-600 text-white"
                          : "text-gray-400 hover:text-gray-300"
                      )}
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Advanced Filters Toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-9 px-3 transition-all duration-200",
                      showFilters
                        ? "bg-purple-900/50 border-purple-500/50 text-purple-300"
                        : "border-gray-700 text-gray-400 hover:text-gray-300"
                    )}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Advanced
                  </Button>
                </div>

                {/* Create Button */}
                {showCreateButton && onCreateExercise && (
                  <Button 
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    onClick={onCreateExercise}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Exercise
                  </Button>
                )}
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <Card className="bg-gray-900/50 border-gray-800 animate-in fade-in slide-in-from-top-2 duration-300">
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Visual Equipment Filter */}
                    <VisualEquipmentFilter
                      selectedEquipment={state.selectedEquipment}
                      onEquipmentChange={actions.setSelectedEquipment}
                    />

                    {/* Traditional Filters */}
                    <div className="space-y-4">
                      <ExerciseFilters
                        isOpen={true}
                        onToggle={() => {}}
                        selectedMuscleGroup={state.selectedMuscleGroup}
                        onMuscleGroupChange={actions.setSelectedMuscleGroup}
                        selectedEquipment={state.selectedEquipment}
                        onEquipmentChange={actions.setSelectedEquipment}
                        selectedDifficulty={state.selectedDifficulty}
                        onDifficultyChange={actions.setSelectedDifficulty}
                        selectedMovement={state.selectedMovement}
                        onMovementChange={actions.setSelectedMovement}
                        onClearAll={() => {
                          actions.setSelectedMuscleGroup('all');
                          actions.setSelectedEquipment('all');
                          actions.setSelectedDifficulty('all');
                          actions.setSelectedMovement('all');
                        }}
                        resultCount={currentExercises?.length || 0}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Exercise Grid */}
            <div className="flex-1 min-h-0">
              <VirtualizedExerciseGrid
                exercises={currentExercises || []}
                onSelectExercise={onSelectExercise}
                isLoading={isLoading}
                className="h-full"
              />
            </div>
          </div>
        );
      }}
    </ExerciseLibraryContainer>
  );
});

PerformanceOptimizedExerciseLibrary.displayName = 'PerformanceOptimizedExerciseLibrary';
