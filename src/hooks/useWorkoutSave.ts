
import { useMutation } from '@tanstack/react-query';
import { saveWorkout } from '@/services/workoutService';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import type { ExerciseSet } from '@/store/workoutStore';

interface WorkoutData {
  exercises: Record<string, ExerciseSet[]>;
  duration: number;
  startTime: Date;
  endTime: Date;
  trainingType: string;
  name: string;
  notes?: string;
  metrics?: any;
  trainingConfig?: any;
}

export const useWorkoutSave = () => {
  const { user } = useAuth();
  
  const saveMutation = useMutation({
    mutationFn: async (workoutData: WorkoutData) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Saving workout data:', workoutData);
      
      // Transform the workout data for database storage
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
          metrics: workoutData.metrics
        }
      };

      // Save the workout session to get the workout ID
      const { data: workout, error: workoutError } = await supabase
        .from('workout_sessions')
        .insert(workoutRecord)
        .select()
        .single();

      if (workoutError) {
        console.error('Error saving workout:', workoutError);
        throw workoutError;
      }

      // Save exercise sets
      const exerciseSets = [];
      let setNumber = 1;
      
      for (const [exerciseName, sets] of Object.entries(workoutData.exercises)) {
        for (const set of sets) {
          if (set.completed) {
            exerciseSets.push({
              workout_id: workout.id,
              exercise_name: exerciseName,
              set_number: setNumber++,
              weight: set.weight,
              reps: set.reps,
              rest_time: set.restTime,
              completed: set.completed
            });
          }
        }
      }

      if (exerciseSets.length > 0) {
        const { error: setsError } = await supabase
          .from('exercise_sets')
          .insert(exerciseSets);

        if (setsError) {
          console.error('Error saving exercise sets:', setsError);
          throw setsError;
        }
      }

      return workout;
    },
    onSuccess: () => {
      toast({
        title: "Workout saved successfully!",
        description: "Your workout has been recorded and your progress updated."
      });
    },
    onError: (error) => {
      console.error('Workout save error:', error);
      toast({
        title: "Error saving workout",
        description: "There was a problem saving your workout. Please try again.",
        variant: "destructive"
      });
    }
  });

  return {
    saveWorkout: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    error: saveMutation.error,
    isSuccess: saveMutation.isSuccess,
  };
};
