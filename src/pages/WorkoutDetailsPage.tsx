
import React, { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { ExerciseDialog } from "@/components/ExerciseDialog";
import { EditWorkoutModal } from "@/components/EditWorkoutModal";
import { EditExerciseSetModal } from "@/components/EditExerciseSetModal";
import { WorkoutDetailsEnhanced } from "@/components/workouts/WorkoutDetailsEnhanced";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useWorkoutDetails } from "@/hooks/useWorkoutDetails";
import { useExerciseManagement } from "@/hooks/useExerciseManagement";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { deleteWorkout } from "@/services/workoutService";

const WorkoutDetailsPage = () => {
  const { workoutId } = useParams<{ workoutId: string }>();
  const [searchParams] = useSearchParams();
  const dateFilter = searchParams.get('date');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
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

  const handleDeleteWorkout = async () => {
    if (!workoutId) return;
    
    try {
      setIsDeleting(true);
      await deleteWorkout(workoutId);
      toast.success("Workout deleted successfully");
      navigate("/training?tab=history");
    } catch (error) {
      console.error("Error deleting workout:", error);
      toast.error("Failed to delete workout");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

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
        {/* Breadcrumb Navigation */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/training?tab=history">
                Workouts
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {workoutDetails?.name || "Workout Details"}
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {workoutId && workoutDetails && (
          <div className="mb-6">
            {/* Workout actions */}
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold">{workoutDetails.name}</h1>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-purple-400 hover:text-purple-300 hover:bg-gray-800"
                  onClick={() => setEditModalOpen(true)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300 hover:bg-gray-800"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>

            <Tabs defaultValue="analysis" className="w-full">
              <TabsList className="grid grid-cols-1 w-full mb-4">
                <TabsTrigger value="analysis">Detailed Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="analysis">
                <WorkoutDetailsEnhanced
                  workout={workoutDetails}
                  exercises={exerciseSets}
                  onEditClick={() => setEditModalOpen(true)}
                  onEditExercise={handleEditExercise}
                />
              </TabsContent>
            </Tabs>
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

      {/* Delete Workout Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Workout</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete this workout? This action cannot be undone and will remove all exercise data associated with this workout.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteWorkout}
              className="bg-red-600 text-white hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
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
  );
};

export default WorkoutDetailsPage;
