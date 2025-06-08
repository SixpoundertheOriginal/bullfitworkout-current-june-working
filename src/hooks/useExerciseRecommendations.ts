
import { useMemo, useCallback } from 'react';
import { Exercise } from '@/types/exercise';
import { EnhancedExercise, ExerciseRecommendation } from '@/types/enhanced-exercise';
import { usePersonalStatsForMultipleExercises } from './usePersonalStats';
import { useWorkoutHistory } from '@/hooks/useWorkoutHistory';

interface UseExerciseRecommendationsOptions {
  currentExercises?: Exercise[];
  availableExercises: Exercise[];
  context: 'library' | 'workout_planning' | 'exercise_selection';
  maxRecommendations?: number;
}

export function useExerciseRecommendations({
  currentExercises = [],
  availableExercises,
  context,
  maxRecommendations = 5
}: UseExerciseRecommendationsOptions) {
  const { workouts } = useWorkoutHistory();
  const allExerciseIds = availableExercises.map(ex => ex.name);
  const { data: personalStatsMap } = usePersonalStatsForMultipleExercises(allExerciseIds);

  // Analyze user exercise preferences from workout history
  const userPreferences = useMemo(() => {
    if (!workouts || workouts.length === 0) return {};

    const exerciseFrequency: Record<string, number> = {};
    const exercisePairings: Record<string, Record<string, number>> = {};

    workouts.slice(-20).forEach(workout => { // Look at last 20 workouts
      const exercisesInWorkout = new Set<string>();
      
      workout.exerciseSets?.forEach(set => {
        if (set.exercise_name) {
          exerciseFrequency[set.exercise_name] = (exerciseFrequency[set.exercise_name] || 0) + 1;
          exercisesInWorkout.add(set.exercise_name);
        }
      });

      // Track exercise pairings
      const exerciseList = Array.from(exercisesInWorkout);
      exerciseList.forEach(exercise1 => {
        if (!exercisePairings[exercise1]) exercisePairings[exercise1] = {};
        exerciseList.forEach(exercise2 => {
          if (exercise1 !== exercise2) {
            exercisePairings[exercise1][exercise2] = (exercisePairings[exercise1][exercise2] || 0) + 1;
          }
        });
      });
    });

    return { exerciseFrequency, exercisePairings };
  }, [workouts]);

  // Generate contextual recommendations
  const generateRecommendations = useCallback((): ExerciseRecommendation[] => {
    const recommendations: ExerciseRecommendation[] = [];
    const currentExerciseNames = new Set(currentExercises.map(ex => ex.name));

    // 1. Personal preference recommendations
    if (context === 'library' || context === 'exercise_selection') {
      const preferredExercises = Object.entries(userPreferences.exerciseFrequency || {})
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3)
        .map(([exerciseName]) => exerciseName);

      preferredExercises.forEach(exerciseName => {
        const exercise = availableExercises.find(ex => ex.name === exerciseName);
        if (exercise && !currentExerciseNames.has(exerciseName)) {
          recommendations.push({
            exercise: exercise as EnhancedExercise,
            reason: 'preference',
            priority: 'medium',
            confidence: 0.8
          });
        }
      });
    }

    // 2. Exercise pairing recommendations (if planning workout)
    if (context === 'workout_planning' && currentExercises.length > 0) {
      const lastExercise = currentExercises[currentExercises.length - 1];
      const pairings = userPreferences.exercisePairings?.[lastExercise.name] || {};
      
      Object.entries(pairings)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 2)
        .forEach(([exerciseName, frequency]) => {
          const exercise = availableExercises.find(ex => ex.name === exerciseName);
          if (exercise && !currentExerciseNames.has(exerciseName) && frequency >= 2) {
            recommendations.push({
              exercise: exercise as EnhancedExercise,
              reason: 'preference',
              priority: 'high',
              confidence: 0.9
            });
          }
        });
    }

    // 3. Progression recommendations
    availableExercises.forEach(exercise => {
      const stats = personalStatsMap?.[exercise.name];
      if (stats?.isReadyToProgress && !currentExerciseNames.has(exercise.name)) {
        // Find progression exercises (simplified - would need exercise relationship mapping)
        const progressionKeywords = ['advanced', 'weighted', 'single arm', 'single leg'];
        const hasProgressionKeyword = progressionKeywords.some(keyword => 
          exercise.name.toLowerCase().includes(keyword)
        );

        if (hasProgressionKeyword) {
          recommendations.push({
            exercise: exercise as EnhancedExercise,
            reason: 'progression',
            priority: 'high',
            confidence: 0.85
          });
        }
      }
    });

    // 4. Neglected muscle group recommendations
    if (personalStatsMap) {
      const muscleGroupFrequency: Record<string, number> = {};
      
      Object.entries(personalStatsMap).forEach(([exerciseName, stats]) => {
        if (!stats) return;
        const exercise = availableExercises.find(ex => ex.name === exerciseName);
        if (!exercise) return;

        exercise.primary_muscle_groups?.forEach(muscle => {
          muscleGroupFrequency[muscle] = (muscleGroupFrequency[muscle] || 0) + stats.totalSessions;
        });
      });

      const avgFrequency = Object.values(muscleGroupFrequency).reduce((sum, freq) => sum + freq, 0) / Object.keys(muscleGroupFrequency).length;
      const neglectedMuscles = Object.entries(muscleGroupFrequency)
        .filter(([, frequency]) => frequency < avgFrequency * 0.7)
        .map(([muscle]) => muscle);

      neglectedMuscles.forEach(muscle => {
        const muscleExercises = availableExercises.filter(ex => 
          ex.primary_muscle_groups?.includes(muscle as any) && 
          !currentExerciseNames.has(ex.name)
        );
        
        if (muscleExercises.length > 0) {
          recommendations.push({
            exercise: muscleExercises[0] as EnhancedExercise,
            reason: 'muscle_balance',
            priority: 'medium',
            confidence: 0.7
          });
        }
      });
    }

    // 5. Variety recommendations (exercises not done recently)
    const recentExercises = new Set(
      workouts?.slice(-5)
        .flatMap(w => w.exerciseSets?.map(s => s.exercise_name) || [])
        .filter(Boolean) || []
    );

    const varietyExercises = availableExercises.filter(ex => 
      !recentExercises.has(ex.name) && 
      !currentExerciseNames.has(ex.name)
    );

    varietyExercises.slice(0, 2).forEach(exercise => {
      recommendations.push({
        exercise: exercise as EnhancedExercise,
        reason: 'variety',
        priority: 'low',
        confidence: 0.5
      });
    });

    // Sort by priority and confidence, then limit results
    return recommendations
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.confidence - a.confidence;
      })
      .slice(0, maxRecommendations);
  }, [currentExercises, availableExercises, context, userPreferences, personalStatsMap, workouts, maxRecommendations]);

  const recommendations = useMemo(() => generateRecommendations(), [generateRecommendations]);

  // Get recommendations by specific reason
  const getRecommendationsByReason = useCallback((reason: ExerciseRecommendation['reason']) => {
    return recommendations.filter(rec => rec.reason === reason);
  }, [recommendations]);

  // Get high-priority recommendations
  const getHighPriorityRecommendations = useCallback(() => {
    return recommendations.filter(rec => rec.priority === 'high');
  }, [recommendations]);

  return {
    recommendations,
    getRecommendationsByReason,
    getHighPriorityRecommendations,
    hasRecommendations: recommendations.length > 0
  };
}
