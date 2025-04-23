import React from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { ExerciseDialog } from "@/components/ExerciseDialog";
import { EditWorkoutModal } from "@/components/EditWorkoutModal";
import { EditExerciseSetModal } from "@/components/EditExerciseSetModal";
import { WorkoutDetailsHeader } from "@/components/workouts/WorkoutDetailsHeader";
import { WorkoutExercisesSection } from "@/components/workouts/WorkoutExercisesSection";
import { useAuth } from "@/context/AuthContext";
import { useWorkoutDetails } from "@/hooks/useWorkoutDetails";
import { useExerciseManagement } from "@/hooks/useExerciseManagement";
import { ExerciseSet } from "@/types/exercise";

const WorkoutDetailsPage = () => {
  const { workoutId } = useParams<{ workoutId: string }>();
  const [searchParams] = useSearchParams();
  const dateFilter = searchParams.get('date');
  const navigate = useNavigate();
  const { user } = useAuth();
  
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <Loader2 className="h-8 w-8 animate-spin mr-2 text-purple-500" />
        <p>Loading workout details...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <main className="flex-1 overflow-auto px-4 py-6 pb-24 mt-16">
        {workoutId && workoutDetails && (
          <div className="mb-6">
            <WorkoutDetailsHeader
              workoutDetails={workoutDetails}
              onEditClick={() => setEditModalOpen(true)}
            />

            <WorkoutExercisesSection
              exerciseSets={exerciseSets}
              onAddExercise={() => setShowAddDialog(true)}
              onEditExercise={(name) => handleEditExercise(name, exerciseSets)}
              onDeleteExercise={confirmDeleteExercise}
            />

            {workoutDetails.notes && (
              <div className="mt-4 bg-gray-800/50 p-3 rounded">
                <h3 className="text-sm font-medium mb-1">Notes</h3>
                <p className="text-sm text-gray-300">{workoutDetails.notes}</p>
              </div>
            )}
          </div>
        )}
      </main>

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
            <AlertDialogTitle className="text-white">Remove Exercise</AlertDialogTitle>
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
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkoutDetailsPage;
