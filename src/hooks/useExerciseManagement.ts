
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { updateWorkout, updateExerciseSets, addExerciseToWorkout, removeExerciseFromWorkout } from "@/services/workoutService";
import { ExerciseSet } from "@/types/exercise";

// Define a type for the update function to make the code more maintainable
type UpdateExerciseSetsFunction = (exerciseSets: Record<string, ExerciseSet[]> | ((prev: Record<string, ExerciseSet[]>) => Record<string, ExerciseSet[]>)) => void;

export function useExerciseManagement(workoutId: string | undefined, onUpdate: UpdateExerciseSetsFunction) {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [exerciseSetModalOpen, setExerciseSetModalOpen] = useState(false);
  const [currentExercise, setCurrentExercise] = useState("");
  const [exerciseSetsToEdit, setExerciseSetsToEdit] = useState<ExerciseSet[]>([]);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleSaveWorkoutEdit = async (updatedWorkout: any) => {
    if (!workoutId) return;
    
    try {
      const updated = await updateWorkout(workoutId, updatedWorkout);
      toast.success("Workout updated successfully");
      return updated;
    } catch (error) {
      console.error("Error updating workout:", error);
      toast.error("Failed to update workout");
      throw error;
    }
  };

  const handleEditExercise = (exerciseName: string, exerciseSets: Record<string, ExerciseSet[]>) => {
    const setsForExercise = exerciseSets[exerciseName];
    setCurrentExercise(exerciseName);
    setExerciseSetsToEdit(setsForExercise);
    setExerciseSetModalOpen(true);
  };

  const handleSaveExerciseSets = async (updatedSets: ExerciseSet[]): Promise<void> => {
    if (!workoutId || !currentExercise) return;
    
    try {
      // Convert ExerciseSet to the expected API format
      const apiSets = updatedSets.map(set => ({
        id: set.id,
        exercise_name: set.exercise_name || currentExercise,
        workout_id: set.workout_id || workoutId,
        weight: set.weight,
        reps: set.reps,
        set_number: set.set_number || 1,
        completed: set.completed,
        rest_time: set.rest_time || set.restTime || 60
      }));
      
      const updated = await updateExerciseSets(workoutId, currentExercise, apiSets);
      toast.success("Exercise sets updated");
      
      // Convert back to ExerciseSet format
      const convertedSets: ExerciseSet[] = updated.map(set => ({
        id: set.id,
        weight: set.weight,
        reps: set.reps,
        duration: '0:00',
        completed: set.completed,
        volume: set.weight * set.reps,
        set_number: set.set_number,
        exercise_name: set.exercise_name,
        workout_id: set.workout_id,
        rest_time: set.rest_time
      }));
      
      // Create a new object first, then pass it to onUpdate
      onUpdate((prev: Record<string, ExerciseSet[]>) => {
        const newSets = { ...prev };
        newSets[currentExercise] = convertedSets;
        return newSets;
      });
      
    } catch (error) {
      console.error("Error updating exercise sets:", error);
      toast.error("Failed to update exercise sets");
      throw error;
    }
  };

  const handleAddExercise = async (exerciseName: string): Promise<void> => {
    if (!workoutId) return;
    
    try {
      const newSets = await addExerciseToWorkout(workoutId, exerciseName, 3);
      
      // Convert to ExerciseSet format
      const convertedSets: ExerciseSet[] = newSets.map(set => ({
        id: set.id,
        weight: set.weight,
        reps: set.reps,
        duration: '0:00',
        completed: set.completed,
        volume: set.weight * set.reps,
        set_number: set.set_number,
        exercise_name: set.exercise_name,
        workout_id: set.workout_id,
        rest_time: set.rest_time
      }));
      
      // Create a new object first, then pass it to onUpdate
      onUpdate((prev: Record<string, ExerciseSet[]>) => {
        const newSetsRecord = { ...prev };
        newSetsRecord[exerciseName] = convertedSets;
        return newSetsRecord;
      });
      
      toast.success(`Added ${exerciseName} to workout`);
    } catch (error) {
      console.error("Error adding exercise:", error);
      toast.error("Failed to add exercise");
      throw error;
    }
  };

  const handleDeleteExercise = async (): Promise<void> => {
    if (!workoutId || !exerciseToDelete) return;
    
    try {
      await removeExerciseFromWorkout(workoutId, exerciseToDelete);
      
      // Create a new object first, then pass it to onUpdate
      onUpdate((prev: Record<string, ExerciseSet[]>) => {
        const newSets = { ...prev };
        delete newSets[exerciseToDelete];
        return newSets;
      });
      
      toast.success(`Removed ${exerciseToDelete} from workout`);
      setDeleteAlertOpen(false);
      setExerciseToDelete("");
    } catch (error) {
      console.error("Error removing exercise:", error);
      toast.error("Failed to remove exercise");
    }
  };

  const confirmDeleteExercise = (exerciseName: string) => {
    setExerciseToDelete(exerciseName);
    setDeleteAlertOpen(true);
  };

  return {
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
  };
}
