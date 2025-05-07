
import { useMemo } from 'react';
import { Exercise } from '@/types/exercise';
import { useExerciseFilters } from '@/context/ExerciseFilterContext';

export function useFilteredExercises() {
  const {
    searchQuery,
    selectedMuscleGroup,
    selectedEquipment,
    selectedDifficulty,
    selectedMovement
  } = useExerciseFilters();

  const filterExercises = useMemo(() => (exercisesList: Exercise[]) => {
    return exercisesList.filter(exercise => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        exercise.description?.toLowerCase().includes(searchQuery.toLowerCase());

      // Muscle group filter
      const matchesMuscleGroup = selectedMuscleGroup === "all" || 
        exercise.primary_muscle_groups.includes(selectedMuscleGroup as any) ||
        (exercise.secondary_muscle_groups && exercise.secondary_muscle_groups.includes(selectedMuscleGroup as any));

      // Equipment filter
      const matchesEquipment = selectedEquipment === "all" || 
        exercise.equipment_type.includes(selectedEquipment as any);

      // Difficulty filter
      const matchesDifficulty = selectedDifficulty === "all" || 
        exercise.difficulty === selectedDifficulty;

      // Movement pattern filter
      const matchesMovement = selectedMovement === "all" || 
        exercise.movement_pattern === selectedMovement;

      return matchesSearch && matchesMuscleGroup && matchesEquipment && 
            matchesDifficulty && matchesMovement;
    });
  }, [searchQuery, selectedMuscleGroup, selectedEquipment, selectedDifficulty, selectedMovement]);

  return {
    filterExercises
  };
}
