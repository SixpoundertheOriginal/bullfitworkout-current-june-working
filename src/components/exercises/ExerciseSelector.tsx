
import React from "react";
import { Exercise } from "@/types/exercise";
import { useExerciseSuggestions } from "@/hooks/useExerciseSuggestions";
import { MinimalisticExerciseSelect } from "./MinimalisticExerciseSelect";
import { ExerciseQuickSelect } from "@/components/ExerciseQuickSelect";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";

interface ExerciseSelectorProps {
  onSelectExercise: (exercise: string | Exercise) => void;
  trainingType?: string;
  useLegacyDesign?: boolean;
  className?: string;
}

export function ExerciseSelector({
  onSelectExercise,
  trainingType = "",
  useLegacyDesign = false,
  className
}: ExerciseSelectorProps) {
  const { suggestedExercises } = useExerciseSuggestions(trainingType);
  const { data } = useWorkoutHistory();
  
  // Extract recently used exercises from workout history
  const recentExercises = React.useMemo(() => {
    if (!data?.workouts?.length) return [];
    
    const exerciseMap = new Map<string, Exercise>();
    
    // Get unique exercises from recent workouts
    data.workouts.slice(0, 5).forEach(workout => {
      workout.exercises?.forEach(exercise => {
        if (exercise.exercise && !exerciseMap.has(exercise.exercise.id)) {
          exerciseMap.set(exercise.exercise.id, exercise.exercise);
        }
      });
    });
    
    return Array.from(exerciseMap.values());
  }, [data]);

  if (useLegacyDesign) {
    return (
      <ExerciseQuickSelect
        onSelectExercise={onSelectExercise}
        suggestedExercises={suggestedExercises}
        recentExercises={recentExercises}
        className={className}
      />
    );
  }

  return (
    <MinimalisticExerciseSelect
      onSelectExercise={onSelectExercise}
      suggestedExercises={suggestedExercises}
      recentExercises={recentExercises}
      trainingType={trainingType}
      className={className}
    />
  );
}
