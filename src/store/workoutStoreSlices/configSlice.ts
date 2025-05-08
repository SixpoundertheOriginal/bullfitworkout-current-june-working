
import { StateCreator } from 'zustand';
import { WorkoutState } from '../workoutStore';
import { TrainingConfig } from '@/hooks/useTrainingSetupPersistence';

export interface ConfigSlice {
  trainingConfig: TrainingConfig | null;
  setTrainingConfig: (config: TrainingConfig | null) => void;
}

export const createConfigSlice: StateCreator<
  WorkoutState,
  [],
  [],
  ConfigSlice
> = (set) => ({
  trainingConfig: null,
  
  setTrainingConfig: (config) => set({ 
    trainingConfig: config,
    lastTabActivity: Date.now(),
  }),
});
