import { supabase } from "@/integrations/supabase/client";

/**
 * Updates a workout's details
 */
export async function updateWorkout(workoutId: string, data: {
  name?: string;
  training_type?: string;
  start_time?: string;
  end_time?: string;
  duration?: number;
  notes?: string | null;
}) {
  const { data: workout, error } = await supabase
    .from('workout_sessions')
    .update(data)
    .eq('id', workoutId)
    .select()
    .single();
    
  if (error) throw error;
  return workout;
}

/**
 * Updates or creates sets for an exercise in a workout
 */
export async function updateExerciseSets(workoutId: string, exerciseName: string, sets: {
  id: string;
  exercise_name: string;
  workout_id: string;
  weight: number;
  reps: number;
  set_number: number;
  completed: boolean;
}[]) {
  // First get existing set IDs for this exercise in this workout
  const { data: existingSets, error: fetchError } = await supabase
    .from('exercise_sets')
    .select('id')
    .eq('workout_id', workoutId)
    .eq('exercise_name', exerciseName);
    
  if (fetchError) throw fetchError;
  
  const existingIds = new Set(existingSets?.map(set => set.id) || []);
  const setsToUpdate = sets.filter(set => set.id && !set.id.startsWith('temp-') && existingIds.has(set.id));
  const setsToInsert = sets.filter(set => !set.id || set.id.startsWith('temp-') || !existingIds.has(set.id))
    .map(set => ({
      workout_id: workoutId,
      exercise_name: exerciseName,
      weight: set.weight,
      reps: set.reps,
      set_number: set.set_number,
      completed: set.completed
    }));
  
  // Sets to delete - those that exist in the database but not in our updated list
  const setIdsToKeep = new Set(setsToUpdate.map(set => set.id));
  const setsToDelete = existingIds.size > 0 
    ? Array.from(existingIds).filter(id => !setIdsToKeep.has(id as string))
    : [];
  
  // Perform the operations
  const operations = [];
  
  // Update existing sets
  if (setsToUpdate.length > 0) {
    const updatePromise = supabase
      .from('exercise_sets')
      .upsert(setsToUpdate.map(set => ({
        id: set.id,
        workout_id: workoutId,
        exercise_name: exerciseName,
        weight: set.weight,
        reps: set.reps,
        set_number: set.set_number,
        completed: set.completed
      })));
    operations.push(updatePromise);
  }
  
  // Insert new sets
  if (setsToInsert.length > 0) {
    const insertPromise = supabase
      .from('exercise_sets')
      .insert(setsToInsert);
    operations.push(insertPromise);
  }
  
  // Delete removed sets
  if (setsToDelete.length > 0) {
    const deletePromise = supabase
      .from('exercise_sets')
      .delete()
      .in('id', setsToDelete);
    operations.push(deletePromise);
  }
  
  // Execute all operations
  const results = await Promise.all(operations);
  
  // Check for errors
  for (const result of results) {
    if (result.error) throw result.error;
  }
  
  // Fetch the updated sets
  const { data: updatedSets, error: finalError } = await supabase
    .from('exercise_sets')
    .select('*')
    .eq('workout_id', workoutId)
    .eq('exercise_name', exerciseName)
    .order('set_number', { ascending: true });
    
  if (finalError) throw finalError;
  return updatedSets;
}

/**
 * Adds a new exercise to a workout
 */
export async function addExerciseToWorkout(workoutId: string, exerciseName: string, initialSets: number = 1) {
  const sets = Array.from({ length: initialSets }, (_, i) => ({
    workout_id: workoutId,
    exercise_name: exerciseName,
    weight: 0,
    reps: 0,
    set_number: i + 1,
    completed: true
  }));
  
  const { data, error } = await supabase
    .from('exercise_sets')
    .insert(sets)
    .select();
    
  if (error) throw error;
  return data;
}

/**
 * Removes an exercise from a workout by deleting all its sets
 */
export async function removeExerciseFromWorkout(workoutId: string, exerciseName: string) {
  const { error } = await supabase
    .from('exercise_sets')
    .delete()
    .eq('workout_id', workoutId)
    .eq('exercise_name', exerciseName);
    
  if (error) throw error;
  return true;
}

/**
 * Fetches a single workout with its exercise sets
 */
export async function getWorkoutWithExercises(workoutId: string) {
  const { data: workout, error: workoutError } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('id', workoutId)
    .single();
    
  if (workoutError) throw workoutError;
  
  const { data: sets, error: setsError } = await supabase
    .from('exercise_sets')
    .select('*')
    .eq('workout_id', workoutId)
    .order('exercise_name', { ascending: true })
    .order('set_number', { ascending: true });
    
  if (setsError) throw setsError;
  
  return {
    ...workout,
    exerciseSets: sets || []
  };
}

/**
 * Deletes a workout and its associated exercise sets
 */
export async function deleteWorkout(workoutId: string) {
  // Delete the exercise sets first
  const { error: setsError } = await supabase
    .from('exercise_sets')
    .delete()
    .eq('workout_id', workoutId);
    
  if (setsError) throw setsError;
  
  // Then delete the workout
  const { error } = await supabase
    .from('workout_sessions')
    .delete()
    .eq('id', workoutId);
    
  if (error) throw error;
  return true;
}

/**
 * Restores a deleted workout with its exercise sets
 */
export async function restoreWorkout(workout: any) {
  if (!workout || !workout.id) {
    throw new Error("Invalid workout data");
  }
  
  // Insert the workout back
  const { data: restoredWorkout, error: workoutError } = await supabase
    .from('workout_sessions')
    .insert({
      id: workout.id,
      name: workout.name,
      training_type: workout.training_type,
      start_time: workout.start_time,
      end_time: workout.end_time,
      duration: workout.duration,
      notes: workout.notes,
      user_id: workout.user_id,
    })
    .select()
    .single();
  
  if (workoutError) {
    console.error("Error restoring workout:", workoutError);
    throw workoutError;
  }
  
  // Fetch the original exercise sets for this workout
  // For a complete implementation, we would need to store these too, 
  // but that would require database changes
  const { data: sets, error: fetchError } = await supabase
    .from('exercise_sets')
    .select('*')
    .eq('workout_id', workout.id);
    
  if (fetchError) {
    console.error("Error fetching associated exercise sets:", fetchError);
    
    // If we couldn't fetch the sets, we still want the workout to be restored,
    // so we don't throw this error
    return restoredWorkout;
  }
  
  if (sets && sets.length > 0) {
    // If the exercise sets were fetched successfully, we want to restore them too
    const { error: insertError } = await supabase
      .from('exercise_sets')
      .insert(sets.map(set => ({
        workout_id: workout.id,
        exercise_name: set.exercise_name,
        weight: set.weight,
        reps: set.reps,
        set_number: set.set_number,
        completed: set.completed
      })));
      
    if (insertError) {
      console.error("Error restoring exercise sets:", insertError);
      // Again, we still want the workout to be restored, so we don't throw
    }
  }
  
  return restoredWorkout;
}

/**
 * Bulk deletes multiple workouts and their associated exercise sets
 */
export async function bulkDeleteWorkouts(workoutIds: string[]) {
  if (!workoutIds.length) return { success: true, count: 0 };
  
  try {
    // Delete all exercise sets for these workouts first
    const { error: setsError } = await supabase
      .from('exercise_sets')
      .delete()
      .in('workout_id', workoutIds);
      
    if (setsError) throw setsError;
    
    // Then delete the workouts
    const { data, error } = await supabase
      .from('workout_sessions')
      .delete()
      .in('id', workoutIds)
      .select('id');
      
    if (error) throw error;
    
    return { success: true, count: data?.length || 0 };
  } catch (error) {
    console.error("Error bulk deleting workouts:", error);
    throw error;
  }
}

/**
 * Bulk updates multiple workouts with the same values
 */
export async function bulkUpdateWorkouts(workoutIds: string[], data: {
  name?: string;
  training_type?: string;
  notes?: string | null;
}) {
  if (!workoutIds.length) return { success: true, count: 0 };
  
  try {
    const { data: updatedWorkouts, error } = await supabase
      .from('workout_sessions')
      .update(data)
      .in('id', workoutIds)
      .select('id');
      
    if (error) throw error;
    
    return { success: true, count: updatedWorkouts?.length || 0 };
  } catch (error) {
    console.error("Error bulk updating workouts:", error);
    throw error;
  }
}

/**
 * Resets exercise sets for a workout (marks all as incomplete with zero weight/reps)
 */
export async function resetWorkoutSets(workoutId: string) {
  try {
    const { data, error } = await supabase
      .from('exercise_sets')
      .update({
        weight: 0,
        reps: 0,
        completed: false
      })
      .eq('workout_id', workoutId)
      .select();
      
    if (error) throw error;
    
    return { success: true, count: data?.length || 0 };
  } catch (error) {
    console.error("Error resetting workout sets:", error);
    throw error;
  }
}

/**
 * Bulk resets exercise sets for multiple workouts
 */
export async function bulkResetWorkoutSets(workoutIds: string[]) {
  if (!workoutIds.length) return { success: true, count: 0 };
  
  try {
    const { data, error } = await supabase
      .from('exercise_sets')
      .update({
        weight: 0,
        reps: 0,
        completed: false
      })
      .in('workout_id', workoutIds)
      .select();
      
    if (error) throw error;
    
    return { success: true, count: data?.length || 0, workoutCount: workoutIds.length };
  } catch (error) {
    console.error("Error bulk resetting workout sets:", error);
    throw error;
  }
}
