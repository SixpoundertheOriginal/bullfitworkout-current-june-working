import React, { useMemo, useCallback, useEffect, useState, useRef } from 'react';
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

// Aggressive memoization for frame rate optimization
const MemoizedPremiumSearchBar = React.memo(PremiumSearchBar);
const MemoizedSmartFilterChips = React.memo(SmartFilterChips);
const MemoizedVisualEquipmentFilter = React.memo(VisualEquipmentFilter);
const MemoizedExerciseFilters = React.memo(ExerciseFilters);
const MemoizedVirtualizedExerciseGrid = React.memo(VirtualizedExerciseGrid);

export const PerformanceOptimizedExerciseLibrary: React.FC<PerformanceOptimizedExerciseLibraryProps> = React.memo(({
  onSelectExercise,
  onCreateExercise,
  showCreateButton = false
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const idleCallbackRef = useRef<number | null>(null);
  const updateQueueRef = useRef<(() => void)[]>([]);

  // Optimize non-critical updates with requestIdleCallback
  const scheduleIdleUpdate = useCallback((updateFn: () => void) => {
    updateQueueRef.current.push(updateFn);
    
    if (idleCallbackRef.current) return;
    
    if ('requestIdleCallback' in window) {
      idleCallbackRef.current = requestIdleCallback(() => {
        const updates = updateQueueRef.current.splice(0);
        updates.forEach(update => update());
        idleCallbackRef.current = null;
      });
    } else {
      // Fallback for browsers without requestIdleCallback
      idleCallbackRef.current = setTimeout(() => {
        const updates = updateQueueRef.current.splice(0);
        updates.forEach(update => update());
        idleCallbackRef.current = null;
      }, 16) as unknown as number; // Target 60fps
    }
  }, []);

  // Memoized toggle handlers to prevent re-renders
  const handleFiltersToggle = useCallback(() => {
    scheduleIdleUpdate(() => setShowFilters(prev => !prev));
  }, [scheduleIdleUpdate]);

  const handleViewModeToggle = useCallback((mode: 'grid' | 'list') => {
    if (mode !== viewMode) {
      scheduleIdleUpdate(() => setViewMode(mode));
    }
  }, [viewMode, scheduleIdleUpdate]);

  // Cleanup idle callbacks
  useEffect(() => {
    return () => {
      if (idleCallbackRef.current) {
        if ('requestIdleCallback' in window) {
          cancelIdleCallback(idleCallbackRef.current);
        } else {
          clearTimeout(idleCallbackRef.current);
        }
      }
    };
  }, []);

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
        // Memoize expensive calculations
        const memoizedExerciseCount = useMemo(() => exercises?.length || 0, [exercises?.length]);
        const memoizedCurrentCount = useMemo(() => currentExercises?.length || 0, [currentExercises?.length]);
        const memoizedActiveFilters = useMemo(() => Object.keys(searchFilters).length, [searchFilters]);

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
          <div className="flex flex-col h-full space-y-8">
            {/* Optimized Header */}
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
                <div className="flex-1">
                  <MemoizedPremiumSearchBar
                    searchTerm={state.searchQuery}
                    onSearchChange={actions.setSearchQuery}
                    totalExercises={memoizedExerciseCount}
                    filteredCount={memoizedCurrentCount}
                    onFiltersToggle={handleFiltersToggle}
                    hasActiveFilters={memoizedActiveFilters > 0}
                    isLoading={isLoading || isSearching}
                  />
                </div>

                {showCreateButton && onCreateExercise && (
                  <div className="flex-shrink-0">
                    <Button 
                      className="h-14 px-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 whitespace-nowrap"
                      onClick={onCreateExercise}
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create Exercise
                    </Button>
                  </div>
                )}
              </div>

              <div className="py-2">
                <MemoizedSmartFilterChips
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
              </div>

              {/* Optimized Toolbar */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-800/50">
                <div className="flex items-center gap-4">
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
                      onClick={() => handleViewModeToggle('grid')}
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
                      onClick={() => handleViewModeToggle('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                      "h-9 px-3 transition-all duration-200",
                      showFilters
                        ? "bg-purple-900/50 border-purple-500/50 text-purple-300"
                        : "border-gray-700 text-gray-400 hover:text-gray-300"
                    )}
                    onClick={handleFiltersToggle}
                  >
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Advanced
                  </Button>
                </div>

                <div className="text-sm text-gray-400">
                  {isLoading || isSearching ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
                      Searching...
                    </span>
                  ) : (
                    <span>
                      {memoizedCurrentCount} of {memoizedExerciseCount} exercises
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Optimized Filters Panel */}
            {showFilters && (
              <Card className="bg-gray-900/50 border-gray-800 animate-in fade-in slide-in-from-top-2 duration-300">
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <MemoizedVisualEquipmentFilter
                      selectedEquipment={state.selectedEquipment}
                      onEquipmentChange={actions.setSelectedEquipment}
                    />

                    <div className="space-y-4">
                      <MemoizedExerciseFilters
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
                        resultCount={memoizedCurrentCount}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Optimized Exercise Grid */}
            <div className="flex-1 min-h-0 pt-4 border-t border-gray-800/30">
              <MemoizedVirtualizedExerciseGrid
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
}, (prevProps, nextProps) => {
  // Custom comparison to prevent unnecessary re-renders
  return (
    prevProps.showCreateButton === nextProps.showCreateButton &&
    prevProps.onSelectExercise === nextProps.onSelectExercise &&
    prevProps.onCreateExercise === nextProps.onCreateExercise
  );
});

PerformanceOptimizedExerciseLibrary.displayName = 'PerformanceOptimizedExerciseLibrary';
