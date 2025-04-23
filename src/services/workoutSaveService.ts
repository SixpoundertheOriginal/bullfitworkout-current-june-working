
import { supabase } from "@/integrations/supabase/client";
import { EnhancedExerciseSet, WorkoutError, SaveProgress } from "@/types/workout";
import { ExerciseSet } from "@/types/exercise";

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
    // 1. First attempt to use our transaction-based RPC if available
    try {
      onProgressUpdate?.({
        step: 'workout',
        total: 3,
        completed: 0,
        errors: []
      });
      
      // Format exercise sets for the RPC
      const formattedSets = Object.entries(exercises).flatMap(([exerciseName, sets], exerciseIndex) => {
        return sets.map((set, setIndex) => ({
          exercise_name: exerciseName,
          weight: set.weight || 0,
          reps: set.reps || 0,
          set_number: setIndex + 1,
          completed: set.completed || false,
          rest_time: set.restTime || 60
        }));
      });

      // Try to use our atomic transaction RPC function
      const { data: transactionResult, error: rpcError } = await supabase.rpc('save_complete_workout', {
        p_workout_data: {
          ...workoutData,
          user_id: userData.id
        },
        p_exercise_sets: formattedSets
      });
      
      // If successful, return with workoutId
      if (transactionResult && !rpcError) {
        onProgressUpdate?.({
          step: 'analytics',
          total: 3,
          completed: 3,
          errors: []
        });
        
        return {
          success: true,
          workoutId: transactionResult.workout_id
        };
      }
      
      // If the RPC doesn't exist or fails, we'll fall back to the manual approach
      console.warn("RPC save failed, falling back to manual save:", rpcError);
    } catch (rpcError) {
      console.warn("RPC call failed, using fallback:", rpcError);
      // Continue with fallback approach
    }

    // 2. Manual save approach as fallback
    // First, insert the workout record
    onProgressUpdate?.({
      step: 'workout',
      total: 3,
      completed: 0,
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
    
    // Track errors for partial save detection
    const errors: WorkoutError[] = [];
    
    // Save exercise sets with better error handling and retry capability
    const workoutId = workoutSession.id;
    let successfulSets = 0;
    let totalSets = 0;
    
    // Process exercise sets in batches with retry logic
    for (const [exerciseName, sets] of Object.entries(exercises)) {
      totalSets += sets.length;
      
      // Batch processing with retry on failure
      const batchSize = 25;
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
            })));
            
          if (batchError) {
            // Add to retry queue for later attempt
            const retryQueue = saveRetryQueues.get(userData.id) || [];
            retryQueue.push({
              exerciseName,
              sets: batch,
              workoutId,
              attempt: 1
            });
            saveRetryQueues.set(userData.id, retryQueue);
            
            errors.push({
              type: 'database',
              message: `Failed to save some sets for ${exerciseName}`,
              details: batchError,
              timestamp: new Date().toISOString(),
              recoverable: true
            });
          } else {
            successfulSets += batch.length;
          }
        } catch (error) {
          console.error("Exception saving exercise set batch:", error);
          
          // Add to retry queue
          const retryQueue = saveRetryQueues.get(userData.id) || [];
          retryQueue.push({
            exerciseName,
            sets: batch,
            workoutId,
            attempt: 1
          });
          saveRetryQueues.set(userData.id, retryQueue);
          
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
          completed: 1 + (successfulSets / totalSets),
          errors
        });
      }
    }
    
    // Try to trigger analytics refresh
    onProgressUpdate?.({
      step: 'analytics',
      total: 3,
      completed: 2,
      errors
    });
    
    try {
      // Attempt to refresh the materialized views
      await supabase.rpc('refresh_workout_analytics', {
        p_workout_id: workoutId
      }).then(({ error: refreshError }) => {
        if (refreshError) {
          console.warn("Analytics refresh failed:", refreshError);
          errors.push({
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
      errors
    });
    
    // Check if we have a partial save situation
    if (errors.length > 0) {
      return {
        success: true,
        workoutId,
        partialSave: true,
        error: errors[0] // Return first error for immediate feedback
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

// Process retry queue in the background
export const processRetryQueue = async (userId: string): Promise<boolean> => {
  const retryQueue = saveRetryQueues.get(userId);
  if (!retryQueue || retryQueue.length === 0) return true;
  
  let success = true;
  const newQueue: typeof retryQueue = [];
  
  for (const item of retryQueue) {
    try {
      const { exerciseName, sets, workoutId, attempt } = item;
      
      const { error: batchError } = await supabase
        .from('exercise_sets')
        .insert(sets.map((set, index) => ({
          workout_id: workoutId,
          exercise_name: exerciseName,
          weight: set.weight || 0,
          reps: set.reps || 0,
          set_number: index + 1,
          completed: set.completed || false,
          rest_time: set.restTime || 60
        })));
        
      if (batchError && attempt < 3) {
        // Add back to queue with increased attempt count
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
  } else {
    saveRetryQueues.delete(userId);
  }
  
  return success;
};

export const recoverPartiallyCompletedWorkout = async (workoutId: string): Promise<SaveResult> => {
  try {
    // Attempt recovery using existing service function
    const { data, error } = await supabase.functions.invoke('recover-workout', {
      body: { workoutId }
    });
    
    if (error) {
      return {
        success: false,
        error: {
          type: 'database',
          message: 'Failed to recover workout',
          details: error,
          timestamp: new Date().toISOString(),
          recoverable: false
        }
      };
    }
    
    return {
      success: true,
      workoutId
    };
  } catch (error) {
    console.error("Error recovering workout:", error);
    return {
      success: false,
      error: {
        type: 'unknown',
        message: 'An unexpected error occurred during recovery',
        details: error,
        timestamp: new Date().toISOString(),
        recoverable: false
      }
    };
  }
};
