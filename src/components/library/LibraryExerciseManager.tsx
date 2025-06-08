
import React, { useState, useMemo, useCallback } from 'react';
import { Exercise, MuscleGroup, EquipmentType, MovementPattern, Difficulty } from '@/types/exercise';
import { useLibraryExercises, LibraryFilters } from '@/hooks/useLibraryExercises';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';
import { ExerciseSearchBar } from '@/components/exercises/ExerciseSearchBar';
import { ExerciseFilters } from '@/components/exercises/ExerciseFilters';
import { VirtualizedExerciseList } from '@/components/exercises/VirtualizedExerciseList';
import { LazyExerciseCard } from '@/components/exercises/LazyExerciseCard';
import { Skeleton } from '@/components/ui/skeleton';

interface LibraryExerciseManagerProps {
  onAddExercise?: () => void;
  onEditExercise?: (exercise: Exercise) => void;
  onDeleteExercise?: (exercise: Exercise) => void;
  onViewDetails?: (exercise: Exercise) => void;
  onDuplicate?: (exercise: Exercise) => void;
  className?: string;
}

/**
 * Enterprise-grade library exercise manager
 * Optimized for large datasets with virtualization and advanced filtering
 */
export const LibraryExerciseManager: React.FC<LibraryExerciseManagerProps> = React.memo(({
  onAddExercise,
  onEditExercise,
  onDeleteExercise,
  onViewDetails,
  onDuplicate,
  className
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | 'all'>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [selectedMovement, setSelectedMovement] = useState<MovementPattern | 'all'>('all');
  const [useVirtualization, setUseVirtualization] = useState(false);

  // Build filters object
  const filters: LibraryFilters = useMemo(() => ({
    search: searchQuery,
    muscleGroup: selectedMuscleGroup !== 'all' ? selectedMuscleGroup : undefined,
    equipment: selectedEquipment !== 'all' ? selectedEquipment : undefined,
    difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
    movement: selectedMovement !== 'all' ? selectedMovement : undefined
  }), [searchQuery, selectedMuscleGroup, selectedEquipment, selectedDifficulty, selectedMovement]);

  const { 
    exercises, 
    isLoading, 
    error, 
    totalCount,
    prefetchExerciseDetails
  } = useLibraryExercises(filters);

  // Enable virtualization for large datasets
  React.useEffect(() => {
    if (exercises && Array.isArray(exercises)) {
      setUseVirtualization(exercises.length > 50);
    }
  }, [exercises]);

  const handleExerciseHover = useCallback((exercise: Exercise) => {
    // Prefetch exercise details on hover for instant loading
    if (exercise?.id) {
      prefetchExerciseDetails(exercise.id);
    }
  }, [prefetchExerciseDetails]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedMuscleGroup('all');
    setSelectedEquipment('all');
    setSelectedDifficulty('all');
    setSelectedMovement('all');
  }, []);

  if (error) {
    return (
      <div className="text-center py-8 text-red-400">
        <p>Unable to load exercise library.</p>
        <Button 
          variant="outline" 
          onClick={() => window.location.reload()}
          className="mt-4"
        >
          Retry
        </Button>
      </div>
    );
  }

  const safeExercises = exercises && Array.isArray(exercises) ? exercises : [];

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Exercise Library</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-gray-400"
          >
            <Filter size={16} className="mr-1" />
            Filters
          </Button>
          {onAddExercise && (
            <Button
              onClick={onAddExercise}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus size={16} className="mr-1" />
              Add Exercise
            </Button>
          )}
        </div>
      </div>

      {/* Search */}
      <ExerciseSearchBar
        searchTerm={searchQuery}
        onSearchChange={setSearchQuery}
        isLoading={isLoading}
        totalExercises={totalCount}
        className="mb-4"
      />

      {/* Filters */}
      {showFilters && (
        <ExerciseFilters
          isOpen={showFilters}
          onToggle={() => setShowFilters(!showFilters)}
          selectedMuscleGroup={selectedMuscleGroup}
          onMuscleGroupChange={setSelectedMuscleGroup}
          selectedEquipment={selectedEquipment}
          onEquipmentChange={setSelectedEquipment}
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={setSelectedDifficulty}
          selectedMovement={selectedMovement}
          onMovementChange={setSelectedMovement}
          onClearAll={clearFilters}
          resultCount={safeExercises.length}
          className="mb-4"
        />
      )}

      {/* Results */}
      <div className="flex-1 overflow-hidden">
        {isLoading ? (
          <LibraryManagerSkeleton />
        ) : safeExercises.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="mb-4">No exercises found</p>
            {(searchQuery || Object.values(filters).some(f => f !== undefined)) && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </div>
        ) : useVirtualization ? (
          <VirtualizedExerciseList
            exercises={safeExercises}
            onEdit={onEditExercise}
            onDelete={onDeleteExercise}
            onViewDetails={onViewDetails}
            onDuplicate={onDuplicate}
            onHover={handleExerciseHover}
          />
        ) : (
          <div className="space-y-4 overflow-y-auto">
            {safeExercises.map(exercise => (
              <LazyExerciseCard
                key={exercise.id}
                exercise={exercise}
                variant="library-manage"
                onEdit={() => onEditExercise?.(exercise)}
                onDelete={() => onDeleteExercise?.(exercise)}
                onViewDetails={() => onViewDetails?.(exercise)}
                onDuplicate={() => onDuplicate?.(exercise)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Performance indicator */}
      {safeExercises.length > 50 && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          {useVirtualization ? 'Virtual scrolling enabled' : `Showing ${safeExercises.length} exercises`}
        </div>
      )}
    </div>
  );
});

const LibraryManagerSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="bg-gray-900 border border-gray-700 rounded-lg p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <Skeleton className="h-5 w-3/4 bg-gray-800 mb-2" />
            <Skeleton className="h-4 w-full bg-gray-800 mb-1" />
            <Skeleton className="h-4 w-2/3 bg-gray-800" />
          </div>
          <Skeleton className="h-8 w-20 bg-gray-800 rounded" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 bg-gray-800 rounded-full" />
          <Skeleton className="h-6 w-20 bg-gray-800 rounded-full" />
          <Skeleton className="h-6 w-14 bg-gray-800 rounded-full" />
        </div>
      </div>
    ))}
  </div>
);

LibraryExerciseManager.displayName = 'LibraryExerciseManager';
