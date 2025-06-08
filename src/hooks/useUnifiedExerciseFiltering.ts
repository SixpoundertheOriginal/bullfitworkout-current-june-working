
import { useState, useMemo, useCallback } from 'react';
import { Exercise, MuscleGroup, EquipmentType, Difficulty } from '@/types/exercise';

export interface UnifiedFilters {
  searchQuery: string;
  selectedMuscleGroup: MuscleGroup | 'all';
  selectedEquipment: EquipmentType | 'all';
  selectedDifficulty: Difficulty | 'all';
  selectedMovement: string | 'all';
}

export interface UseUnifiedExerciseFilteringOptions {
  exercises: Exercise[];
  initialFilters?: Partial<UnifiedFilters>;
}

export const useUnifiedExerciseFiltering = ({ 
  exercises, 
  initialFilters = {} 
}: UseUnifiedExerciseFilteringOptions) => {
  const [filters, setFilters] = useState<UnifiedFilters>({
    searchQuery: '',
    selectedMuscleGroup: 'all',
    selectedEquipment: 'all',
    selectedDifficulty: 'all',
    selectedMovement: 'all',
    ...initialFilters
  });

  // Memoized filtered exercises
  const filteredExercises = useMemo(() => {
    if (!Array.isArray(exercises)) return [];
    
    let filtered = [...exercises];

    // Apply search filter
    if (filters.searchQuery.trim()) {
      const searchLower = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(exercise =>
        exercise?.name?.toLowerCase().includes(searchLower) ||
        exercise?.description?.toLowerCase().includes(searchLower) ||
        exercise?.primary_muscle_groups?.some(muscle => 
          muscle?.toLowerCase().includes(searchLower)
        ) ||
        exercise?.secondary_muscle_groups?.some(muscle => 
          muscle?.toLowerCase().includes(searchLower)
        ) ||
        exercise?.equipment_type?.some(equipment => 
          equipment?.toLowerCase().includes(searchLower)
        )
      );
    }

    // Apply muscle group filter
    if (filters.selectedMuscleGroup !== 'all') {
      filtered = filtered.filter(exercise =>
        exercise?.primary_muscle_groups?.includes(filters.selectedMuscleGroup as MuscleGroup) ||
        exercise?.secondary_muscle_groups?.includes(filters.selectedMuscleGroup as MuscleGroup)
      );
    }

    // Apply equipment filter
    if (filters.selectedEquipment !== 'all') {
      filtered = filtered.filter(exercise =>
        exercise?.equipment_type?.includes(filters.selectedEquipment as EquipmentType)
      );
    }

    // Apply difficulty filter
    if (filters.selectedDifficulty !== 'all') {
      filtered = filtered.filter(exercise =>
        exercise?.difficulty === filters.selectedDifficulty
      );
    }

    // Apply movement pattern filter
    if (filters.selectedMovement !== 'all') {
      filtered = filtered.filter(exercise =>
        exercise?.movement_pattern === filters.selectedMovement
      );
    }

    return filtered;
  }, [exercises, filters]);

  // Filter actions
  const setSearchQuery = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const setSelectedMuscleGroup = useCallback((muscleGroup: MuscleGroup | 'all') => {
    setFilters(prev => ({ ...prev, selectedMuscleGroup: muscleGroup }));
  }, []);

  const setSelectedEquipment = useCallback((equipment: EquipmentType | 'all') => {
    setFilters(prev => ({ ...prev, selectedEquipment: equipment }));
  }, []);

  const setSelectedDifficulty = useCallback((difficulty: Difficulty | 'all') => {
    setFilters(prev => ({ ...prev, selectedDifficulty: difficulty }));
  }, []);

  const setSelectedMovement = useCallback((movement: string | 'all') => {
    setFilters(prev => ({ ...prev, selectedMovement: movement }));
  }, []);

  const clearAllFilters = useCallback(() => {
    setFilters({
      searchQuery: '',
      selectedMuscleGroup: 'all',
      selectedEquipment: 'all',
      selectedDifficulty: 'all',
      selectedMovement: 'all'
    });
  }, []);

  const hasActiveFilters = useMemo(() => {
    return filters.searchQuery.trim() !== '' ||
           filters.selectedMuscleGroup !== 'all' ||
           filters.selectedEquipment !== 'all' ||
           filters.selectedDifficulty !== 'all' ||
           filters.selectedMovement !== 'all';
  }, [filters]);

  return {
    filters,
    filteredExercises,
    setSearchQuery,
    setSelectedMuscleGroup,
    setSelectedEquipment,
    setSelectedDifficulty,
    setSelectedMovement,
    clearAllFilters,
    hasActiveFilters,
    resultCount: filteredExercises.length
  };
};
