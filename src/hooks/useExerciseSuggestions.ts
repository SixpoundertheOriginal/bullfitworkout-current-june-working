
import { useMemo } from "react";
import { Exercise } from "@/types/exercise";
import { useExercises } from "./useExercises";

export function useExerciseSuggestions(trainingType: string = "") {
  const { exercises } = useExercises();

  const suggestedExercises = useMemo(() => {
    if (!exercises?.length) return [];

    // Filter exercises based on training type
    let filtered = [...exercises];
    
    if (trainingType.toLowerCase().includes("strength")) {
      filtered = filtered.filter(e => 
        e.is_compound || 
        e.equipment_type.some(t => ["barbell", "dumbbell", "machine"].includes(t))
      );
    }

    // Sort by compound exercises first
    filtered.sort((a, b) => {
      if (a.is_compound && !b.is_compound) return -1;
      if (!a.is_compound && b.is_compound) return 1;
      return 0;
    });

    return filtered.slice(0, 10);
  }, [exercises, trainingType]);

  return { suggestedExercises };
}
