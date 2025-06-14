import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { updateWorkout, updateExerciseSets as apiUpdateExerciseSets, addExerciseToWorkout as apiAddExerciseToWorkout, removeExerciseFromWorkout } from "@/services/workoutService";
import { ExerciseSet } from "@/types/exercise";

// Define a type for the update function to make the code more maintainable
type UpdateExerciseSetsFunction = (exerciseSets: Record<string, ExerciseSet[]> | ((prev: Record<string, ExerciseSet[]>) => Record<string, ExerciseSet[]>)) => void;

// Helper to ensure an API set becomes a full ExerciseSet
const convertApiSetToExerciseSet = (apiSet: any, defaultExerciseName: string, defaultWorkoutId: string, index: number): ExerciseSet => {
  const weight = Number(apiSet.weight) || 0;
  const reps = Number(apiSet.reps) || 0;
  return {
    id: apiSet.id || `temp-${Date.now()}-${index}`, // Ensure ID
    weight: weight,
    reps: reps,
    duration: apiSet.duration || '0:00', // Default if not from API
    completed: apiSet.completed || false,
    volume: weight * reps, // Calculate volume
    set_number: apiSet.set_number || index + 1,
    exercise_name: apiSet.exercise_name || defaultExerciseName,
    workout_id: apiSet.workout_id || defaultWorkoutId,
    restTime: Number(apiSet.restTime || apiSet.rest_time) || 60, // Map rest_time from API to restTime, ensure number
    isEditing: apiSet.isEditing || false, // Default after save
  };
};

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
      toast({title: "Workout updated successfully"});
      return updated;
    } catch (error) {
      console.error("Error updating workout:", error);
      toast({title: "Failed to update workout", variant: "destructive"});
      throw error;
    }
  };

  const handleEditExercise = (exerciseName: string, exerciseSets: Record<string, ExerciseSet[]>) => {
    const setsForExercise = exerciseSets[exerciseName] || [];
    const completeSetsForExercise = setsForExercise.map((s, i) => convertApiSetToExerciseSet(s, exerciseName, workoutId || "", i));
    setCurrentExercise(exerciseName);
    setExerciseSetsToEdit(completeSetsForExercise);
    setExerciseSetModalOpen(true);
  };

  const handleSaveExerciseSets = async (updatedSetsFromModal: Partial<ExerciseSet>[]): Promise<void> => {
    if (!workoutId || !currentExercise) return;
    
    try {
      const completeUpdatedSets: ExerciseSet[] = updatedSetsFromModal.map((set, index) => 
        convertApiSetToExerciseSet(set, currentExercise, workoutId, index)
      );

      const apiSets = completeUpdatedSets.map(set => ({
        id: set.id,
        exercise_name: set.exercise_name || currentExercise,
        workout_id: set.workout_id || workoutId,
        weight: set.weight,
        reps: set.reps,
        set_number: set.set_number || completeUpdatedSets.findIndex(s => s.id === set.id) + 1,
        completed: set.completed,
        rest_time: set.restTime || 60, // API expects rest_time
        duration: set.duration || '0:00',
        // volume is calculated, not sent
      }));
      
      const updatedFromApi = await apiUpdateExerciseSets(workoutId, currentExercise, apiSets);
      toast({title: "Exercise sets updated"});
      
      const convertedSetsBack: ExerciseSet[] = updatedFromApi.map((apiSet, index) => 
        convertApiSetToExerciseSet(apiSet, currentExercise, workoutId, index)
      );
      
      onUpdate((prev: Record<string, ExerciseSet[]>) => ({
        ...prev,
        [currentExercise]: convertedSetsBack,
      }));
      
    } catch (error) {
      console.error("Error updating exercise sets:", error);
      toast({title: "Failed to update exercise sets", variant: "destructive"});
      throw error;
    }
  };

  const handleAddExercise = async (exerciseName: string): Promise<void> => {
    if (!workoutId) return;
    
    try {
      const newSetsFromApi = await apiAddExerciseToWorkout(workoutId, exerciseName, 3);
      
      const convertedSets: ExerciseSet[] = newSetsFromApi.map((apiSet, index) => 
        convertApiSetToExerciseSet(apiSet, exerciseName, workoutId, index)
      );
      
      onUpdate((prev: Record<string, ExerciseSet[]>) => ({
        ...prev,
        [exerciseName]: convertedSets,
      }));
      
      toast({title: `Added ${exerciseName} to workout`});
    } catch (error) {
      console.error("Error adding exercise:", error);
      toast({title: "Failed to add exercise", variant: "destructive"});
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
