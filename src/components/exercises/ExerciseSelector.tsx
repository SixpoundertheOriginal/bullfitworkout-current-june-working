
import React from "react";
import { Exercise } from "@/types/exercise";
import { useExerciseSuggestions } from "@/hooks/useExerciseSuggestions";
import { MinimalisticExerciseSelect } from "./MinimalisticExerciseSelect";
import { ExerciseQuickSelect } from "@/components/ExerciseQuickSelect";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { useExercises } from "@/hooks/useExercises";
import { rankExercises, getCurrentTimeOfDay, RankingCriteria } from "@/utils/exerciseRankingUtils";
import { useWorkoutState } from "@/hooks/useWorkoutState";
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
  const { suggestedExercises = [] } = useExerciseSuggestions(trainingType);
  const { workouts = [] } = useWorkoutHistory();
  const { exercises: allExercises = [] } = useExercises();
  const { isActive } = useWorkoutState();
  const timeOfDay = getCurrentTimeOfDay();
  
  // Extract recently used exercises from workout history
  const recentExercises = React.useMemo(() => {
    if (!workouts?.length) return [];
    
    const exerciseMap = new Map<string, Exercise>();
    
    // Get unique exercise names from recent workouts' exercise sets
    workouts.slice(0, 5).forEach(workout => {
      if (!workout) return;
      
      const exerciseNames = new Set<string>();
      
      // Ensure workout.exerciseSets exists before iterating
      const exerciseSets = workout.exerciseSets || [];
      
      // Collect unique exercise names from the workout's exercise sets
      exerciseSets.forEach(set => {
        if (set && set.exercise_name) {
          exerciseNames.add(set.exercise_name);
        }
      });
      
      // For each unique exercise name, find the matching exercise from allExercises
      exerciseNames.forEach(name => {
        if (!name) return;
        
        const exercise = allExercises.find(e => e && e.name === name);
        if (exercise && !exerciseMap.has(exercise.id)) {
          exerciseMap.set(exercise.id, exercise);
        }
      });
    });
    
    return Array.from(exerciseMap.values());
  }, [workouts, allExercises]);

  // Process and rank exercises based on user preferences
  const rankedExercises = React.useMemo(() => {
    // Combine recent and suggested exercises to be ranked
    const combinedExercises = [...(suggestedExercises || [])].filter(Boolean);
    
    // Add recent exercises that aren't already in the suggested list
    (recentExercises || []).filter(Boolean).forEach(exercise => {
      if (exercise && !combinedExercises.some(e => e && e.id === exercise.id)) {
        combinedExercises.push(exercise);
      }
    });
    
    // Create ranking criteria from props
    const criteria: RankingCriteria = {
      trainingType,
      bodyFocus: (bodyFocus || []) as any[],
      movementPattern: (movementPattern || []) as any[],
      timeOfDay,
      difficulty: difficulty
    };
    
    // Apply ranking algorithm
    return rankExercises(combinedExercises, criteria);
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

  // Ensure we have valid objects before rendering
  const safeRankedExercises = {
    recommended: rankedExercises?.recommended || [],
    other: rankedExercises?.other || [],
    matchData: rankedExercises?.matchData || {}
  };

  if (useLegacyDesign) {
    return (
      <ExerciseQuickSelect
        onSelectExercise={onSelectExercise}
        suggestedExercises={safeRankedExercises.recommended}
        recentExercises={recentExercises || []}
        otherExercises={safeRankedExercises.other}
        matchData={safeRankedExercises.matchData}
        className={className}
      />
    );
  }

  return (
    <MinimalisticExerciseSelect
      onSelectExercise={onSelectExercise}
      suggestedExercises={safeRankedExercises.recommended}
      recentExercises={recentExercises || []}
      otherExercises={safeRankedExercises.other}
      matchData={safeRankedExercises.matchData}
      trainingType={trainingType}
      className={className}
    />
  );
}
