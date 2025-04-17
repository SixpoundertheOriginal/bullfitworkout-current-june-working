
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Exercise, COMMON_MUSCLE_GROUPS, COMMON_EQUIPMENT } from "@/types/exercise";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";

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
      // Get global exercises and user's custom exercises
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .or(`is_custom.eq.false,created_by.eq.${user.id}`);

      if (error) {
        console.error("Error fetching exercises:", error);
        throw error;
      }

      // Ensure we're returning a properly typed array, even if data is null
      const exercises = data || [];
      console.log("Fetched exercises:", exercises.length);
      return exercises as Exercise[];
    } catch (error) {
      console.error("Exception in fetchExercises:", error);
      // Always return an empty array, never undefined
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
      // Make sure all required fields are present
      instructions: exercise.instructions || {},
      is_compound: exercise.is_compound !== undefined ? exercise.is_compound : false,
      // Ensure these required fields are never undefined
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
    // Explicitly type the returned data
    return data as Exercise;
  };

  const exercisesQuery = useQuery({
    queryKey: ['exercises'],
    queryFn: fetchExercises,
    enabled: !!user,
    initialData: [], // Always provide an empty array as initial data
    staleTime: 5 * 60 * 1000, // 5 minutes
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
    onError: (error: Error) => {
      toast({
        title: "Error creating exercise",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    // Ensure we always return an array, never undefined
    exercises: exercisesQuery.data || [], 
    isLoading: exercisesQuery.isLoading,
    isError: exercisesQuery.isError,
    error: exercisesQuery.error,
    createExercise: createExerciseMutation.mutate,
    isPending: createExerciseMutation.isPending,
  };
}
