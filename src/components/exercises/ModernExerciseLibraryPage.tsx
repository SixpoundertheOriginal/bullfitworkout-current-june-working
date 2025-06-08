
import React, { useState, useMemo } from 'react';
import { Plus, Filter, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useLibraryExercises } from '@/hooks/useLibraryExercises';
import { VirtualizedExerciseGrid } from './VirtualizedExerciseGrid';
import { OptimizedExerciseSearchBar } from './OptimizedExerciseSearchBar';
import { StreamlinedExerciseCreationModal } from './StreamlinedExerciseCreationModal';
import { ExerciseFilters } from './ExerciseFilters';
import { MuscleGroup, EquipmentType, Difficulty, MovementPattern } from '@/types/exercise';

export const ModernExerciseLibraryPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filter states
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | 'all'>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [selectedMovement, setSelectedMovement] = useState<MovementPattern | 'all'>('all');

  // Build filters object
  const filters = useMemo(() => ({
    search: searchTerm,
    muscleGroup: selectedMuscleGroup !== 'all' ? selectedMuscleGroup : undefined,
    equipment: selectedEquipment !== 'all' ? selectedEquipment : undefined,
    difficulty: selectedDifficulty !== 'all' ? selectedDifficulty : undefined,
    movement: selectedMovement !== 'all' ? selectedMovement : undefined
  }), [searchTerm, selectedMuscleGroup, selectedEquipment, selectedDifficulty, selectedMovement]);

  const { exercises, isLoading, createExercise, isCreating } = useLibraryExercises(filters);

  const hasActiveFilters = useMemo(() => {
    return selectedMuscleGroup !== 'all' || 
           selectedEquipment !== 'all' || 
           selectedDifficulty !== 'all' || 
           selectedMovement !== 'all';
  }, [selectedMuscleGroup, selectedEquipment, selectedDifficulty, selectedMovement]);

  const handleCreateExercise = async (exerciseData: any) => {
    try {
      await createExercise({
        ...exerciseData,
        user_id: 'current-user-id' // This should come from auth context
      });
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create exercise:', error);
    }
  };

  const clearAllFilters = () => {
    setSelectedMuscleGroup('all');
    setSelectedEquipment('all');
    setSelectedDifficulty('all');
    setSelectedMovement('all');
    setSearchTerm('');
  };

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Exercise Library</h1>
          <p className="text-gray-400">Discover and manage your exercise collection</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="text-gray-400 hover:text-white"
          >
            {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
          </Button>
          
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Exercise
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 mb-6 bg-gray-900 border-gray-700">
        <OptimizedExerciseSearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          totalExercises={exercises?.length || 0}
          filteredCount={exercises?.length || 0}
          onFiltersToggle={() => setShowFilters(!showFilters)}
          hasActiveFilters={hasActiveFilters}
          isLoading={isLoading}
        />
        
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-700">
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
              onClearAll={clearAllFilters}
              resultCount={exercises?.length || 0}
            />
          </div>
        )}
      </Card>

      {/* Exercise Grid */}
      <div className="flex-1 min-h-0">
        <VirtualizedExerciseGrid
          exercises={exercises || []}
          isLoading={isLoading}
          onSelectExercise={(exercise) => console.log('Select:', exercise)}
          onEditExercise={(exercise) => console.log('Edit:', exercise)}
          onDeleteExercise={(exercise) => console.log('Delete:', exercise)}
          className="h-full"
        />
      </div>

      {/* Create Exercise Modal */}
      <StreamlinedExerciseCreationModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSubmit={handleCreateExercise}
        loading={isCreating}
      />
    </div>
  );
};
