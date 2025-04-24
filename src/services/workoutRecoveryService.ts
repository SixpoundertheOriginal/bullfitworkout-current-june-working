
import { supabase } from "@/integrations/supabase/client";

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
  const { data: sets, error: fetchError } = await supabase
    .from('exercise_sets')
    .select('*')
    .eq('workout_id', workout.id);
    
  if (fetchError) {
    console.error("Error fetching associated exercise sets:", fetchError);
    return restoredWorkout;
  }
  
  if (sets && sets.length > 0) {
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
    }
  }
  
  return restoredWorkout;
}

/**
 * Recovers a partially saved workout by making sure it's visible in the workout history
 * This function attempts to fix issues with materialized views and analytics
 */
export async function recoverPartialWorkout(workoutId: string) {
  try {
    console.log(`Attempting to recover partially saved workout: ${workoutId}`);
    
    // 1. First check if the workout exists
    const { data: workout, error: workoutError } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('id', workoutId)
      .single();
      
    if (workoutError) {
      console.error("Workout not found during recovery:", workoutError);
      return { success: false, error: "Workout not found" };
    }
    
    // 2. Check if there are exercise sets associated with this workout
    const { data: sets, error: setsError } = await supabase
      .from('exercise_sets')
      .select('count')
      .eq('workout_id', workoutId);
      
    if (setsError) {
      console.error("Error checking exercise sets during recovery:", setsError);
    }
    
    const setCount = sets && sets.length > 0 ? parseInt(String(sets[0].count), 10) : 0;
    console.log(`Found ${setCount} sets for workout ${workoutId}`);
    
    // 3. Update the workout to ensure it's visible in history
    // This is a hack that forces a refresh of the workout in the database
    // which can help with materialized view issues
    const { data: updatedWorkout, error: updateError } = await supabase
      .from('workout_sessions')
      .update({ 
        updated_at: new Date().toISOString()
      })
      .eq('id', workoutId)
      .select();
      
    if (updateError) {
      console.error("Error updating workout during recovery:", updateError);
      return { success: false, error: "Failed to update workout" };
    }
    
    console.log("Successfully triggered workout update for recovery");
    
    // 4. Try to execute any SQL functions that might help refresh the analytics
    // This is done manually rather than relying on the trigger
    try {
      // Execute a SQL function to refresh analytics if it exists
      // Using fetch to call custom RPC functions
      const { error: refreshError } = await supabase.functions.invoke('manual-refresh-analytics', {
        body: { workoutId }
      });
      
      if (refreshError) {
        console.error("Error refreshing analytics during recovery:", refreshError);
      }
    } catch (error) {
      console.warn("No manual refresh function available, continuing recovery", error);
    }
    
    return { 
      success: true, 
      workout: updatedWorkout?.[0] || workout,
      setCount
    };
  } catch (error) {
    console.error("Error in recoverPartialWorkout:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Checks if a workout's exercises are properly visible in the workout history
 * and attempts to fix any issues
 */
export async function diagnoseAndFixWorkout(workoutId: string) {
  try {
    // First check if the workout exists and is complete
    const { data: workout, error: workoutError } = await supabase
      .from('workout_sessions')
      .select('*')
      .eq('id', workoutId)
      .single();
      
    if (workoutError) {
      return { success: false, error: "Workout not found", details: workoutError };
    }
    
    // Check exercise sets
    const { data: exerciseSets, error: setsError } = await supabase
      .from('exercise_sets')
      .select('*')
      .eq('workout_id', workoutId);
      
    if (setsError) {
      return { 
        success: false, 
        error: "Error fetching exercise sets", 
        details: setsError,
        workout 
      };
    }
    
    const diagnosis = {
      workout: workout,
      exerciseSets: exerciseSets || [],
      hasExercises: Boolean(exerciseSets && exerciseSets.length > 0),
      visibleInHistory: true, // Assume true initially
      analyticsStatus: "unknown"
    };
    
    // If there are no exercise sets, attempt to recover
    if (!diagnosis.hasExercises) {
      console.log("No exercise sets found, attempting recovery");
      const recovery = await recoverPartialWorkout(workoutId);
      return { 
        ...diagnosis,
        recovery,
        success: recovery.success,
        fixed: recovery.success
      };
    }
    
    // Everything seems fine
    return {
      success: true,
      workout,
      exerciseSets: exerciseSets || [],
      setCount: exerciseSets?.length || 0,
      fixed: false,
      message: "Workout appears to be complete and visible"
    };
  } catch (error) {
    console.error("Error in diagnoseAndFixWorkout:", error);
    return { success: false, error: String(error) };
  }
}
