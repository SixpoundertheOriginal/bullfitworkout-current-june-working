
import { useState, useEffect } from 'react';
import { Exercise, ExerciseSet, WeightCalculation, EXERCISE_LOAD_FACTORS } from '@/types/exercise';

interface UseExerciseWeightProps {
  exercise: Exercise;
  userWeight?: number; // in kg
  defaultWeight?: number;
}

export const useExerciseWeight = ({ 
  exercise, 
  userWeight = 70, // Default user weight if not provided
  defaultWeight = 0 
}: UseExerciseWeightProps) => {
  const getInitialWeight = (): WeightCalculation => {
    if (!exercise) return { 
      weight: defaultWeight,
      unit: 'lb',
      value: defaultWeight, 
      isAuto: false, 
      source: 'default' 
    };

    const isBodyweight = exercise.is_bodyweight || exercise.equipment_type.includes('bodyweight');
    const loadFactor = exercise.load_factor || EXERCISE_LOAD_FACTORS.compound || 1.0;

    if (isBodyweight && userWeight) {
      const calculatedWeight = Math.round(userWeight * loadFactor * 10) / 10;
      return {
        weight: calculatedWeight,
        unit: 'lb',
        value: calculatedWeight,
        isAuto: true,
        source: 'auto'
      };
    }

    return {
      weight: defaultWeight,
      unit: 'lb',
      value: defaultWeight,
      isAuto: false,
      source: 'default'
    };
  };

  const [weightCalc, setWeightCalc] = useState<WeightCalculation>(getInitialWeight());

  useEffect(() => {
    if (weightCalc.source === 'default') {
      setWeightCalc(getInitialWeight());
    }
  }, [exercise, userWeight]);

  const updateWeight = (newWeight: number) => {
    setWeightCalc({
      weight: newWeight,
      unit: 'lb',
      value: newWeight,
      isAuto: false,
      source: 'user'
    });
  };

  const resetToAuto = () => {
    setWeightCalc(getInitialWeight());
  };

  return {
    weight: weightCalc.value || weightCalc.weight,
    isAutoWeight: weightCalc.isAuto,
    weightSource: weightCalc.source,
    updateWeight,
    resetToAuto
  };
};
