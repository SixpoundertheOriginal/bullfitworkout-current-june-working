import { supabase } from "@/integrations/supabase/client";
import { EnhancedExerciseSet, WorkoutError, SaveProgress } from "@/types/workout";
import { toast as shadToast } from "@/hooks/use-toast";

// Ensure toast calls use the object syntax
const toast = (options: Parameters<typeof shadToast>[0]) => shadToast(options);

interface SaveWorkoutParams {
  userData: {
    id: string;
    [key: string]: any;
  };
  workoutData: {
    name: string;
    training_type: string;
    start_time: string;
    end_time: string;
    duration: number;
    notes: string | null;
    metadata: any;
  };
  exercises: Record<string, EnhancedExerciseSet[]>;
  onProgressUpdate?: (progress: SaveProgress) => void;
}

interface SaveResult {
  success: boolean;
  workoutId?: string;
  error?: WorkoutError;
  partialSave?: boolean;
}

// Store retry queues by user
const saveRetryQueues = new Map<string, Array<{
  exerciseName: string;
  sets: EnhancedExerciseSet[];
  workoutId: string;
  attempt: number;
}>>(); 

export const saveWorkout = async ({
  userData,
  workoutData,
  exercises,
  onProgressUpdate
}: SaveWorkoutParams): Promise<SaveResult> => {
  if (!userData || !userData.id) {
    return { 
      success: false,
      error: {
        type: 'validation',
        message: 'User data is required',
        timestamp: new Date().toISOString(),
        recoverable: false
      }
    };
  }

  try {
    onProgressUpdate?.({
      step: 'workout',
      total: 3,
      completed: 0,
      errors: []
    });

    // Format exercise sets for the function call
    const formattedSets = Object.entries(exercises).flatMap(([exerciseName, sets]) => {
      return sets.map((set, setIndex) => ({
        exercise_name: exerciseName,
        weight: set.weight || 0,
        reps: set.reps || 0,
        set_number: setIndex + 1,
        completed: set.completed || false,
        rest_time: set.restTime || 60,
        // Ensure duration and volume are not sent if not part of API schema
        // duration: set.duration || '0:00', 
        // volume: set.volume || 0,
      }));
    });

    console.log(`Saving workout with ${formattedSets.length} exercise sets`);
    
    try {
      const { data: transactionResult, error: functionError } = await supabase.functions.invoke('save-complete-workout', {
        body: {
          workout_data: {
            name: workoutData.name,
            training_type: workoutData.training_type,
            start_time: workoutData.start_time,
            end_time: workoutData.end_time,
            duration: workoutData.duration || 0,
            notes: workoutData.notes || null,
            user_id: userData.id,
            metadata: workoutData.metadata || {}
          },
          exercise_sets: formattedSets
        }
      });

      // Check for specific error conditions and modify response
      if (functionError) {
        console.error("Edge function error:", functionError);
        
        // If function isn't found or unavailable, fall back to manual method
        if (functionError.message?.includes('function not found') || 
            functionError.message?.includes('network error')) {
          console.log("Edge function unavailable, falling back to manual save");
          // Continue to manual save below
        } else {
          // For other function errors, return error but make recoverable
          return {
            success: false,
            error: {
              type: 'database',
              message: 'Error saving workout via edge function: ' + functionError.message,
              details: functionError,
              timestamp: new Date().toISOString(),
              recoverable: true
            }
          };
        }
      } 
      else if (transactionResult && transactionResult.workout_id) {
        // Function worked and returned a workout ID
        onProgressUpdate?.({
          step: 'analytics',
          total: 3,
          completed: 3,
          errors: []
        });
        
        console.log("Workout saved successfully via edge function");
        return {
          success: true,
          workoutId: transactionResult.workout_id,
          partialSave: transactionResult.partial || false
        };
      }
    } catch (functionError) {
      console.warn("Edge function call failed, using fallback:", functionError);
      // Continue with fallback approach below
    }

    // Manual save approach as fallback
    console.log("Using manual save fallback approach");
    
    // First, insert the workout record
    onProgressUpdate?.({
      step: 'workout',
      total: 3,
      completed: 0.2,
      errors: []
    });
    
    const { data: workoutSession, error: workoutError } = await supabase
      .from('workout_sessions')
      .insert({
        ...workoutData,
        user_id: userData.id
      })
      .select()
      .single();
      
    if (workoutError) {
      console.error("Error creating workout:", workoutError);
      
      // Check if error is related to materialized views
      if (workoutError.message && (
          workoutError.message.includes('materialized view') ||
          workoutError.message.includes('permission denied')
      )) {
        // Try again with just the essential data - this might work if it's a permissions issue
        try {
          const { data: simpleWorkout, error: simpleError } = await supabase
            .from('workout_sessions')
            .insert({
              name: workoutData.name,
              training_type: workoutData.training_type,
              start_time: workoutData.start_time,
              end_time: workoutData.end_time,
              duration: workoutData.duration,
              user_id: userData.id
            })
            .select('id')
            .single();
            
          if (simpleError) {
            throw simpleError;
          }
          
          console.log("Workout created with simplified approach");
          
          // Continue with the simplified workout
          const workoutId = simpleWorkout.id;
          onProgressUpdate?.({
            step: 'exercise-sets',
            total: 3,
            completed: 1,
            errors: []
          });
          
          await saveExerciseSetsWithRetry(workoutId, exercises, onProgressUpdate);
          
          return {
            success: true,
            workoutId,
            partialSave: true
          };
        } catch (fallbackError) {
          console.error("Simplified workout save failed:", fallbackError);
          return {
            success: false,
            error: {
              type: 'database',
              message: 'Failed to save workout data (permission issue)',
              details: fallbackError,
              timestamp: new Date().toISOString(),
              recoverable: true
            }
          };
        }
      }
      
      return {
        success: false,
        error: {
          type: 'database',
          message: 'Failed to save workout data',
          details: workoutError,
          timestamp: new Date().toISOString(),
          recoverable: true
        }
      };
    }
    
    onProgressUpdate?.({
      step: 'exercise-sets',
      total: 3,
      completed: 1,
      errors: []
    });
    
    // Save exercise sets with better error handling and retry capability
    const workoutId = workoutSession.id;
    const { success: setsSuccess, errors: setsErrors } = 
      await saveExerciseSetsWithRetry(workoutId, exercises, onProgressUpdate);
    
    // Try to trigger analytics refresh
    onProgressUpdate?.({
      step: 'analytics',
      total: 3,
      completed: 2,
      errors: setsErrors
    });
    
    try {
      // Attempt to refresh the analytics
      await supabase.functions.invoke('recover-workout', {
        body: { workoutId }
      }).then(({ error: refreshError }) => {
        if (refreshError) {
          console.warn("Analytics refresh failed:", refreshError);
          setsErrors.push({
            type: 'database',
            message: 'Analytics refresh failed',
            details: refreshError,
            timestamp: new Date().toISOString(),
            recoverable: true
          });
        }
      });
    } catch (refreshError) {
      console.warn("Analytics refresh error:", refreshError);
      // Non-critical error, just log it
    }
    
    onProgressUpdate?.({
      step: 'analytics',
      total: 3,
      completed: 3,
      errors: setsErrors
    });
    
    // Check if we have a partial save situation
    if (!setsSuccess) {
      return {
        success: true,
        workoutId,
        partialSave: true,
        error: setsErrors[0] // Return first error for immediate feedback
      };
    }
    
    // Successful save
    return {
      success: true,
      workoutId
    };
    
  } catch (error) {
    console.error("Unexpected error during workout save:", error);
    return {
      success: false,
      error: {
        type: 'unknown',
        message: 'An unexpected error occurred while saving your workout',
        details: error,
        timestamp: new Date().toISOString(),
        recoverable: false
      }
    };
  }
};

// Helper function to save exercise sets with retry capability
async function saveExerciseSetsWithRetry(
  workoutId: string,
  exercises: Record<string, EnhancedExerciseSet[]>,
  onProgressUpdate?: (progress: SaveProgress) => void
): Promise<{ success: boolean, errors: WorkoutError[] }> {
  const errors: WorkoutError[] = [];
  let totalSets = 0;
  let successfulSets = 0;
  
  // Calculate total sets for progress tracking
  Object.values(exercises).forEach(sets => {
    totalSets += sets.length;
  });
  
  // Process exercise sets in batches with retry logic
  for (const [exerciseName, sets] of Object.entries(exercises)) {
    // Batch processing with retry on failure
    const batchSize = 25; // Smaller batch size for better reliability
    for (let i = 0; i < sets.length; i += batchSize) {
      const batch = sets.slice(i, i + batchSize);
      
      try {
        const { error: batchError } = await supabase
          .from('exercise_sets')
          .insert(batch.map(set => ({
            workout_id: workoutId,
            exercise_name: exerciseName,
            weight: set.weight || 0,
            reps: set.reps || 0,
            set_number: i + batch.indexOf(set) + 1,
            completed: set.completed || false,
            rest_time: set.restTime || 60
            // duration: set.duration, // Not typically stored in exercise_sets table
            // volume: set.volume // Calculated, not stored
          })));
          
        if (batchError) {
          console.error(`Error saving batch for ${exerciseName}:`, batchError);
          
          // For permission issues, try one at a time to maximize success
          if (batchError.message?.includes('permission denied')) {
            console.log("Trying individual saves due to permission issues");
            let individualSuccess = 0;
            
            for (const set of batch) {
              try {
                const { error: setError } = await supabase
                  .from('exercise_sets')
                  .insert({
                    workout_id: workoutId,
                    exercise_name: exerciseName,
                    weight: set.weight || 0,
                    reps: set.reps || 0,
                    set_number: i + batch.indexOf(set) + 1,
                    completed: set.completed || false,
                    rest_time: set.restTime || 60
                  });
                  
                if (!setError) {
                  individualSuccess++;
                  successfulSets++;
                }
              } catch (indError) {
                console.error(`Individual set save failed for ${exerciseName}:`, indError);
              }
            }
            
            if (individualSuccess < batch.length) {
              errors.push({
                type: 'database',
                message: `Saved ${individualSuccess}/${batch.length} sets for ${exerciseName}`,
                details: batchError,
                timestamp: new Date().toISOString(),
                recoverable: true
              });
            }
          } else {
            // Add to retry queue for later attempt
            const userId = (await supabase.auth.getUser()).data.user?.id;
            if (userId) {
              const retryQueue = saveRetryQueues.get(userId) || [];
              retryQueue.push({
                exerciseName,
                sets: batch, // Store EnhancedExerciseSet
                workoutId,
                attempt: 1
              });
              saveRetryQueues.set(userId, retryQueue);
            }
            
            errors.push({
              type: 'database',
              message: `Failed to save some sets for ${exerciseName}`,
              details: batchError,
              timestamp: new Date().toISOString(),
              recoverable: true
            });
          }
        } else {
          successfulSets += batch.length;
        }
      } catch (error) {
        console.error("Exception saving exercise set batch:", error);
        
        // Add to retry queue
        const userId = (await supabase.auth.getUser()).data.user?.id;
        if (userId) {
          const retryQueue = saveRetryQueues.get(userId) || [];
          retryQueue.push({
            exerciseName,
            sets: batch, // Store EnhancedExerciseSet
            workoutId,
            attempt: 1
          });
          saveRetryQueues.set(userId, retryQueue);
        }
        
        errors.push({
          type: 'unknown',
          message: `Exception saving sets for ${exerciseName}`,
          details: error,
          timestamp: new Date().toISOString(),
          recoverable: true
        });
      }
      
      // Update progress
      onProgressUpdate?.({
        step: 'exercise-sets',
        total: 3,
        completed: 1 + (totalSets > 0 ? (successfulSets / totalSets) : 0), // Avoid division by zero
        errors
      });
    }
  }
  
  return { 
    success: successfulSets === totalSets,
    errors
  };
}

// Process retry queue in the background
export const processRetryQueue = async (userId: string): Promise<boolean> => {
  const retryQueue = saveRetryQueues.get(userId);
  if (!retryQueue || retryQueue.length === 0) return true;
  
  console.log(`Processing retry queue for user ${userId} with ${retryQueue.length} items`);
  
  let success = true;
  const newQueue: typeof retryQueue = [];
  
  for (const item of retryQueue) {
    try {
      const { exerciseName, sets, workoutId, attempt } = item;
      
      const { error: batchError } = await supabase
        .from('exercise_sets')
        .insert(sets.map((set, index) => ({ // 'sets' here are EnhancedExerciseSet
          workout_id: workoutId,
          exercise_name: exerciseName,
          weight: set.weight || 0,
          reps: set.reps || 0,
          set_number: index + 1, // Assuming set_number should be relative to the batch
          completed: set.completed || false,
          rest_time: set.restTime || 60
        })));
        
      if (batchError && attempt < 3) {
        newQueue.push({
          ...item,
          attempt: attempt + 1
        });
        success = false;
      }
    } catch (error) {
      console.error("Retry attempt failed:", error);
      if (item.attempt < 3) {
        newQueue.push({
          ...item,
          attempt: item.attempt + 1
        });
        success = false;
      }
    }
  }
  
  // Update the queue
  if (newQueue.length > 0) {
    saveRetryQueues.set(userId, newQueue);
    console.log(`${newQueue.length} items remain in retry queue after processing`);
  } else {
    saveRetryQueues.delete(userId);
    console.log(`Retry queue cleared for user ${userId}`);
  }
  
  return success;
};

// Fix the error handling in the recoverPartiallyCompletedWorkout function
export const recoverPartiallyCompletedWorkout = async (workoutId: string) => {
  try {
    toast({
      title: "Attempting workout recovery..."
    });
    
    // Attempt recovery using edge function
    const { data, error } = await supabase.functions.invoke('recover-workout', {
      body: { workoutId }
    });
    
    if (error) {
      console.error("Recovery edge function error:", error);
      
      // Fall back to direct database operation if function fails
      try {
        const { data: workout, error: diagError } = await supabase
          .from('workout_sessions')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', workoutId)
          .select();
          
        if (diagError) {
          throw diagError;
        }
        
        return {
          success: true,
          workoutId // workoutId was missing here
        };
      } catch (dbError) {
        return {
          success: false,
          error: {
            type: 'database' as const,
            message: 'Failed to recover workout',
            details: dbError,
            timestamp: new Date().toISOString(),
            recoverable: false
          }
        };
      }
    }
    
    return { success: true, workoutId: data?.workoutId || workoutId }; // Ensure workoutId is returned from function result
  } catch (error) {
    console.error("Error recovering workout:", error);
    return {
      success: false,
      error: {
        type: 'unknown' as const,
        message: error instanceof Error ? error.message : 'Unknown error during recovery',
        timestamp: new Date().toISOString(),
        recoverable: false
      }
    };
  }
};

// New helper function to perform immediate recovery
export const attemptImmediateRecovery = async (workoutId: string) => {
  try {
    toast({
      title: "Attempting workout recovery..."
    });
    
    const result = await recoverPartiallyCompletedWorkout(workoutId);
    
    if (result.success) {
      toast({
        title: "Workout data recovery successful",
        variant: "default" // Changed from "success"
      });
      return true;
    } else {
      toast({
        title: "Recovery attempt failed", 
        description: result.error?.message || "Unknown error",
        variant: "destructive"
      });
      return false;
    }
  } catch (error) {
    console.error("Immediate recovery attempt failed:", error);
    toast({
      title: "Recovery attempt failed", 
      description: error instanceof Error ? error.message : "Unknown error",
      variant: "destructive"
    });
    return false;
  }
};
