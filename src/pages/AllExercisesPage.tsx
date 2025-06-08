
import React, { useCallback, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { ExerciseCreationWizard } from "@/components/exercises/ExerciseCreationWizard";
import { PerformanceOptimizedExerciseLibrary } from "@/components/exercises/PerformanceOptimizedExerciseLibrary";
import { Exercise } from "@/types/exercise";
import { useIsMobile } from "@/hooks/use-mobile";
import { ExerciseFAB } from "@/components/ExerciseFAB";
import { PageHeader } from "@/components/navigation/PageHeader";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useOptimizedExercises } from "@/hooks/useOptimizedExercises";
import { useAuth } from "@/context/AuthContext";

interface AllExercisesPageProps {
  onSelectExercise?: (exercise: string | Exercise) => void;
  standalone?: boolean;
  onBack?: () => void;
}

export default function AllExercisesPage({ onSelectExercise, standalone = true, onBack }: AllExercisesPageProps) {
  const { createExercise, isPending } = useOptimizedExercises();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user, loading: authLoading } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateWizard, setShowCreateWizard] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);

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

  // Handle wizard submission with optimized performance
  const handleCreateExercise = useCallback(async (exerciseData: any) => {
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
  }, [createExercise, toast, user?.id]);

  const handleDeleteConfirm = useCallback(async (exerciseToDelete: Exercise | null) => {
    if (!exerciseToDelete) return;
    
    toast({
      title: "Exercise deleted",
      description: `${exerciseToDelete.name} has been removed from your library`,
    });
    setDeleteConfirmOpen(false);
    setExerciseToDelete(null);
  }, [toast]);

  if (authLoading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  const isLoading = isPending || isSubmitting;

  return (
    <div className={`${standalone ? 'pt-16 pb-24' : ''} h-full overflow-hidden flex flex-col`}>
      {standalone && <PageHeader title="Exercise Library" />}
      
      <div className={`flex-1 overflow-hidden flex flex-col mx-auto w-full max-w-4xl px-4 ${standalone ? 'py-4' : 'pt-0'}`}>
        {/* Use the optimized exercise library component */}
        <PerformanceOptimizedExerciseLibrary
          onSelectExercise={handleSelectExercise}
          showCreateButton={standalone}
        />
        
        {/* Exercise Creation Wizard */}
        <ExerciseCreationWizard
          open={showCreateWizard}
          onOpenChange={setShowCreateWizard}
          onSubmit={handleCreateExercise}
          loading={isLoading}
        />
        
        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Exercise</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{exerciseToDelete?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => handleDeleteConfirm(exerciseToDelete)} 
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      {/* Mobile Add Button */}
      {standalone && isMobile && (
        <ExerciseFAB onClick={() => setShowCreateWizard(true)} />
      )}
    </div>
  );
}
