
import { useMemo } from 'react';
import { convertWeight } from '@/utils/unitConversion'; // WeightUnit will be resolved via re-export
import { WeightUnit } from '@/types/exercise'; // Import directly for clarity if preferred, or rely on re-export
import { getPreviousSessionData, getOlderSessionData } from '@/services/exerciseHistoryService';

interface ExerciseSet {
  weight: number;
  reps: number;
  restTime?: number;
  completed: boolean;
  isEditing?: boolean;
}

export const useExerciseCardState = (
  exercise: string,
  sets: ExerciseSet[],
  weightUnit: WeightUnit
) => {
  const previousSession = useMemo(() => getPreviousSessionData(exercise), [exercise]);
  const olderSession = useMemo(() => getOlderSessionData(exercise), [exercise]);
  
  const previousSessionWeight = useMemo(() => 
    convertWeight(previousSession.weight, "lb", weightUnit), // Changed "lbs" to "lb"
    [previousSession.weight, weightUnit]
  );
  
  const weightProgress = useMemo(() => {
    const weightDiff = previousSession.weight - olderSession.weight;
    const percentChange = olderSession.weight ? 
      ((weightDiff / olderSession.weight) * 100).toFixed(1) : "0";
    const isImproved = weightDiff > 0;
    
    return { weightDiff, percentChange, isImproved };
  }, [previousSession.weight, olderSession.weight]);

  const currentVolume = useMemo(() => {
    return sets.reduce((total, set) => {
      if (set.completed && set.weight > 0 && set.reps > 0) {
        return total + (set.weight * set.reps);
      }
      return total;
    }, 0);
  }, [sets]);

  const previousVolume = useMemo(() => {
    return previousSession.weight > 0 ? 
      (convertWeight(previousSession.weight, "lb", weightUnit) * previousSession.reps * previousSession.sets) : 0; // Changed "lbs" to "lb"
  }, [previousSession, weightUnit]);
  
  const volumeProgress = useMemo(() => {
    const volumeDiff = currentVolume > 0 && previousVolume > 0 ? (currentVolume - previousVolume) : 0;
    const volumePercentChange = previousVolume > 0 ? 
      ((volumeDiff / previousVolume) * 100).toFixed(1) : "0";
    
    return { volumeDiff, volumePercentChange };
  }, [currentVolume, previousVolume]);

  const completedSetsCount = useMemo(() => 
    sets.filter(set => set.completed).length, 
    [sets]
  );
  
  const completionProgress = useMemo(() => 
    sets.length > 0 ? (completedSetsCount / sets.length) * 100 : 0, 
    [completedSetsCount, sets.length]
  );

  const hasSameGroupData = useMemo(() => {
    const exerciseGroup = previousSession?.exerciseGroup || "";
    return exerciseGroup && previousVolume > 0;
  }, [previousSession?.exerciseGroup, previousVolume]);

  return {
    previousSession,
    previousSessionWeight,
    weightProgress,
    currentVolume,
    previousVolume,
    volumeProgress,
    completedSetsCount,
    completionProgress,
    hasSameGroupData
  };
};

