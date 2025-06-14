import React from "react";
import { Exercise } from "@/types/exercise";
import { useExerciseSuggestions } from "@/hooks/useExerciseSuggestions";
import { MinimalisticExerciseSelect } from "./MinimalisticExerciseSelect";
import { ExerciseQuickSelect } from "@/components/ExerciseQuickSelect";
import { useValidatedWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { useExercises } from "@/hooks/useExercises";
import { rankExercises, getCurrentTimeOfDay, RankingCriteria } from "@/utils/exerciseRankingUtils";
import { useWorkoutStore } from "@/store/workoutStore";
import { TrainingStartButton } from "@/components/training/TrainingStartButton";

interface ExerciseSelectorProps {
  onSelectExercise: (exercise: string | Exercise) => void;
  trainingType?: string;
  useLegacyDesign?: boolean;
  className?: string;
  bodyFocus?: string[];
  movementPattern?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  showStartButton?: boolean;
}

export function ExerciseSelector({
  onSelectExercise,
  trainingType = "",
  useLegacyDesign = false,
  className,
  bodyFocus = [],
  movementPattern = [],
  difficulty,
  showStartButton = false
}: ExerciseSelectorProps) {
  const { suggestedExercises } = useExerciseSuggestions(trainingType);
  const { data } = useValidatedWorkoutHistory();
  const { exercises: allExercises } = useExercises();
  const { isActive } = useWorkoutStore();
  const timeOfDay = getCurrentTimeOfDay();
  
  // Safely get workouts from validated data
  const workouts = data?.workouts || [];
  
  // Extract recently used exercises from workout history with null guards
  const recentExercises = React.useMemo(() => {
    // Phase 1 Fix: Add null guards for crash prevention
    if (!workouts?.length || !Array.isArray(allExercises)) return [];
    
    const exerciseMap = new Map<string, Exercise>();
    
    // Get unique exercise names from recent workouts' exercise sets
    workouts.slice(0, 5).forEach(workout => {
      const exerciseNames = new Set<string>();
      
      // Note: exerciseSets is not available in validated data, 
      // so we'll need to implement a different approach for getting recent exercises
      // For now, return empty array until we add exerciseSets back to validated data
      
      // For each unique exercise name, find the matching exercise from allExercises
      exerciseNames.forEach(name => {
        const exercise = allExercises.find(e => e?.name === name);
        if (exercise && !exerciseMap.has(exercise.id)) {
          exerciseMap.set(exercise.id, exercise);
        }
      });
    });
    
    // Phase 1 Fix: Use Array.from with proper null guard
    return exerciseMap.size > 0 ? Array.from(exerciseMap.values()) : [];
  }, [workouts, allExercises]);

  // Process and rank exercises based on user preferences with null guards
  const rankedExercises = React.useMemo(() => {
    // Phase 1 Fix: Add null guards for all arrays
    const safeSuggestedExercises = Array.isArray(suggestedExercises) ? suggestedExercises : [];
    const safeRecentExercises = Array.isArray(recentExercises) ? recentExercises : [];
    
    // Combine recent and suggested exercises to be ranked
    const combinedExercises = [...safeSuggestedExercises];
    
    // Add recent exercises that aren't already in the suggested list
    safeRecentExercises.forEach(exercise => {
      if (exercise && !combinedExercises.some(e => e?.id === exercise.id)) {
        combinedExercises.push(exercise);
      }
    });
    
    // Create ranking criteria from props
    const criteria: RankingCriteria = {
      trainingType,
      bodyFocus: Array.isArray(bodyFocus) ? bodyFocus as any[] : [],
      movementPattern: Array.isArray(movementPattern) ? movementPattern as any[] : [],
      timeOfDay,
      difficulty: difficulty
    };
    
    // Apply ranking algorithm with fallback
    try {
      return rankExercises(combinedExercises, criteria);
    } catch (error) {
      console.error('Error ranking exercises:', error);
      return {
        recommended: combinedExercises.slice(0, 10),
        other: combinedExercises.slice(10),
        matchData: {}
      };
    }
  }, [suggestedExercises, recentExercises, trainingType, bodyFocus, movementPattern, timeOfDay, difficulty]);

  // Render start button if requested and no active workout
  if (showStartButton && !isActive) {
    return (
      <div className="flex flex-col items-center justify-center p-4">
        <TrainingStartButton label="Start Workout" />
        <p className="mt-4 text-sm text-gray-400 max-w-md text-center">
          Start a workout session to begin tracking your exercises and progress
        </p>
      </div>
    );
  }

  if (useLegacyDesign) {
    return (
      <ExerciseQuickSelect
        onSelectExercise={onSelectExercise}
        suggestedExercises={rankedExercises.recommended || []}
        recentExercises={recentExercises}
        otherExercises={rankedExercises.other || []}
        matchData={rankedExercises.matchData || {}}
        className={className}
      />
    );
  }

  return (
    <MinimalisticExerciseSelect
      onSelectExercise={onSelectExercise}
      suggestedExercises={rankedExercises.recommended || []}
      recentExercises={recentExercises}
      otherExercises={rankedExercises.other || []}
      matchData={rankedExercises.matchData || {}}
      trainingType={trainingType}
      className={className}
    />
  );
}
