
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";

export function useWorkoutDetails(workoutId: string | undefined) {
  const [workoutDetails, setWorkoutDetails] = useState<any>(null);
  const [exerciseSets, setExerciseSets] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(workoutId ? true : false);

  useEffect(() => {
    if (!workoutId) return;
    
    const fetchWorkoutDetails = async () => {
      try {
        setLoading(true);
        
        const { data: workout, error: workoutError } = await supabase
          .from('workout_sessions')
          .select('*')
          .eq('id', workoutId)
          .single();
          
        if (workoutError) {
          console.error('Error fetching workout:', workoutError);
          toast.error('Error loading workout details');
          return;
        }
        
        setWorkoutDetails(workout);
        
        const { data: sets, error: setsError } = await supabase
          .from('exercise_sets')
          .select('*')
          .eq('workout_id', workoutId)
          .order('exercise_name', { ascending: true })
          .order('set_number', { ascending: true });
          
        if (setsError) {
          console.error('Error fetching exercise sets:', setsError);
          toast.error('Error loading exercise data');
          return;
        }
        
        const groupedSets = sets?.reduce((acc, set) => {
          if (!acc[set.exercise_name]) {
            acc[set.exercise_name] = [];
          }
          acc[set.exercise_name].push(set);
          return acc;
        }, {}) || {};
        
        setExerciseSets(groupedSets);
      } catch (error) {
        console.error('Error in workout details fetch:', error);
        toast.error('Failed to load workout data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkoutDetails();
  }, [workoutId]);

  return { workoutDetails, exerciseSets, loading, setWorkoutDetails, setExerciseSets };
}
