
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export function useWorkoutHistory(limit = 30, timeRange?: { from?: Date, to?: Date }) {
  const [isLoading, setIsLoading] = useState(true);
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const queryClient = useQueryClient();
  
  const fetchWorkouts = useCallback(async () => {
    try {
      let query = supabase
        .from('workout_sessions')
        .select('*')
        .order('start_time', { ascending: false })
        .limit(limit);
        
      if (timeRange?.from) {
        query = query.gte('start_time', timeRange.from.toISOString());
      }
      
      if (timeRange?.to) {
        query = query.lte('start_time', timeRange.to.toISOString());
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      // For each workout, get the exercise count and set count
      const workoutsWithExerciseDetails = await Promise.all(
        (data || []).map(async (workout) => {
          const { data: exerciseSets, error: exerciseSetsError } = await supabase
            .from('exercise_sets')
            .select('exercise_name, id')
            .eq('workout_id', workout.id);
            
          if (exerciseSetsError) throw exerciseSetsError;
          
          // Count unique exercise names
          const exerciseNames = new Set();
          exerciseSets?.forEach(set => exerciseNames.add(set.exercise_name));
          
          return {
            ...workout,
            exerciseCount: exerciseNames.size,
            setCount: exerciseSets?.length || 0
          };
        })
      );
      
      return workoutsWithExerciseDetails;
    } catch (err) {
      console.error('Error fetching workout history:', err);
      throw err;
    }
  }, [limit, timeRange]);
  
  const { data, error: queryError, isLoading: queryLoading, refetch } = useQuery({
    queryKey: ['workout-history', limit, timeRange?.from?.toISOString(), timeRange?.to?.toISOString()],
    queryFn: fetchWorkouts,
    staleTime: 30000, // Consider data stale after 30 seconds
  });
  
  useEffect(() => {
    if (data) {
      setWorkouts(data);
      setIsLoading(false);
    }
    if (queryError) {
      setError(queryError as Error);
      setIsLoading(false);
    }
  }, [data, queryError]);
  
  // Set up a subscription for real-time updates
  useEffect(() => {
    const channel = supabase
      .channel('workout-updates')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'workout_sessions' 
        }, 
        () => {
          // When any changes occur to the workout_sessions table, invalidate the queries
          queryClient.invalidateQueries({ queryKey: ['workout-history'] });
          queryClient.invalidateQueries({ queryKey: ['workouts'] });
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
  
  return { workouts, isLoading: isLoading || queryLoading, error, refetch };
}
