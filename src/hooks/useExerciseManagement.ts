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
      toast({title: "Workout updated successfully"}); // use toast object
      return updated;
    } catch (error) {
      console.error("Error updating workout:", error);
      toast({title: "Failed to update workout", variant: "destructive"}); // use toast object
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
        set_number: set.set_number || updatedSets.findIndex(s => s.id === set.id) + 1, // ensure set_number
        completed: set.completed,
        rest_time: set.restTime || 60, // use canonical restTime
        duration: set.duration || '0:00', // ensure duration
        // volume is usually calculated, not sent
      }));
      
      const updatedFromApi = await updateExerciseSets(workoutId, currentExercise, apiSets); // renamed 'updated' to avoid conflict
      toast({title: "Exercise sets updated"}); // use toast object
      
      // Convert back to ExerciseSet format with all required fields
      const convertedSets: ExerciseSet[] = updatedFromApi.map((apiSet, index) => ({
        id: apiSet.id,
        weight: apiSet.weight,
        reps: apiSet.reps,
        duration: apiSet.duration || '0:00', // Default if not from API
        completed: apiSet.completed,
        volume: (apiSet.weight || 0) * (apiSet.reps || 0), // Calculate volume
        set_number: apiSet.set_number || index + 1,
        exercise_name: apiSet.exercise_name || currentExercise,
        workout_id: apiSet.workout_id || workoutId,
        restTime: apiSet.rest_time || 60, // Map rest_time from API to restTime
        isEditing: false, // Default after save
        // rest_time: apiSet.rest_time, // Keep if needed, but canonical is restTime
      }));
      
      onUpdate((prev: Record<string, ExerciseSet[]>) => ({
        ...prev,
        [currentExercise]: convertedSets,
      }));
      
    } catch (error) {
      console.error("Error updating exercise sets:", error);
      toast({title: "Failed to update exercise sets", variant: "destructive"}); // use toast object
      throw error;
    }
  };

  const handleAddExercise = async (exerciseName: string): Promise<void> => {
    if (!workoutId) return;
    
    try {
      const newSetsFromApi = await addExerciseToWorkout(workoutId, exerciseName, 3); // renamed 'newSets'
      
      const convertedSets: ExerciseSet[] = newSetsFromApi.map((apiSet, index) => ({
        id: apiSet.id,
        weight: apiSet.weight,
        reps: apiSet.reps,
        duration: apiSet.duration || '0:00',
        completed: apiSet.completed || false,
        volume: (apiSet.weight || 0) * (apiSet.reps || 0),
        set_number: apiSet.set_number || index + 1,
        exercise_name: apiSet.exercise_name || exerciseName,
        workout_id: apiSet.workout_id || workoutId,
        restTime: apiSet.rest_time || 60,
        isEditing: true, // New sets start in editing mode or ready to be filled
      }));
      
      onUpdate((prev: Record<string, ExerciseSet[]>) => ({
        ...prev,
        [exerciseName]: convertedSets,
      }));
      
      toast({title: `Added ${exerciseName} to workout`}); // use toast object
    } catch (error) {
      console.error("Error adding exercise:", error);
      toast({title: "Failed to add exercise", variant: "destructive"}); // use toast object
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
      
      toast({title: `Removed ${exerciseToDelete} from workout`});
      setDeleteAlertOpen(false);
      setExerciseToDelete("");
    } catch (error) {
      console.error("Error removing exercise:", error);
      toast({title: "Failed to remove exercise", variant: "destructive"});
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
