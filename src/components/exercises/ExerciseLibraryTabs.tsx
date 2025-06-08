
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExerciseFilters } from './ExerciseFilters';
import { ExerciseTabsContent } from './ExerciseTabsContent';
import { Exercise, MuscleGroup, EquipmentType, Difficulty, MovementPattern } from '@/types/exercise';

interface ExerciseLibraryTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  
  // Filter props
  showFilters: boolean;
  onToggleFilters: () => void;
  selectedMuscleGroup: MuscleGroup | 'all';
  onMuscleGroupChange: (muscle: MuscleGroup | 'all') => void;
  selectedEquipment: EquipmentType | 'all';
  onEquipmentChange: (equipment: EquipmentType | 'all') => void;
  selectedDifficulty: Difficulty | 'all';
  onDifficultyChange: (difficulty: Difficulty | 'all') => void;
  selectedMovement: MovementPattern | 'all';
  onMovementChange: (movement: MovementPattern | 'all') => void;
  onClearFilters: () => void;
  
  // Exercise data
  suggestedExercises: Exercise[];
  filteredRecent: Exercise[];
  currentExercises: Exercise[];
  isLoading: boolean;
  isSearching: boolean;
  isIndexed: boolean;
  isError: boolean;
  isOnline: boolean;
  
  // Pagination
  showPagination: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  
  // Actions
  standalone: boolean;
  useVirtualization: boolean;
  onSelectExercise: (exercise: Exercise) => void;
  onEdit?: (exercise: Exercise) => void;
  onDelete?: (exercise: Exercise) => void;
  onViewDetails?: (exercise: Exercise) => void;
  onDuplicate?: (exercise: Exercise) => void;
  onAddExercise: () => void;
}

export const ExerciseLibraryTabs: React.FC<ExerciseLibraryTabsProps> = ({
  activeTab,
  onTabChange,
  showFilters,
  onToggleFilters,
  selectedMuscleGroup,
  onMuscleGroupChange,
  selectedEquipment,
  onEquipmentChange,
  selectedDifficulty,
  onDifficultyChange,
  selectedMovement,
  onMovementChange,
  onClearFilters,
  suggestedExercises,
  filteredRecent,
  currentExercises,
  isLoading,
  isSearching,
  isIndexed,
  isError,
  isOnline,
  showPagination,
  currentPage,
  totalPages,
  onPageChange,
  standalone,
  useVirtualization,
  onSelectExercise,
  onEdit,
  onDelete,
  onViewDetails,
  onDuplicate,
  onAddExercise
}) => {
  const filteredAllCount = Array.isArray(currentExercises) ? currentExercises.length : 0;

  return (
    <Tabs className="flex-1 overflow-hidden flex flex-col" value={activeTab} onValueChange={onTabChange}>
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger value="suggested">Suggested</TabsTrigger>
        <TabsTrigger value="recent">Recent</TabsTrigger>
        <TabsTrigger value="browse">Browse All</TabsTrigger>
      </TabsList>
      
      {/* Filters - only show in browse tab */}
      {activeTab === 'browse' && (
        <ExerciseFilters
          isOpen={showFilters}
          onToggle={onToggleFilters}
          selectedMuscleGroup={selectedMuscleGroup}
          onMuscleGroupChange={onMuscleGroupChange}
          selectedEquipment={selectedEquipment}
          onEquipmentChange={onEquipmentChange}
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={onDifficultyChange}
          selectedMovement={selectedMovement}
          onMovementChange={onMovementChange}
          onClearAll={onClearFilters}
          resultCount={filteredAllCount}
          className="mb-4"
        />
      )}
      
      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Error state */}
        {isError && (
          <div className="text-red-500 text-center py-8">
            {isOnline ? "Error loading exercises. Please try again later." : "Unable to load exercises. Check your connection."}
          </div>
        )}
        
        {/* Tab Content */}
        {!isError && (
          <>
            <TabsContent value="suggested" className="mt-0 h-full">
              <ExerciseTabsContent
                exercises={suggestedExercises}
                isLoading={isLoading || (!isIndexed && Array.isArray(suggestedExercises) && suggestedExercises.length > 0)}
                isSearching={isSearching}
                variant={standalone ? 'library-manage' : 'workout-add'}
                useVirtualization={useVirtualization}
                onAdd={onSelectExercise}
                onEdit={standalone ? onEdit : undefined}
                onDelete={standalone ? onDelete : undefined}
                onViewDetails={standalone ? onViewDetails : undefined}
                onDuplicate={standalone ? onDuplicate : undefined}
                onAddExercise={onAddExercise}
                onClearFilters={onClearFilters}
                isOnline={isOnline}
              />
            </TabsContent>
            
            <TabsContent value="recent" className="mt-0 h-full">
              <ExerciseTabsContent
                exercises={filteredRecent}
                isLoading={isLoading || (!isIndexed && Array.isArray(filteredRecent) && filteredRecent.length > 0)}
                isSearching={isSearching}
                variant={standalone ? 'library-manage' : 'workout-add'}
                useVirtualization={useVirtualization}
                onAdd={onSelectExercise}
                onEdit={standalone ? onEdit : undefined}
                onDelete={standalone ? onDelete : undefined}
                onViewDetails={standalone ? onViewDetails : undefined}
                onDuplicate={standalone ? onDuplicate : undefined}
                onAddExercise={onAddExercise}
                onClearFilters={onClearFilters}
                isOnline={isOnline}
              />
            </TabsContent>
            
            <TabsContent value="browse" className="mt-0 h-full">
              <ExerciseTabsContent
                exercises={currentExercises}
                isLoading={isLoading || (!isIndexed && Array.isArray(currentExercises) && currentExercises.length > 0)}
                isSearching={isSearching}
                variant={standalone ? 'library-manage' : 'workout-add'}
                useVirtualization={useVirtualization}
                showPagination={showPagination}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
                onAdd={onSelectExercise}
                onEdit={standalone ? onEdit : undefined}
                onDelete={standalone ? onDelete : undefined}
                onViewDetails={standalone ? onViewDetails : undefined}
                onDuplicate={standalone ? onDuplicate : undefined}
                onAddExercise={onAddExercise}
                onClearFilters={onClearFilters}
                isOnline={isOnline}
              />
            </TabsContent>
          </>
        )}
      </div>
    </Tabs>
  );
};
