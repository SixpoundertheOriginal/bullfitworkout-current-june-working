
import React, { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { ExerciseCreationWizard } from "@/components/exercises/ExerciseCreationWizard";
import { Exercise } from "@/types/exercise";
import { useIsMobile } from "@/hooks/use-mobile";
import { ExerciseFAB } from "@/components/ExerciseFAB";
import { PageHeader } from "@/components/navigation/PageHeader";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { ExerciseLibraryContainer } from "@/components/exercises/ExerciseLibraryContainer";
import { ExerciseLibraryHeader } from "@/components/exercises/ExerciseLibraryHeader";
import { ExerciseLibrarySearch } from "@/components/exercises/ExerciseLibrarySearch";
import { ExerciseLibraryTabs } from "@/components/exercises/ExerciseLibraryTabs";
import { useExercises } from "@/hooks/useExercises";

interface AllExercisesPageProps {
  onSelectExercise?: (exercise: string | Exercise) => void;
  standalone?: boolean;
  onBack?: () => void;
}

export default function AllExercisesPage({ onSelectExercise, standalone = true, onBack }: AllExercisesPageProps) {
  const { createExercise, isPending } = useExercises();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const handleSelectExercise = useCallback((exercise: Exercise) => {
    if (onSelectExercise) {
      onSelectExercise(exercise);
    }
  }, [onSelectExercise]);

  const handleEdit = useCallback((exercise: Exercise) => {
    toast({
      title: "Edit Exercise",
      description: "Exercise editing will be available soon!",
    });
  }, [toast]);
  
  const handleViewDetails = useCallback((exercise: Exercise) => {
    toast({
      title: "View Details",
      description: `This feature will be implemented soon!`,
    });
  }, [toast]);
  
  const handleDuplicate = useCallback((exercise: Exercise) => {
    toast({
      title: "Duplicate Exercise",
      description: `This feature will be implemented soon!`,
    });
  }, [toast]);

  // Handle wizard submission
  const handleCreateExercise = useCallback(async (exerciseData: any) => {
    try {
      await createExercise({
        ...exerciseData,
        user_id: "current-user-id"
      });
      
      toast({
        title: "Exercise created successfully! 🎉",
        description: `${exerciseData.name} has been added to your library`,
      });
    } catch (error) {
      console.error('Failed to create exercise:', error);
      toast({
        title: "Failed to create exercise",
        description: "Please try again or check your connection",
        variant: "destructive"
      });
    }
  }, [createExercise, toast]);

  const handleDeleteConfirm = useCallback(async (exerciseToDelete: Exercise | null) => {
    if (!exerciseToDelete) return;
    
    toast({
      title: "Exercise deleted",
      description: `${exerciseToDelete.name} has been removed from your library`,
    });
  }, [toast]);

  return (
    <div className={`${standalone ? 'pt-16 pb-24' : ''} h-full overflow-hidden flex flex-col`}>
      {standalone && <PageHeader title="Exercise Library" />}
      
      <ExerciseLibraryContainer>
        {({ 
          state, 
          actions, 
          exercises,
          suggestedExercises, 
          filteredRecent, 
          currentExercises,
          isLoading,
          isSearching,
          isError,
          isIndexed,
          fromCache,
          isOnline,
          totalPages
        }) => (
          <div className={`flex-1 overflow-hidden flex flex-col mx-auto w-full max-w-4xl px-4 ${standalone ? 'py-4' : 'pt-0'}`}>
            {/* Exercise Creation Wizard */}
            <ExerciseCreationWizard
              open={state.showCreateWizard}
              onOpenChange={actions.setShowCreateWizard}
              onSubmit={handleCreateExercise}
              loading={isPending}
            />
            
            {/* Delete Confirmation Dialog */}
            <AlertDialog open={state.deleteConfirmOpen} onOpenChange={(open) => actions.setDeleteConfirm(open)}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Exercise</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{state.exerciseToDelete?.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => handleDeleteConfirm(state.exerciseToDelete)} 
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            {/* Header */}
            <ExerciseLibraryHeader
              standalone={standalone}
              onBack={onBack}
              onAdd={() => actions.setShowCreateWizard(true)}
            />
            
            {/* Search */}
            <ExerciseLibrarySearch
              searchQuery={state.searchQuery}
              onSearchChange={actions.setSearchQuery}
              isSearching={isSearching}
              fromCache={fromCache}
              isIndexed={isIndexed}
              totalExercises={exercises.length}
              useVirtualization={state.useVirtualization}
              onToggleVirtualization={() => actions.setUseVirtualization(!state.useVirtualization)}
            />
            
            {/* Tabs */}
            <ExerciseLibraryTabs
              activeTab={state.activeTab}
              onTabChange={actions.setActiveTab}
              showFilters={state.showFilters}
              onToggleFilters={() => actions.setShowFilters(!state.showFilters)}
              selectedMuscleGroup={state.selectedMuscleGroup}
              onMuscleGroupChange={actions.setSelectedMuscleGroup}
              selectedEquipment={state.selectedEquipment}
              onEquipmentChange={actions.setSelectedEquipment}
              selectedDifficulty={state.selectedDifficulty}
              onDifficultyChange={actions.setSelectedDifficulty}
              selectedMovement={state.selectedMovement}
              onMovementChange={actions.setSelectedMovement}
              onClearFilters={actions.clearFilters}
              suggestedExercises={suggestedExercises}
              filteredRecent={filteredRecent}
              currentExercises={currentExercises}
              isLoading={isLoading}
              isSearching={isSearching}
              isIndexed={isIndexed}
              isError={isError}
              isOnline={isOnline}
              showPagination={state.activeTab === 'browse'}
              currentPage={state.currentPage}
              totalPages={totalPages}
              onPageChange={actions.setCurrentPage}
              standalone={standalone}
              useVirtualization={state.useVirtualization}
              onSelectExercise={handleSelectExercise}
              onEdit={standalone ? handleEdit : undefined}
              onDelete={standalone ? (exercise) => actions.setDeleteConfirm(true, exercise) : undefined}
              onViewDetails={standalone ? handleViewDetails : undefined}
              onDuplicate={standalone ? handleDuplicate : undefined}
              onAddExercise={() => actions.setShowCreateWizard(true)}
            />
          </div>
        )}
      </ExerciseLibraryContainer>
      
      {/* Mobile Add Button */}
      {standalone && isMobile && (
        <ExerciseFAB onClick={() => {}} />
      )}
    </div>
  );
}
