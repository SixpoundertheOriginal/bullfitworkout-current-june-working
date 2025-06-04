
import React, { createContext, useContext, useState } from "react";

interface WorkoutSetupState {
  trainingType: string;
  tags: string[];
  duration: number;
  intensity: string;
  fitnessLevel: string;
  selectedExercises: Array<{
    id: string;
    name: string;
    sets?: number;
    reps?: number;
  }>;
}

interface WorkoutSetupContextType {
  state: WorkoutSetupState;
  updateState: (updates: Partial<WorkoutSetupState>) => void;
  resetState: () => void;
}

const WorkoutSetupContext = createContext<WorkoutSetupContextType | undefined>(undefined);

const initialState: WorkoutSetupState = {
  trainingType: "Strength",
  tags: [],
  duration: 30,
  intensity: "Moderate",
  fitnessLevel: "Beginner",
  selectedExercises: []
};

export const WorkoutSetupProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<WorkoutSetupState>(initialState);

  const updateState = (updates: Partial<WorkoutSetupState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const resetState = () => {
    setState(initialState);
  };

  return (
    <WorkoutSetupContext.Provider value={{ state, updateState, resetState }}>
      {children}
    </WorkoutSetupContext.Provider>
  );
};

export const useWorkoutSetup = () => {
  const context = useContext(WorkoutSetupContext);
  if (!context) {
    throw new Error("useWorkoutSetup must be used within WorkoutSetupProvider");
  }
  return context;
};
