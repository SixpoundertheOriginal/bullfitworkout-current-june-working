
import React, { useState } from 'react';
import { useOptimizedExercises } from '@/hooks/useOptimizedExercises';
import { ExerciseLibraryContainer } from './ExerciseLibraryContainer';
import { ExerciseLibraryHeader } from '@/components/library/ExerciseLibraryHeader';
import { ExerciseLibraryContent } from '@/components/library/ExerciseLibraryContent';
import { ViewToggle, ViewMode } from '@/components/ui/ViewToggle';
import { ExerciseCreationWizard } from './ExerciseCreationWizard';
import { ExerciseFilters } from './ExerciseFilters';
import { ExerciseLibraryPerformanceMonitor } from './ExerciseLibraryPerformanceMonitor';
import { toast } from '@/hooks/use-toast';
import { useAuth } from "@/context/AuthContext";

export const ModernExerciseLibraryPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { createExercise, isPending } = useOptimizedExercises();

  const handleCreateExercise = async (exerciseData: any) => {
    if (!user?.id) {
      console.error("No authenticated user found");
      toast({
        title: "Authentication Error",
        description: "Please log in to create exercises",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createExercise({
        ...exerciseData,
        user_id: user.id
      });
      setShowCreateWizard(false);
      
      toast({
        title: "Exercise created successfully! 🎉",
        description: `${exerciseData.name} has been added with optimized performance`,
      });
    } catch (error) {
      console.error('Failed to create exercise:', error);
      toast({
        title: "Failed to create exercise",
        description: error instanceof Error ? error.message : "Please try again or check your connection",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditExercise = (exercise: any) => {
    console.log('Edit exercise:', exercise);
    toast({
      title: "Edit functionality",
      description: "Exercise editing will be available soon",
    });
  };

  const handleDeleteExercise = (exercise: any) => {
    console.log('Delete exercise:', exercise);
    toast({
      title: "Delete functionality",
      description: "Exercise deletion will be available soon",
      variant: "destructive"
    });
  };

  const handleViewExercise = (exercise: any) => {
    console.log('View exercise details:', exercise);
    toast({
      title: "Exercise details",
      description: `Viewing details for ${exercise.name}`,
    });
  };

  if (authLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  const isProcessing = isPending || isSubmitting;

  return (
    <ExerciseLibraryContainer>
      {({ state, actions, filteredAll, isLoading, searchResults, totalPages }) => (
        <div className="flex flex-col h-full max-w-7xl mx-auto p-4 space-y-6">
          {/* Header Section */}
          <ExerciseLibraryHeader
            searchTerm={state.searchQuery}
            onSearchChange={actions.setSearchQuery}
            totalExercises={filteredAll.length}
            filteredCount={filteredAll.length}
            hasActiveFilters={state.searchQuery !== '' || state.selectedMuscleGroup !== 'all'}
            isLoading={isLoading}
            onCreateExercise={() => setShowCreateWizard(true)}
            onFiltersToggle={() => setShowFilters(!showFilters)}
            isProcessing={isProcessing}
          />

          {/* Toolbar Section */}
          <div className="flex items-center justify-between">
            <ViewToggle
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>

          {/* Filters Section */}
          {showFilters && (
            <div className="bg-gray-900/50 border border-gray-700/50 backdrop-blur-sm rounded-lg p-6">
              <ExerciseFilters
                isOpen={showFilters}
                onToggle={() => setShowFilters(!showFilters)}
                selectedMuscleGroup={state.selectedMuscleGroup}
                onMuscleGroupChange={actions.setSelectedMuscleGroup}
                selectedEquipment={state.selectedEquipment}
                onEquipmentChange={actions.setSelectedEquipment}
                selectedDifficulty={state.selectedDifficulty}
                onDifficultyChange={actions.setSelectedDifficulty}
                selectedMovement={state.selectedMovement}
                onMovementChange={actions.setSelectedMovement}
                onClearAll={actions.clearFilters}
                resultCount={filteredAll.length}
              />
            </div>
          )}

          {/* Content Section */}
          <ExerciseLibraryContent
            exercises={filteredAll}
            isLoading={isLoading}
            onSelectExercise={handleViewExercise}
            onEditExercise={handleEditExercise}
            onDeleteExercise={handleDeleteExercise}
          />

          {/* Modals */}
          <ExerciseCreationWizard
            open={showCreateWizard}
            onOpenChange={setShowCreateWizard}
            onSubmit={handleCreateExercise}
            loading={isProcessing}
          />

          {/* Performance Monitor */}
          <ExerciseLibraryPerformanceMonitor
            exercises={filteredAll}
            isLoading={isLoading}
            searchTerm={state.searchQuery}
          />
        </div>
      )}
    </ExerciseLibraryContainer>
  );
};
