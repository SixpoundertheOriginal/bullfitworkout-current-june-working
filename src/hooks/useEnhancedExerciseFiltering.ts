
import { useState, useMemo, useCallback } from 'react';
import { Exercise } from '@/types/exercise';
import { EnhancedExercise, MovementPattern, TrainingFocus, ComplexityLevel } from '@/types/enhanced-exercise';
import { useUnifiedExerciseFiltering, UnifiedFilters } from './useUnifiedExerciseFiltering';

export interface EnhancedFilters extends UnifiedFilters {
  movementPattern: MovementPattern | 'all';
  trainingFocus: TrainingFocus | 'all';
  complexityLevel: ComplexityLevel | 'all';
  hasPersonalStats: boolean | 'all';
  isReadyToProgress: boolean | 'all';
}

export interface UseEnhancedExerciseFilteringOptions {
  exercises: Exercise[];
  initialFilters?: Partial<EnhancedFilters>;
}

export const useEnhancedExerciseFiltering = ({ 
  exercises, 
  initialFilters = {} 
}: UseEnhancedExerciseFilteringOptions) => {
  // Extend the base filtering hook
  const baseFiltering = useUnifiedExerciseFiltering({ exercises, initialFilters });

  const [enhancedFilters, setEnhancedFilters] = useState<Partial<EnhancedFilters>>({
    movementPattern: 'all',
    trainingFocus: 'all',
    complexityLevel: 'all',
    hasPersonalStats: 'all',
    isReadyToProgress: 'all',
    ...initialFilters
  });

  // Enhanced filtered exercises with smart categorization
  const enhancedFilteredExercises = useMemo(() => {
    let filtered = [...baseFiltering.filteredExercises];

    // Apply movement pattern filter
    if (enhancedFilters.movementPattern !== 'all') {
      filtered = filtered.filter(exercise => {
        // This would normally come from database, using inference for demo
        const inferredPattern = inferMovementPattern(exercise);
        return inferredPattern === enhancedFilters.movementPattern;
      });
    }

    // Apply training focus filter
    if (enhancedFilters.trainingFocus !== 'all') {
      filtered = filtered.filter(exercise => {
        const inferredFocus = inferTrainingFocus(exercise);
        return inferredFocus.includes(enhancedFilters.trainingFocus as TrainingFocus);
      });
    }

    // Apply complexity level filter
    if (enhancedFilters.complexityLevel !== 'all') {
      filtered = filtered.filter(exercise => {
        const inferredComplexity = inferComplexityLevel(exercise);
        return inferredComplexity === enhancedFilters.complexityLevel;
      });
    }

    // Apply personal stats filters
    if (enhancedFilters.hasPersonalStats !== 'all') {
      filtered = filtered.filter(exercise => {
        const hasStats = Boolean((exercise as EnhancedExercise).personalStats);
        return hasStats === enhancedFilters.hasPersonalStats;
      });
    }

    if (enhancedFilters.isReadyToProgress !== 'all') {
      filtered = filtered.filter(exercise => {
        const isReady = Boolean((exercise as EnhancedExercise).personalStats?.isReadyToProgress);
        return isReady === enhancedFilters.isReadyToProgress;
      });
    }

    return filtered;
  }, [baseFiltering.filteredExercises, enhancedFilters]);

  // Enhanced filter setters
  const setMovementPattern = useCallback((pattern: MovementPattern | 'all') => {
    setEnhancedFilters(prev => ({ ...prev, movementPattern: pattern }));
  }, []);

  const setTrainingFocus = useCallback((focus: TrainingFocus | 'all') => {
    setEnhancedFilters(prev => ({ ...prev, trainingFocus: focus }));
  }, []);

  const setComplexityLevel = useCallback((level: ComplexityLevel | 'all') => {
    setEnhancedFilters(prev => ({ ...prev, complexityLevel: level }));
  }, []);

  const setHasPersonalStats = useCallback((hasStats: boolean | 'all') => {
    setEnhancedFilters(prev => ({ ...prev, hasPersonalStats: hasStats }));
  }, []);

  const setIsReadyToProgress = useCallback((isReady: boolean | 'all') => {
    setEnhancedFilters(prev => ({ ...prev, isReadyToProgress: isReady }));
  }, []);

  const clearAllEnhancedFilters = useCallback(() => {
    baseFiltering.clearAllFilters();
    setEnhancedFilters({
      movementPattern: 'all',
      trainingFocus: 'all',
      complexityLevel: 'all',
      hasPersonalStats: 'all',
      isReadyToProgress: 'all'
    });
  }, [baseFiltering]);

  const hasActiveEnhancedFilters = useMemo(() => {
    return baseFiltering.hasActiveFilters ||
           enhancedFilters.movementPattern !== 'all' ||
           enhancedFilters.trainingFocus !== 'all' ||
           enhancedFilters.complexityLevel !== 'all' ||
           enhancedFilters.hasPersonalStats !== 'all' ||
           enhancedFilters.isReadyToProgress !== 'all';
  }, [baseFiltering.hasActiveFilters, enhancedFilters]);

  // Apply filter preset
  const applyFilterPreset = useCallback((filters: any) => {
    // Apply base filters
    if (filters.selectedMuscleGroup) {
      baseFiltering.setSelectedMuscleGroup(filters.selectedMuscleGroup);
    }
    if (filters.selectedEquipment) {
      baseFiltering.setSelectedEquipment(filters.selectedEquipment);
    }
    if (filters.selectedDifficulty) {
      baseFiltering.setSelectedDifficulty(filters.selectedDifficulty);
    }
    if (filters.selectedMovement) {
      baseFiltering.setSelectedMovement(filters.selectedMovement);
    }

    // Apply enhanced filters
    if (filters.movementPattern) {
      setMovementPattern(filters.movementPattern);
    }
    if (filters.trainingFocus) {
      setTrainingFocus(filters.trainingFocus);
    }
    if (filters.complexityLevel) {
      setComplexityLevel(filters.complexityLevel);
    }
  }, [baseFiltering, setMovementPattern, setTrainingFocus, setComplexityLevel]);

  return {
    // Base filtering functionality
    ...baseFiltering,
    
    // Enhanced filtered exercises
    filteredExercises: enhancedFilteredExercises,
    
    // Enhanced filters
    enhancedFilters,
    setMovementPattern,
    setTrainingFocus,
    setComplexityLevel,
    setHasPersonalStats,
    setIsReadyToProgress,
    clearAllFilters: clearAllEnhancedFilters,
    hasActiveFilters: hasActiveEnhancedFilters,
    applyFilterPreset,
    
    // Enhanced result count
    resultCount: enhancedFilteredExercises.length
  };
};

// Helper functions for inferring exercise metadata (same as in useWorkoutContextEngine)
function inferMovementPattern(exercise: Exercise): MovementPattern {
  const name = exercise.name.toLowerCase();
  const primaryMuscles = exercise.primary_muscle_groups?.map(m => m.toLowerCase()) || [];
  
  if (name.includes('squat') || primaryMuscles.includes('quadriceps')) return 'squat';
  if (name.includes('deadlift') || name.includes('row') || primaryMuscles.includes('hamstrings')) return 'hinge';
  if (name.includes('push') || name.includes('press') || primaryMuscles.includes('chest')) return 'push';
  if (name.includes('pull') || name.includes('chin') || primaryMuscles.includes('back')) return 'pull';
  if (name.includes('carry') || name.includes('walk')) return 'carry';
  if (name.includes('plank') || name.includes('crunch') || primaryMuscles.includes('abs')) return 'core';
  
  return 'core';
}

function inferTrainingFocus(exercise: Exercise): TrainingFocus[] {
  const name = exercise.name.toLowerCase();
  const focus: TrainingFocus[] = [];
  
  if (exercise.difficulty === 'expert' || name.includes('max')) focus.push('strength');
  if (name.includes('high rep') || name.includes('burnout')) focus.push('endurance');
  if (name.includes('explosive') || name.includes('jump')) focus.push('power');
  if (name.includes('stretch') || name.includes('mobility')) focus.push('mobility');
  
  if (focus.length === 0) focus.push('hypertrophy');
  
  return focus;
}

function inferComplexityLevel(exercise: Exercise): ComplexityLevel {
  const name = exercise.name.toLowerCase();
  
  if (exercise.difficulty === 'beginner' || name.includes('machine')) return 'fundamental';
  if (exercise.difficulty === 'intermediate') return 'intermediate';
  if (exercise.difficulty === 'advanced') return 'advanced';
  if (exercise.difficulty === 'expert') return 'expert';
  
  return 'intermediate';
}
