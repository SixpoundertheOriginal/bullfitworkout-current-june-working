
import { useState, useEffect, useCallback } from 'react';
import { MuscleGroup, EquipmentType, MovementPattern, Difficulty, LoadingType, VariantCategory } from '@/types/exercise';
import { exerciseDataTransform } from '@/utils/exerciseDataTransform';

interface ExerciseFormData {
  name: string;
  description: string;
  primary_muscle_groups: MuscleGroup[];
  secondary_muscle_groups: MuscleGroup[];
  equipment_type: EquipmentType[];
  movement_pattern: MovementPattern;
  difficulty: Difficulty;
  instructions: {
    steps: string;
    form: string;
  };
  is_compound: boolean;
  tips: string[];
  variations: string[];
  metadata: Record<string, any>;
  loading_type?: LoadingType;
  estimated_load_percent?: number;
  variant_category?: VariantCategory;
  is_bodyweight: boolean;
  energy_cost_factor: number;
}

interface UseExerciseFormProps {
  initialExercise?: any;
  open: boolean;
}

export const useExerciseForm = ({ initialExercise, open }: UseExerciseFormProps) => {
  const [exercise, setExercise] = useState<ExerciseFormData>({
    name: "",
    description: "",
    primary_muscle_groups: [],
    secondary_muscle_groups: [],
    equipment_type: [],
    movement_pattern: "push",
    difficulty: "beginner",
    instructions: { steps: "", form: "" },
    is_compound: false,
    tips: [],
    variations: [],
    metadata: {},
    loading_type: undefined,
    estimated_load_percent: undefined,
    variant_category: undefined,
    is_bodyweight: false,
    energy_cost_factor: 1,
  });

  const [newTip, setNewTip] = useState("");
  const [newVariation, setNewVariation] = useState("");
  const [formError, setFormError] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Reset form when dialog opens/closes or when initialExercise changes
  useEffect(() => {
    if (initialExercise) {
      const safeData = exerciseDataTransform.fromDatabase(initialExercise);
      
      setExercise({
        name: safeData?.name || "",
        description: safeData?.description || "",
        primary_muscle_groups: safeData?.primary_muscle_groups || [],
        secondary_muscle_groups: safeData?.secondary_muscle_groups || [],
        equipment_type: safeData?.equipment_type || [],
        movement_pattern: initialExercise.movement_pattern || "push",
        difficulty: initialExercise.difficulty || "beginner",
        instructions: safeData?.instructions || { steps: "", form: "" },
        is_compound: safeData?.is_compound || false,
        tips: safeData?.tips || [],
        variations: safeData?.variations || [],
        metadata: safeData?.metadata || {},
        loading_type: initialExercise.loading_type || undefined,
        estimated_load_percent: initialExercise.estimated_load_percent,
        variant_category: initialExercise.variant_category || undefined,
        is_bodyweight: safeData?.is_bodyweight || false,
        energy_cost_factor: safeData?.energy_cost_factor || 1,
      });
    } else {
      setExercise({
        name: "",
        description: "",
        primary_muscle_groups: [],
        secondary_muscle_groups: [],
        equipment_type: [],
        movement_pattern: "push",
        difficulty: "beginner",
        instructions: { steps: "", form: "" },
        is_compound: false,
        tips: [],
        variations: [],
        metadata: {},
        loading_type: undefined,
        estimated_load_percent: undefined,
        variant_category: undefined,
        is_bodyweight: false,
        energy_cost_factor: 1,
      });
    }
    setFormError("");
    setValidationErrors([]);
  }, [initialExercise, open]);

  // Update bodyweight status based on equipment
  useEffect(() => {
    const safeEquipmentType = exerciseDataTransform.ensureArray(exercise.equipment_type);
    if (safeEquipmentType.includes('bodyweight')) {
      setExercise(prev => ({ ...prev, is_bodyweight: true }));
    }
  }, [exercise.equipment_type]);

  // Real-time validation
  useEffect(() => {
    const validation = exerciseDataTransform.validateExerciseData(exercise);
    setValidationErrors(validation.errors);
  }, [exercise]);

  const updateExercise = useCallback((updates: Partial<ExerciseFormData>) => {
    setExercise(prev => ({ ...prev, ...updates }));
  }, []);

  const addTip = useCallback(() => {
    const trimmedTip = newTip.trim();
    if (trimmedTip) {
      const safeTips = exerciseDataTransform.ensureArray(exercise.tips);
      setExercise(prev => ({ ...prev, tips: [...safeTips, trimmedTip] }));
      setNewTip("");
    }
  }, [newTip, exercise.tips]);

  const removeTip = useCallback((index: number) => {
    const safeTips = exerciseDataTransform.ensureArray(exercise.tips);
    setExercise(prev => ({ ...prev, tips: safeTips.filter((_, i) => i !== index) }));
  }, [exercise.tips]);

  const addVariation = useCallback(() => {
    const trimmedVariation = newVariation.trim();
    if (trimmedVariation) {
      const safeVariations = exerciseDataTransform.ensureArray(exercise.variations);
      setExercise(prev => ({ ...prev, variations: [...safeVariations, trimmedVariation] }));
      setNewVariation("");
    }
  }, [newVariation, exercise.variations]);

  const removeVariation = useCallback((index: number) => {
    const safeVariations = exerciseDataTransform.ensureArray(exercise.variations);
    setExercise(prev => ({ ...prev, variations: safeVariations.filter((_, i) => i !== index) }));
  }, [exercise.variations]);

  const validateAndPrepareSubmission = useCallback(() => {
    try {
      setFormError("");
      
      const validation = exerciseDataTransform.validateExerciseData(exercise);
      if (!validation.isValid) {
        setFormError(validation.errors.join(', '));
        return null;
      }

      return exerciseDataTransform.toDatabase(exercise);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to prepare exercise data";
      setFormError(errorMessage);
      return null;
    }
  }, [exercise]);

  return {
    exercise,
    updateExercise,
    newTip,
    setNewTip,
    newVariation,
    setNewVariation,
    formError,
    validationErrors,
    addTip,
    removeTip,
    addVariation,
    removeVariation,
    validateAndPrepareSubmission,
  };
};
