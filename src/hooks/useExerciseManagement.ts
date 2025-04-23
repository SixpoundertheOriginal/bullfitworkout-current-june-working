
import { useState } from "react";
import { toast } from "@/components/ui/sonner";
import { updateWorkout, updateExerciseSets, addExerciseToWorkout, removeExerciseFromWorkout } from "@/services/workoutService";
import { ExerciseSet } from "@/types/exercise";

export function useExerciseManagement(workoutId: string | undefined, onUpdate: (exerciseSets: Record<string, ExerciseSet[]>) => void) {
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
      const updated = await updateExerciseSets(workoutId, currentExercise, updatedSets);
      toast.success("Exercise sets updated");
      
      onUpdate((prev: Record<string, ExerciseSet[]>) => {
        const newSets = { ...prev };
        newSets[currentExercise] = updated;
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
      
      onUpdate((prev: Record<string, ExerciseSet[]>) => {
        const newSetsRecord = { ...prev };
        newSetsRecord[exerciseName] = newSets;
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
