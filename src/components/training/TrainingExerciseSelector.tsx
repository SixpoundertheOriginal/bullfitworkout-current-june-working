
import React, { useMemo } from 'react';
import { Exercise } from '@/types/exercise';
import { useTrainingExercises } from '@/hooks/useTrainingExercises';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';
import { MinimalisticExerciseSelect } from '@/components/exercises/MinimalisticExerciseSelect';
import { Skeleton } from '@/components/ui/skeleton';

interface TrainingExerciseSelectorProps {
  onSelectExercise: (exercise: string | Exercise) => void;
  trainingType?: string;
  className?: string;
  bodyFocus?: string[];
  movementPattern?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

/**
 * Training-specific exercise selector optimized for workout sessions
 * Uses dedicated training context with performance optimizations
 */
export const TrainingExerciseSelector: React.FC<TrainingExerciseSelectorProps> = React.memo(({
  onSelectExercise,
  trainingType = "",
  className,
  bodyFocus = [],
  movementPattern = [],
  difficulty
}) => {
  const { exercises: trainingExercises, isLoading, error } = useTrainingExercises();
  const { workouts } = useWorkoutHistory();

  // Extract recent exercises with performance optimization
  const recentExercises = useMemo(() => {
    if (!workouts?.length || !Array.isArray(trainingExercises)) return [];
    
    const exerciseMap = new Map<string, Exercise>();
    
    // Get unique exercise names from recent workouts (last 5 for performance)
    workouts.slice(0, 5).forEach(workout => {
      const exerciseNames = new Set<string>();
      
      if (workout?.exerciseSets && Array.isArray(workout.exerciseSets)) {
        workout.exerciseSets.forEach(set => {
          if (set?.exercise_name) {
            exerciseNames.add(set.exercise_name);
          }
        });
      }
      
      exerciseNames.forEach(name => {
        const exercise = trainingExercises.find(e => e?.name === name);
        if (exercise && !exerciseMap.has(exercise.id)) {
          exerciseMap.set(exercise.id, exercise);
        }
      });
    });
    
    return Array.from(exerciseMap.values());
  }, [workouts, trainingExercises]);

  // Filter and rank exercises for training session
  const { suggestedExercises, otherExercises } = useMemo(() => {
    if (!Array.isArray(trainingExercises)) {
      return { suggestedExercises: [], otherExercises: [] };
    }

    let filtered = [...trainingExercises];

    // Apply training-specific filters
    if (bodyFocus.length > 0) {
      filtered = filtered.filter(exercise =>
        exercise?.primary_muscle_groups?.some(muscle => 
          bodyFocus.some(focus => muscle?.toLowerCase().includes(focus.toLowerCase()))
        )
      );
    }

    if (movementPattern.length > 0) {
      filtered = filtered.filter(exercise =>
        movementPattern.includes(exercise?.movement_pattern)
      );
    }

    if (difficulty) {
      filtered = filtered.filter(exercise => exercise?.difficulty === difficulty);
    }

    // Split into suggested and other
    const suggested = filtered.slice(0, 10); // Limit for performance
    const other = filtered.slice(10, 50); // Reasonable limit for training

    return {
      suggestedExercises: suggested,
      otherExercises: other
    };
  }, [trainingExercises, bodyFocus, movementPattern, difficulty]);

  if (error) {
    return (
      <div className="text-center py-8 text-red-400">
        Unable to load exercises for training. Please try again.
      </div>
    );
  }

  if (isLoading) {
    return <TrainingSelectorSkeleton />;
  }

  return (
    <MinimalisticExerciseSelect
      onSelectExercise={onSelectExercise}
      suggestedExercises={suggestedExercises}
      recentExercises={recentExercises}
      otherExercises={otherExercises}
      matchData={{}} // Training doesn't need complex match scoring
      trainingType={trainingType}
      className={className}
    />
  );
});

const TrainingSelectorSkeleton: React.FC = () => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Skeleton className="h-6 w-32 bg-gray-800" />
      <div className="grid grid-cols-2 gap-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-16 bg-gray-800 rounded-lg" />
        ))}
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-6 w-24 bg-gray-800" />
      <div className="grid grid-cols-2 gap-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-16 bg-gray-800 rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

TrainingExerciseSelector.displayName = 'TrainingExerciseSelector';
