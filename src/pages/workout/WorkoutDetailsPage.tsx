import React, { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { WorkoutDetailsLoading } from "@/components/workouts/WorkoutDetailsLoading";
import { WorkoutDetailsHeader } from "@/components/workouts/WorkoutDetailsHeader";
import { WorkoutDetailsEnhanced } from "@/components/workouts/WorkoutDetailsEnhanced";
import { WorkoutAnalysisSection } from "@/components/workouts/analysis/WorkoutAnalysisSection";
import { useWorkoutDetails } from "@/hooks/useWorkoutDetails";
import { useExerciseManagement } from "@/hooks/useExerciseManagement";
import { calculateMuscleFocus } from '@/utils/exerciseUtils';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { ExerciseDialog } from "@/components/ExerciseDialog";
import { EditWorkoutModal } from "@/components/EditWorkoutModal";
import { EditExerciseSetModal } from "@/components/EditExerciseSetModal";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, 
         AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, 
         AlertDialogAction } from "@/components/ui/alert-dialog";
import { useDeleteOperation } from "@/hooks/useAsyncOperation";
import { deleteWorkout } from "@/services/workoutService";
import { Loader2 } from "lucide-react";

const WorkoutDetailsPage = () => {
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const { 
    workoutDetails, 
    exerciseSets, 
    loading,
    setWorkoutDetails,
    setExerciseSets 
  } = useWorkoutDetails(workoutId);

  const {
    editModalOpen,
    setEditModalOpen,
    exerciseSetModalOpen,
    setExerciseSetModalOpen,
    currentExercise,
    exerciseSetsToEdit,
    deleteAlertOpen,
    setDeleteAlertOpen,
    exerciseToDelete,
    showAddDialog,
    setShowAddDialog,
    handleSaveWorkoutEdit,
    handleEditExercise,
    handleSaveExerciseSets,
    handleAddExercise,
    handleDeleteExercise,
    confirmDeleteExercise
  } = useExerciseManagement(workoutId, setExerciseSets);

  const deleteWorkoutOperation = useDeleteOperation(deleteWorkout, {
    successMessage: "Workout deleted successfully",
    errorMessage: "Failed to delete workout",
    redirectPath: "/training?tab=history",
    navigate
  });

  if (loading) {
    return <WorkoutDetailsLoading />;
  }

  // Calculate workout analysis metrics
  const totalRestTime = Object.values(exerciseSets).flat().reduce((total, set) => 
    total + (set.restTime || 60), 0);
  const activeWorkoutTime = workoutDetails ? workoutDetails.duration - (totalRestTime / 60) : 0;
  const totalVolume = Object.values(exerciseSets).flat()
    .filter(set => set.completed)
    .reduce((sum, set) => sum + (set.weight * set.reps), 0);
  const muscleFocus = calculateMuscleFocus(exerciseSets);

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-black text-white">
        <main className="flex-1 overflow-auto px-4 py-6 pb-24 mt-16">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/training?tab=history">Workouts</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>{workoutDetails?.name || "Workout Details"}</BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {workoutId && workoutDetails && (
            <>
              <WorkoutDetailsHeader
                workoutDetails={workoutDetails}
                onEditClick={() => setEditModalOpen(true)}
                onDeleteClick={() => setDeleteDialogOpen(true)}
              />

              <div className="mt-6">
                <WorkoutAnalysisSection
                  workout={workoutDetails}
                  exerciseSets={exerciseSets}
                  muscleFocus={muscleFocus}
                  activeWorkoutTime={activeWorkoutTime}
                  totalVolume={totalVolume}
                  totalRestTime={totalRestTime}
                />
              </div>

              <WorkoutDetailsEnhanced
                workout={workoutDetails}
                exercises={exerciseSets}
                onEditClick={() => setEditModalOpen(true)}
                onEditExercise={handleEditExercise}
              />
            </>
          )}
        </main>

        {/* Keep all modals */}
        <EditWorkoutModal
          workout={workoutDetails}
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          onSave={async (updatedWorkout) => {
            const updated = await handleSaveWorkoutEdit(updatedWorkout);
            if (updated) {
              setWorkoutDetails(updated);
            }
          }}
        />

        <EditExerciseSetModal
          sets={exerciseSetsToEdit}
          exerciseName={currentExercise}
          open={exerciseSetModalOpen}
          onOpenChange={setExerciseSetModalOpen}
          onSave={handleSaveExerciseSets}
        />

        <ExerciseDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onSubmit={async (exercise) => {
            if (exercise.name) {
              await handleAddExercise(exercise.name);
            }
          }}
          mode="add"
        />

        <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
          <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Exercise</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Are you sure you want to remove {exerciseToDelete}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteExercise}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Workout</AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                Are you sure you want to delete this workout? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteWorkoutOperation.execute(workoutId)}
                className="bg-red-600 text-white hover:bg-red-700"
                disabled={deleteWorkoutOperation.isLoading}
              >
                {deleteWorkoutOperation.isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Workout"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ErrorBoundary>
  );
};

export default WorkoutDetailsPage;
