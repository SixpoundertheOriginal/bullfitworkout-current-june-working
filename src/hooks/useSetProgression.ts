
import { useMemo } from 'react';
import { setProgressionService } from '@/services/SetProgressionService';
import { ExerciseSet } from '@/types/exercise';

interface UseSetProgressionProps {
  exerciseName: string;
  sets: ExerciseSet[];
  userPreferences?: any;
}

export const useSetProgression = ({ 
  exerciseName, 
  sets, 
  userPreferences 
}: UseSetProgressionProps) => {
  const nextSetSuggestion = useMemo(() => {
    const context = {
      exerciseName,
      currentSets: sets,
      userPreferences: userPreferences || {},
      workoutDuration: 0, // Could be passed from workout store
      totalVolume: sets.reduce((sum, set) => sum + (set.completed ? set.volume : 0), 0)
    };

    return setProgressionService.calculateNextSet(context);
  }, [exerciseName, sets, userPreferences]);

  const getSmartDefaults = () => {
    if (nextSetSuggestion.confidence > 0) {
      return {
        weight: nextSetSuggestion.weight,
        reps: nextSetSuggestion.reps,
        restTime: nextSetSuggestion.restTime
      };
    }
    
    // Fallback to basic defaults
    return {
      weight: 0,
      reps: 0,
      restTime: 60
    };
  };

  return {
    nextSetSuggestion,
    getSmartDefaults,
    confidence: nextSetSuggestion.confidence
  };
};
