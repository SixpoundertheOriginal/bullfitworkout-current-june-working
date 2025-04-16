
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Exercise } from "@/types/exercise";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

export function useExercises() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchExercises = async (): Promise<Exercise[]> => {
    if (!user) throw new Error("User not authenticated");

    // Get global exercises and user's custom exercises
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .or(`is_custom.eq.false,created_by.eq.${user.id}`);

    if (error) {
      console.error("Error fetching exercises:", error);
      throw error;
    }

    return data || [];
  };

  const createExercise = async (exercise: Omit<Exercise, 'id'>): Promise<Exercise> => {
    if (!user) throw new Error("User not authenticated");

    const newExercise = {
      ...exercise,
      is_custom: true,
      created_by: user.id,
    };

    const { data, error } = await supabase
      .from('exercises')
      .insert(newExercise)
      .select()
      .single();

    if (error) {
      console.error("Error creating exercise:", error);
      throw error;
    }

    return data;
  };

  const exercisesQuery = useQuery({
    queryKey: ['exercises'],
    queryFn: fetchExercises,
    enabled: !!user,
  });

  const createExerciseMutation = useMutation({
    mutationFn: createExercise,
    onSuccess: (newExercise) => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      toast({
        title: "Exercise created",
        description: `${newExercise.name} has been added to your exercises.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating exercise",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    exercises: exercisesQuery.data || [],
    isLoading: exercisesQuery.isLoading,
    isError: exercisesQuery.isError,
    error: exercisesQuery.error,
    createExercise: createExerciseMutation.mutate,
    isPending: createExerciseMutation.isPending,
  };
}
