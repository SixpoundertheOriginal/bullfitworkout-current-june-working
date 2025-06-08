
import { useState, useCallback, useMemo } from 'react';
import { FilterPreset } from '@/types/enhanced-exercise';

export function useFilterPresets() {
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Define smart filter presets for different user goals
  const presets = useMemo((): FilterPreset[] => [
    {
      id: 'beginner-full-body',
      name: 'Beginner Full Body',
      description: 'Simple, effective exercises for beginners',
      icon: '🎯',
      filters: {
        complexityLevel: ['fundamental'],
        movementPatterns: ['push', 'pull', 'squat', 'hinge'],
        equipment: ['bodyweight', 'dumbbells']
      },
      targetAudience: 'beginner'
    },
    {
      id: 'bodybuilder-hypertrophy',
      name: 'Bodybuilder Focus',
      description: 'Isolation and compound movements for muscle growth',
      icon: '💪',
      filters: {
        trainingFocus: ['hypertrophy'],
        complexityLevel: ['intermediate', 'advanced'],
        equipment: ['dumbbells', 'barbells', 'machines']
      },
      targetAudience: 'bodybuilder'
    },
    {
      id: 'athlete-performance',
      name: 'Athletic Performance',
      description: 'Functional movements for athletic development',
      icon: '⚡',
      filters: {
        trainingFocus: ['power', 'strength'],
        movementPatterns: ['squat', 'hinge', 'push', 'pull', 'carry'],
        complexityLevel: ['intermediate', 'advanced', 'expert']
      },
      targetAudience: 'athlete'
    },
    {
      id: 'powerlifter-strength',
      name: 'Powerlifter Training',
      description: 'Heavy compound movements for maximum strength',
      icon: '🏋️',
      filters: {
        trainingFocus: ['strength'],
        movementPatterns: ['squat', 'hinge', 'push'],
        equipment: ['barbells'],
        complexityLevel: ['advanced', 'expert']
      },
      targetAudience: 'powerlifter'
    },
    {
      id: 'home-workout',
      name: 'Home Workout',
      description: 'Effective exercises with minimal equipment',
      icon: '🏠',
      filters: {
        equipment: ['bodyweight', 'dumbbells', 'resistance_bands'],
        complexityLevel: ['fundamental', 'intermediate']
      },
      targetAudience: 'beginner'
    },
    {
      id: 'core-stability',
      name: 'Core & Stability',
      description: 'Strengthen your core and improve stability',
      icon: '🎯',
      filters: {
        movementPatterns: ['core'],
        trainingFocus: ['stability', 'strength'],
        muscleGroups: ['abs', 'obliques']
      },
      targetAudience: 'intermediate'
    },
    {
      id: 'push-pull-split',
      name: 'Push/Pull Split',
      description: 'Balanced push and pull movements',
      icon: '↔️',
      filters: {
        movementPatterns: ['push', 'pull'],
        trainingFocus: ['hypertrophy', 'strength']
      },
      targetAudience: 'intermediate'
    },
    {
      id: 'lower-body-focus',
      name: 'Lower Body Power',
      description: 'Comprehensive lower body development',
      icon: '🦵',
      filters: {
        movementPatterns: ['squat', 'hinge'],
        muscleGroups: ['quadriceps', 'hamstrings', 'glutes'],
        trainingFocus: ['strength', 'power']
      },
      targetAudience: 'intermediate'
    }
  ], []);

  // Apply a preset to current filters
  const applyPreset = useCallback((presetId: string, setFilters: (filters: any) => void) => {
    const preset = presets.find(p => p.id === presetId);
    if (!preset) return;

    setActivePreset(presetId);
    
    // Convert preset filters to the format expected by useUnifiedExerciseFiltering
    const filterUpdate: any = {};
    
    if (preset.filters.muscleGroups?.length) {
      filterUpdate.selectedMuscleGroup = preset.filters.muscleGroups[0];
    }
    
    if (preset.filters.equipment?.length) {
      filterUpdate.selectedEquipment = preset.filters.equipment[0];
    }
    
    if (preset.filters.complexityLevel?.length) {
      filterUpdate.selectedDifficulty = preset.filters.complexityLevel[0] === 'fundamental' ? 'beginner' :
                                        preset.filters.complexityLevel[0] === 'expert' ? 'advanced' :
                                        preset.filters.complexityLevel[0];
    }
    
    setFilters(filterUpdate);
  }, [presets]);

  // Clear active preset
  const clearPreset = useCallback(() => {
    setActivePreset(null);
  }, []);

  // Get preset by ID
  const getPreset = useCallback((presetId: string) => {
    return presets.find(p => p.id === presetId);
  }, [presets]);

  // Get presets by target audience
  const getPresetsByAudience = useCallback((audience: FilterPreset['targetAudience']) => {
    return presets.filter(p => p.targetAudience === audience);
  }, [presets]);

  return {
    presets,
    activePreset,
    applyPreset,
    clearPreset,
    getPreset,
    getPresetsByAudience
  };
}
