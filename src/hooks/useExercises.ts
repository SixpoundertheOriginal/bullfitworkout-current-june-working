import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Exercise } from "@/types/exercise";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/sonner";

export function useExercises() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchExercises = async (): Promise<Exercise[]> => {
    if (!user) {
      console.log("User not authenticated, not fetching exercises");
      return [];
    }

    console.log("Fetching exercises for user:", user.id);
    
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error("Error fetching exercises:", error);
        throw error;
      }

      console.log("Fetched exercises data:", data);
      
      return (data || []) as Exercise[];
    } catch (error) {
      console.error("Exception in fetchExercises:", error);
      return [];
    }
  };

  const createExercise = async (exercise: Omit<Exercise, 'id'>): Promise<Exercise> => {
    if (!user) throw new Error("User not authenticated");

    console.log("Creating new exercise:", exercise.name);

    const newExercise = {
      ...exercise,
      is_custom: true,
      created_by: user.id,
      instructions: exercise.instructions || {},
      is_compound: exercise.is_compound !== undefined ? exercise.is_compound : false,
      description: exercise.description || "",
      primary_muscle_groups: exercise.primary_muscle_groups || [],
      secondary_muscle_groups: exercise.secondary_muscle_groups || [],
      equipment_type: exercise.equipment_type || []
    };

    console.log("Submitting exercise to database:", newExercise);

    const { data, error } = await supabase
      .from('exercises')
      .insert(newExercise)
      .select()
      .single();

    if (error) {
      console.error("Error creating exercise:", error);
      throw error;
    }

    console.log("Exercise created successfully:", data);
    return data as Exercise;
  };

  const exercisesQuery = useQuery({
    queryKey: ['exercises'],
    queryFn: fetchExercises,
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    retry: 3,
  });

  const createExerciseMutation = useMutation({
    mutationFn: createExercise,
    onSuccess: (newExercise) => {
      queryClient.invalidateQueries({ queryKey: ['exercises'] });
      toast(`${newExercise.name} has been added to your exercises.`);
    },
    onError: (error: Error) => {
      toast(`Error creating exercise: ${error.message}`);
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
