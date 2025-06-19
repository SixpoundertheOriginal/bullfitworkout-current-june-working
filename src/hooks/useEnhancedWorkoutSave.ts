
import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { globalCleanupService } from '@/services/GlobalCleanupService';
import type { ExerciseSet } from '@/store/workoutStore';

interface WorkoutData {
  exercises: Record<string, ExerciseSet[]>;
  duration: number;
  startTime: Date;
  endTime: Date;
  trainingType: string;
  name: string;
  notes?: string;
  metadata?: any;
  trainingConfig?: any;
}

interface SaveResult {
  success: boolean;
  workoutId?: string;
  error?: any;
  partialSave?: boolean;
}

interface TransactionResult {
  success: boolean;
  workout_id?: string;
  error?: string;
  detail?: string;
}

export const useEnhancedWorkoutSave = () => {
  const { user } = useAuth();
  const [saveProgress, setSaveProgress] = useState<number>(0);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const operationIdRef = useRef<string | null>(null);

  const saveMutation = useMutation({
    mutationFn: async (workoutData: WorkoutData): Promise<SaveResult> => {
      if (!user) throw new Error('User not authenticated');
      
      // Generate unique operation ID for tracking
      const operationId = `save-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      operationIdRef.current = operationId;
      
      console.log(`[EnhancedWorkoutSave] Starting save operation: ${operationId}`);
      
      // Disable cleanup during save operation
      globalCleanupService.disableCleanupTemporarily(15000); // 15 seconds
      
      try {
        setSaveStatus('saving');
        setSaveProgress(10);
        
        // Prepare workout data for atomic transaction
        const workoutRecord = {
          user_id: user.id,
          name: workoutData.name,
          training_type: workoutData.trainingType,
          start_time: workoutData.startTime.toISOString(),
          end_time: workoutData.endTime.toISOString(),
          duration: workoutData.duration,
          notes: workoutData.notes || '',
          metadata: {
            trainingConfig: workoutData.trainingConfig,
            ...workoutData.metadata
          }
        };

        setSaveProgress(25);

        // Prepare exercise sets
        const exerciseSets = [];
        let setNumber = 1;
        
        for (const [exerciseName, sets] of Object.entries(workoutData.exercises)) {
          for (const set of sets) {
            if (set.completed) {
              exerciseSets.push({
                exercise_name: exerciseName,
                weight: set.weight || 0,
                reps: set.reps || 0,
                set_number: setNumber++,
                completed: set.completed,
                rest_time: set.restTime || 60
              });
            }
          }
        }

        setSaveProgress(40);

        // Try atomic transaction first
        console.log(`[EnhancedWorkoutSave] Attempting atomic save via transaction function`);
        
        const { data: transactionResult, error: transactionError } = await supabase.rpc(
          'save_workout_transaction',
          {
            p_workout_data: workoutRecord,
            p_exercise_sets: exerciseSets
          }
        );

        setSaveProgress(70);

        if (transactionError) {
          console.warn(`[EnhancedWorkoutSave] Transaction failed, using fallback:`, transactionError);
          
          // Fallback to manual save
          const { data: workout, error: workoutError } = await supabase
            .from('workout_sessions')
            .insert(workoutRecord)
            .select()
            .single();

          if (workoutError) throw workoutError;

          setSaveProgress(85);

          if (exerciseSets.length > 0) {
            const formattedSets = exerciseSets.map(set => ({
              ...set,
              workout_id: workout.id
            }));

            const { error: setsError } = await supabase
              .from('exercise_sets')
              .insert(formattedSets);

            if (setsError) {
              console.error(`[EnhancedWorkoutSave] Sets save failed:`, setsError);
              // Partial save - workout saved but some sets failed
              return {
                success: true,
                workoutId: workout.id,
                partialSave: true,
                error: setsError
              };
            }
          }

          setSaveProgress(100);
          console.log(`[EnhancedWorkoutSave] Fallback save completed:`, workout.id);
          
          return {
            success: true,
            workoutId: workout.id
          };
        }

        // Parse transaction result properly with safe type conversion
        const result = transactionResult as unknown as TransactionResult;
        
        setSaveProgress(100);
        console.log(`[EnhancedWorkoutSave] Atomic save completed:`, result?.workout_id);
        
        return {
          success: true,
          workoutId: result?.workout_id
        };

      } catch (error) {
        console.error(`[EnhancedWorkoutSave] Save failed:`, error);
        throw error;
      } finally {
        operationIdRef.current = null;
      }
    },
    onSuccess: (result) => {
      setSaveStatus('success');
      console.log(`[EnhancedWorkoutSave] Save successful:`, result);
      
      if (result.partialSave) {
        toast({
          title: "Workout saved with warnings",
          description: "Your workout was saved but some exercise data may be incomplete.",
          variant: "default"
        });
      } else {
        toast({
          title: "Workout saved successfully!",
          description: "Your workout has been recorded and your progress updated."
        });
      }
    },
    onError: (error) => {
      setSaveStatus('error');
      console.error(`[EnhancedWorkoutSave] Save error:`, error);
      
      toast({
        title: "Error saving workout",
        description: "There was a problem saving your workout. Please try again.",
        variant: "destructive"
      });
    }
  });

  const reset = () => {
    setSaveProgress(0);
    setSaveStatus('idle');
    operationIdRef.current = null;
  };

  return {
    saveWorkout: saveMutation.mutate,
    saveWorkoutAsync: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    isSuccess: saveMutation.isSuccess,
    error: saveMutation.error,
    saveProgress,
    saveStatus,
    reset
  };
};
