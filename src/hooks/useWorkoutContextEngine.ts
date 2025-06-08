
import { useCallback, useMemo } from 'react';
import { Exercise } from '@/types/exercise';
import { EnhancedExercise, WorkoutAnalysis, ExerciseRecommendation, BalanceReport, MovementPattern, TrainingFocus, ComplexityLevel } from '@/types/enhanced-exercise';
import { usePersonalStatsForMultipleExercises } from './usePersonalStats';

interface UseWorkoutContextEngineOptions {
  selectedExercises: Exercise[];
  availableExercises: Exercise[];
  enabled?: boolean;
}

export function useWorkoutContextEngine({ 
  selectedExercises, 
  availableExercises, 
  enabled = true 
}: UseWorkoutContextEngineOptions) {
  const selectedExerciseIds = selectedExercises.map(ex => ex.name);
  const { data: personalStatsMap } = usePersonalStatsForMultipleExercises(selectedExerciseIds);

  // Enhance exercises with metadata (in real app, this would come from database)
  const enhanceExercise = useCallback((exercise: Exercise): EnhancedExercise => {
    // This is a simplified enhancement - in production, this data would come from the database
    const enhanced: EnhancedExercise = {
      ...exercise,
      personalStats: personalStatsMap?.[exercise.name],
      movementPattern: inferMovementPattern(exercise),
      trainingFocus: inferTrainingFocus(exercise),
      complexityLevel: inferComplexityLevel(exercise),
      equipmentAlternatives: findEquipmentAlternatives(exercise, availableExercises),
      prerequisites: findPrerequisites(exercise, availableExercises),
      progressions: findProgressions(exercise, availableExercises)
    };
    return enhanced;
  }, [personalStatsMap, availableExercises]);

  const enhancedSelectedExercises = useMemo(() => 
    selectedExercises.map(enhanceExercise), 
    [selectedExercises, enhanceExercise]
  );

  const enhancedAvailableExercises = useMemo(() => 
    availableExercises.map(enhanceExercise), 
    [availableExercises, enhanceExercise]
  );

  // Analyze current workout session balance
  const analyzeCurrentSession = useCallback((exercises: EnhancedExercise[]): WorkoutAnalysis => {
    const muscleGroupBalance: Record<string, number> = {};
    const movementPatternBalance: Record<MovementPattern, number> = {};
    const complexityDistribution: Record<ComplexityLevel, number> = {};
    const trainingFocusDistribution: Record<TrainingFocus, number> = {};

    exercises.forEach(exercise => {
      // Count muscle groups
      exercise.primary_muscle_groups?.forEach(muscle => {
        muscleGroupBalance[muscle] = (muscleGroupBalance[muscle] || 0) + 2;
      });
      exercise.secondary_muscle_groups?.forEach(muscle => {
        muscleGroupBalance[muscle] = (muscleGroupBalance[muscle] || 0) + 1;
      });

      // Count movement patterns
      if (exercise.movementPattern) {
        movementPatternBalance[exercise.movementPattern] = 
          (movementPatternBalance[exercise.movementPattern] || 0) + 1;
      }

      // Count complexity levels
      if (exercise.complexityLevel) {
        complexityDistribution[exercise.complexityLevel] = 
          (complexityDistribution[exercise.complexityLevel] || 0) + 1;
      }

      // Count training focus
      exercise.trainingFocus?.forEach(focus => {
        trainingFocusDistribution[focus] = (trainingFocusDistribution[focus] || 0) + 1;
      });
    });

    // Calculate push/pull ratio
    const pushCount = (movementPatternBalance.push || 0);
    const pullCount = (movementPatternBalance.pull || 0);
    const pushPullRatio = pullCount > 0 ? pushCount / pullCount : pushCount > 0 ? Infinity : 1;

    return {
      muscleGroupBalance,
      movementPatternBalance,
      pushPullRatio,
      complexityDistribution,
      trainingFocusDistribution,
      recommendedCorrections: generateBalanceCorrections(
        muscleGroupBalance,
        movementPatternBalance,
        enhancedAvailableExercises
      )
    };
  }, [enhancedAvailableExercises]);

  // Generate balance correction suggestions
  const generateBalanceCorrections = useCallback((
    muscleBalance: Record<string, number>,
    movementBalance: Record<MovementPattern, number>,
    availableExercises: EnhancedExercise[]
  ): ExerciseRecommendation[] => {
    const recommendations: ExerciseRecommendation[] = [];

    // Check for push/pull imbalance
    const pushCount = movementBalance.push || 0;
    const pullCount = movementBalance.pull || 0;
    
    if (pushCount > pullCount * 1.5) {
      // Too much pushing, recommend pull exercises
      const pullExercises = availableExercises.filter(ex => ex.movementPattern === 'pull');
      pullExercises.slice(0, 3).forEach(exercise => {
        recommendations.push({
          exercise,
          reason: 'movement_pattern',
          priority: 'high',
          confidence: 0.9
        });
      });
    } else if (pullCount > pushCount * 1.5) {
      // Too much pulling, recommend push exercises
      const pushExercises = availableExercises.filter(ex => ex.movementPattern === 'push');
      pushExercises.slice(0, 3).forEach(exercise => {
        recommendations.push({
          exercise,
          reason: 'movement_pattern',
          priority: 'high',
          confidence: 0.9
        });
      });
    }

    // Check for missing muscle groups
    const allMuscleGroups = ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quadriceps', 'hamstrings', 'glutes', 'calves', 'abs'];
    const underworkedMuscles = allMuscleGroups.filter(muscle => (muscleBalance[muscle] || 0) < 1);
    
    underworkedMuscles.forEach(muscle => {
      const muscleExercises = availableExercises.filter(ex => 
        ex.primary_muscle_groups?.includes(muscle as any)
      );
      if (muscleExercises.length > 0) {
        recommendations.push({
          exercise: muscleExercises[0],
          reason: 'muscle_balance',
          priority: 'medium',
          confidence: 0.8
        });
      }
    });

    return recommendations.slice(0, 5); // Limit to top 5 recommendations
  }, []);

  // Detect muscle imbalances based on user history
  const detectMuscleImbalances = useCallback((personalStatsArray: typeof personalStatsMap): BalanceReport => {
    if (!personalStatsArray) {
      return { imbalances: [], overallScore: 100 };
    }

    const imbalances: BalanceReport['imbalances'] = [];
    const muscleGroupFrequency: Record<string, number> = {};

    // Analyze frequency of muscle group training
    Object.entries(personalStatsArray).forEach(([exerciseId, stats]) => {
      if (!stats) return;
      
      const exercise = enhancedAvailableExercises.find(ex => ex.name === exerciseId);
      if (!exercise) return;

      exercise.primary_muscle_groups?.forEach(muscle => {
        muscleGroupFrequency[muscle] = (muscleGroupFrequency[muscle] || 0) + stats.totalSessions;
      });
    });

    // Find imbalances
    const frequencies = Object.values(muscleGroupFrequency);
    const avgFrequency = frequencies.reduce((sum, freq) => sum + freq, 0) / frequencies.length;

    Object.entries(muscleGroupFrequency).forEach(([muscle, frequency]) => {
      if (frequency < avgFrequency * 0.5) {
        const severity = frequency < avgFrequency * 0.3 ? 'severe' : 
                        frequency < avgFrequency * 0.4 ? 'moderate' : 'mild';
        
        const muscleExercises = enhancedAvailableExercises.filter(ex =>
          ex.primary_muscle_groups?.includes(muscle as any)
        );

        imbalances.push({
          type: 'muscle_group',
          description: `${muscle} appears to be undertrained compared to other muscle groups`,
          severity,
          recommendations: muscleExercises.slice(0, 3).map(exercise => ({
            exercise,
            reason: 'muscle_balance',
            priority: severity === 'severe' ? 'high' : 'medium',
            confidence: 0.8
          }))
        });
      }
    });

    const overallScore = Math.max(0, 100 - (imbalances.length * 20));

    return { imbalances, overallScore };
  }, [enhancedAvailableExercises]);

  // Recommend exercise progressions
  const recommendProgression = useCallback((exercise: EnhancedExercise): ExerciseRecommendation[] => {
    const recommendations: ExerciseRecommendation[] = [];

    // Add progressions if user is ready
    if (exercise.progressions && exercise.personalStats?.isReadyToProgress) {
      exercise.progressions.forEach(progressionId => {
        const progressionExercise = enhancedAvailableExercises.find(ex => ex.id === progressionId);
        if (progressionExercise) {
          recommendations.push({
            exercise: progressionExercise,
            reason: 'progression',
            priority: 'high',
            confidence: 0.9
          });
        }
      });
    }

    // Add equipment alternatives
    if (exercise.equipmentAlternatives) {
      exercise.equipmentAlternatives.slice(0, 2).forEach(altId => {
        const altExercise = enhancedAvailableExercises.find(ex => ex.id === altId);
        if (altExercise) {
          recommendations.push({
            exercise: altExercise,
            reason: 'variety',
            priority: 'low',
            confidence: 0.6
          });
        }
      });
    }

    return recommendations;
  }, [enhancedAvailableExercises]);

  return {
    analyzeCurrentSession: useCallback(() => analyzeCurrentSession(enhancedSelectedExercises), [analyzeCurrentSession, enhancedSelectedExercises]),
    suggestBalanceCorrections: useCallback((analysis: WorkoutAnalysis) => analysis.recommendedCorrections, []),
    detectMuscleImbalances: useCallback(() => detectMuscleImbalances(personalStatsMap), [detectMuscleImbalances, personalStatsMap]),
    recommendProgression,
    enhancedExercises: enhancedSelectedExercises,
    workoutAnalysis: analyzeCurrentSession(enhancedSelectedExercises)
  };
}

// Helper functions for exercise enhancement
function inferMovementPattern(exercise: Exercise): MovementPattern {
  const name = exercise.name.toLowerCase();
  const primaryMuscles = exercise.primary_muscle_groups?.map(m => m.toLowerCase()) || [];
  
  if (name.includes('squat') || primaryMuscles.includes('quadriceps')) return 'squat';
  if (name.includes('deadlift') || name.includes('row') || primaryMuscles.includes('hamstrings')) return 'hinge';
  if (name.includes('push') || name.includes('press') || primaryMuscles.includes('chest')) return 'push';
  if (name.includes('pull') || name.includes('chin') || primaryMuscles.includes('back')) return 'pull';
  if (name.includes('carry') || name.includes('walk')) return 'carry';
  if (name.includes('plank') || name.includes('crunch') || primaryMuscles.includes('abs')) return 'core';
  
  return 'core'; // Default fallback
}

function inferTrainingFocus(exercise: Exercise): TrainingFocus[] {
  const name = exercise.name.toLowerCase();
  const focus: TrainingFocus[] = [];
  
  if (exercise.difficulty === 'expert' || name.includes('max')) focus.push('strength');
  if (name.includes('high rep') || name.includes('burnout')) focus.push('endurance');
  if (name.includes('explosive') || name.includes('jump')) focus.push('power');
  if (name.includes('stretch') || name.includes('mobility')) focus.push('mobility');
  
  // Default to hypertrophy for most exercises
  if (focus.length === 0) focus.push('hypertrophy');
  
  return focus;
}

function inferComplexityLevel(exercise: Exercise): ComplexityLevel {
  const name = exercise.name.toLowerCase();
  
  if (exercise.difficulty === 'beginner' || name.includes('machine')) return 'fundamental';
  if (exercise.difficulty === 'intermediate') return 'intermediate';
  if (exercise.difficulty === 'advanced') return 'advanced';
  if (exercise.difficulty === 'expert') return 'expert';
  
  return 'intermediate'; // Default
}

function findEquipmentAlternatives(exercise: Exercise, availableExercises: Exercise[]): string[] {
  // Simple implementation - find exercises with same primary muscle groups but different equipment
  return availableExercises
    .filter(ex => 
      ex.id !== exercise.id &&
      ex.primary_muscle_groups?.some(muscle => 
        exercise.primary_muscle_groups?.includes(muscle)
      ) &&
      !ex.equipment_type?.some(eq => exercise.equipment_type?.includes(eq))
    )
    .slice(0, 3)
    .map(ex => ex.id);
}

function findPrerequisites(exercise: Exercise, availableExercises: Exercise[]): string[] {
  // Simple implementation - find easier exercises with similar movement patterns
  if (exercise.difficulty === 'beginner') return [];
  
  return availableExercises
    .filter(ex => 
      ex.difficulty === 'beginner' &&
      ex.primary_muscle_groups?.some(muscle => 
        exercise.primary_muscle_groups?.includes(muscle)
      )
    )
    .slice(0, 2)
    .map(ex => ex.id);
}

function findProgressions(exercise: Exercise, availableExercises: Exercise[]): string[] {
  // Simple implementation - find harder exercises with similar movement patterns
  if (exercise.difficulty === 'expert') return [];
  
  const nextDifficulty = exercise.difficulty === 'beginner' ? 'intermediate' :
                        exercise.difficulty === 'intermediate' ? 'advanced' : 'expert';
  
  return availableExercises
    .filter(ex => 
      ex.difficulty === nextDifficulty &&
      ex.primary_muscle_groups?.some(muscle => 
        exercise.primary_muscle_groups?.includes(muscle)
      )
    )
    .slice(0, 2)
    .map(ex => ex.id);
}
