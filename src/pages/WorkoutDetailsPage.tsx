
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { ExerciseDialog } from "@/components/ExerciseDialog";
import { EditWorkoutModal } from "@/components/EditWorkoutModal";
import { EditExerciseSetModal } from "@/components/EditExerciseSetModal";
import { WorkoutDetailsHeader } from "@/components/workouts/WorkoutDetailsHeader";
import { WorkoutExercisesSection } from "@/components/workouts/WorkoutExercisesSection";
import { updateWorkout, updateExerciseSets, addExerciseToWorkout, removeExerciseFromWorkout } from "@/services/workoutService";

const WorkoutDetailsPage = () => {
  const { workoutId } = useParams<{ workoutId: string }>();
  const [searchParams] = useSearchParams();
  const dateFilter = searchParams.get('date');
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [workoutDetails, setWorkoutDetails] = useState(null);
  const [exerciseSets, setExerciseSets] = useState({});
  const [loading, setLoading] = useState(workoutId ? true : false);
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [exerciseSetModalOpen, setExerciseSetModalOpen] = useState(false);
  const [currentExercise, setCurrentExercise] = useState("");
  const [exerciseSetsToEdit, setExerciseSetsToEdit] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState("");

  useEffect(() => {
    if (!user || !workoutId) return;
    
    const fetchWorkoutDetails = async () => {
      try {
        setLoading(true);
        
        const { data: workout, error: workoutError } = await supabase
          .from('workout_sessions')
          .select('*')
          .eq('id', workoutId)
          .single();
          
        if (workoutError) {
          console.error('Error fetching workout:', workoutError);
          navigate('/workout-details');
          return;
        }
        
        setWorkoutDetails(workout);
        
        const { data: sets, error: setsError } = await supabase
          .from('exercise_sets')
          .select('*')
          .eq('workout_id', workoutId)
          .order('exercise_name', { ascending: true })
          .order('set_number', { ascending: true });
          
        if (setsError) {
          console.error('Error fetching exercise sets:', setsError);
          return;
        }
        
        const groupedSets = sets.reduce((acc, set) => {
          if (!acc[set.exercise_name]) {
            acc[set.exercise_name] = [];
          }
          acc[set.exercise_name].push(set);
          return acc;
        }, {});
        
        setExerciseSets(groupedSets);
      } catch (error) {
        console.error('Error in workout details fetch:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkoutDetails();
  }, [workoutId, user, navigate]);

  const handleSaveWorkoutEdit = async (updatedWorkout) => {
    if (!workoutId) return;
    
    try {
      const updated = await updateWorkout(workoutId, updatedWorkout);
      setWorkoutDetails(updated);
      toast.success("Workout updated successfully");
    } catch (error) {
      console.error("Error updating workout:", error);
      toast.error("Failed to update workout");
    }
  };

  const handleEditExercise = (exerciseName) => {
    const setsForExercise = exerciseSets[exerciseName];
    setCurrentExercise(exerciseName);
    setExerciseSetsToEdit(setsForExercise);
    setExerciseSetModalOpen(true);
  };

  const handleSaveExerciseSets = async (updatedSets) => {
    if (!workoutId || !currentExercise) return;
    
    try {
      const updated = await updateExerciseSets(workoutId, currentExercise, updatedSets);
      setExerciseSets(prev => ({
        ...prev,
        [currentExercise]: updated
      }));
      toast.success("Exercise sets updated");
    } catch (error) {
      console.error("Error updating exercise sets:", error);
      toast.error("Failed to update exercise sets");
    }
  };

  const handleAddExercise = async (exerciseName) => {
    if (!workoutId) return;
    
    try {
      const newSets = await addExerciseToWorkout(workoutId, exerciseName, 3);
      setExerciseSets(prev => ({
        ...prev,
        [exerciseName]: newSets
      }));
      toast.success(`Added ${exerciseName} to workout`);
      return Promise.resolve();
    } catch (error) {
      console.error("Error adding exercise:", error);
      toast.error("Failed to add exercise");
      return Promise.reject(error);
    }
  };

  const handleDeleteExercise = async () => {
    if (!workoutId || !exerciseToDelete) return;
    
    try {
      await removeExerciseFromWorkout(workoutId, exerciseToDelete);
      setExerciseSets(prev => {
        const newSets = { ...prev };
        delete newSets[exerciseToDelete];
        return newSets;
      });
      toast.success(`Removed ${exerciseToDelete} from workout`);
    } catch (error) {
      console.error("Error removing exercise:", error);
      toast.error("Failed to remove exercise");
    } finally {
      setDeleteAlertOpen(false);
      setExerciseToDelete("");
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
        {workoutId && workoutDetails && (
          <div className="mb-6">
            <WorkoutDetailsHeader
              workoutDetails={workoutDetails}
              onEditClick={() => setEditModalOpen(true)}
            />

            <WorkoutExercisesSection
              exerciseSets={exerciseSets}
              onAddExercise={() => setShowAddDialog(true)}
              onEditExercise={handleEditExercise}
              onDeleteExercise={(name) => {
                setExerciseToDelete(name);
                setDeleteAlertOpen(true);
              }}
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
        onSave={handleSaveWorkoutEdit}
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
            return handleAddExercise(exercise.name);
          }
          return Promise.resolve();
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
