
import { useState } from "react";
import { Training } from "@/types/training";
import { MuscleGroup } from "@/constants/exerciseMetadata";

interface TrainingState {
  name: string;
  bodyFocus: MuscleGroup[];
  trainingType: string;
  movementPattern: string[];
  sets: number;
  isCustom: boolean;
  addBodyFocus: (focus: string) => void;
  removeBodyFocus: (focus: string) => void;
  setName: (name: string) => void;
  setTrainingType: (type: string) => void;
  addMovementPattern: (pattern: string) => void;
  removeMovementPattern: (pattern: string) => void;
  reset: () => void;
  setIsCustom: (isCustom: boolean) => void;
}

export const useTrainingState = (initialTraining?: Training): TrainingState => {
  const [name, setName] = useState(initialTraining?.name || "");
  const [bodyFocus, setBodyFocus] = useState<MuscleGroup[]>(
    initialTraining?.bodyFocus || []
  );
  const [trainingType, setTrainingType] = useState(
    initialTraining?.trainingType || ""
  );
  const [movementPattern, setMovementPattern] = useState<string[]>(
    initialTraining?.movementPattern || []
  );
  const [sets, setSets] = useState(initialTraining?.sets || 3);
  const [isCustom, setIsCustom] = useState(initialTraining?.isCustom || false);

  const addBodyFocus = (focus: string) => {
    if (!bodyFocus.includes(focus as MuscleGroup)) {
      setBodyFocus([...bodyFocus, focus as MuscleGroup]);
    }
  };

  const removeBodyFocus = (focus: string) => {
    setBodyFocus(bodyFocus.filter((f) => f !== focus));
  };

  const addMovementPattern = (pattern: string) => {
    if (!movementPattern.includes(pattern)) {
      setMovementPattern([...movementPattern, pattern]);
    }
  };

  const removeMovementPattern = (pattern: string) => {
    setMovementPattern(movementPattern.filter((p) => p !== pattern));
  };

  const reset = () => {
    setName("");
    setBodyFocus([]);
    setTrainingType("");
    setMovementPattern([]);
    setSets(3);
    setIsCustom(false);
  };

  return {
    name,
    bodyFocus,
    trainingType,
    movementPattern,
    sets,
    isCustom,
    addBodyFocus,
    removeBodyFocus,
    setName,
    setTrainingType,
    addMovementPattern,
    removeMovementPattern,
    reset,
    setIsCustom,
  };
};
