
import { useState, useCallback, useMemo } from 'react';
import { MuscleGroup, EquipmentType, Difficulty, MovementPattern } from '@/types/exercise';

export interface ExerciseFilters {
  searchQuery: string;
  selectedMuscleGroup: MuscleGroup | 'all';
  selectedEquipment: EquipmentType | 'all';
  selectedDifficulty: Difficulty | 'all';
  selectedMovement: MovementPattern | 'all';
}

export const useExerciseFilters = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<MuscleGroup | 'all'>('all');
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentType | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'all'>('all');
  const [selectedMovement, setSelectedMovement] = useState<MovementPattern | 'all'>('all');

  const filters = useMemo(() => ({
    searchQuery,
    selectedMuscleGroup,
    selectedEquipment,
    selectedDifficulty,
    selectedMovement
  }), [searchQuery, selectedMuscleGroup, selectedEquipment, selectedDifficulty, selectedMovement]);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedMuscleGroup('all');
    setSelectedEquipment('all');
    setSelectedDifficulty('all');
    setSelectedMovement('all');
  }, []);

  const hasActiveFilters = useMemo(() => {
    return searchQuery !== '' || 
           selectedMuscleGroup !== 'all' || 
           selectedEquipment !== 'all' || 
           selectedDifficulty !== 'all' || 
           selectedMovement !== 'all';
  }, [searchQuery, selectedMuscleGroup, selectedEquipment, selectedDifficulty, selectedMovement]);

  return {
    filters,
    searchQuery,
    setSearchQuery,
    selectedMuscleGroup,
    setSelectedMuscleGroup,
    selectedEquipment,
    setSelectedEquipment,
    selectedDifficulty,
    setSelectedDifficulty,
    selectedMovement,
    setSelectedMovement,
    clearFilters,
    hasActiveFilters
  };
};
