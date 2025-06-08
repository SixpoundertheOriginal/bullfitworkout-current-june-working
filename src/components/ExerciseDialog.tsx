
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { MuscleGroup, EquipmentType, MovementPattern, Difficulty, 
         COMMON_MUSCLE_GROUPS, COMMON_EQUIPMENT, MOVEMENT_PATTERNS, DIFFICULTY_LEVELS,
         LOADING_TYPES, VARIANT_CATEGORIES, LoadingType, VariantCategory } from "@/types/exercise";
import { MultiSelect } from "@/components/MultiSelect";
import { exerciseDataTransform } from "@/utils/exerciseDataTransform";

interface ExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  onSubmit: (exercise: {
    name: string;
    description: string;
    primary_muscle_groups: MuscleGroup[];
    secondary_muscle_groups: MuscleGroup[];
    equipment_type: EquipmentType[];
    movement_pattern: MovementPattern;
    difficulty: Difficulty;
    instructions?: Record<string, any>;
    is_compound?: boolean;
    tips?: string[];
    variations?: string[];
    metadata?: Record<string, any>;
    loading_type?: LoadingType;
    estimated_load_percent?: number;
    variant_category?: VariantCategory;
    is_bodyweight?: boolean;
    energy_cost_factor?: number;
  }) => void;
  initialExercise?: any;
  loading?: boolean;
}

export function ExerciseDialog({
  open,
  onOpenChange,
  mode = "add",
  onSubmit,
  initialExercise,
  loading = false,
}: ExerciseDialogProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const [exercise, setExercise] = useState({
    name: "",
    description: "",
    primary_muscle_groups: [] as MuscleGroup[],
    secondary_muscle_groups: [] as MuscleGroup[],
    equipment_type: [] as EquipmentType[],
    movement_pattern: "push" as MovementPattern,
    difficulty: "beginner" as Difficulty,
    instructions: {
      steps: "",
      form: ""
    },
    is_compound: false,
    tips: [] as string[],
    variations: [] as string[],
    metadata: {},
    loading_type: undefined as LoadingType | undefined,
    estimated_load_percent: undefined as number | undefined,
    variant_category: undefined as VariantCategory | undefined,
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
      // Apply defensive transformation for existing exercise data
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
    setActiveTab("basic");
  }, [initialExercise, open]);

  // Update whether the exercise is bodyweight based on equipment type
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

  // Add a tip to the exercise with safety checks
  const addTip = () => {
    const trimmedTip = newTip.trim();
    if (trimmedTip) {
      const safeTips = exerciseDataTransform.ensureArray(exercise.tips);
      setExercise({
        ...exercise,
        tips: [...safeTips, trimmedTip],
      });
      setNewTip("");
    }
  };

  // Remove a tip from the exercise with safety checks
  const removeTip = (index: number) => {
    const safeTips = exerciseDataTransform.ensureArray(exercise.tips);
    setExercise({
      ...exercise,
      tips: safeTips.filter((_, i) => i !== index),
    });
  };

  // Add a variation to the exercise with safety checks
  const addVariation = () => {
    const trimmedVariation = newVariation.trim();
    if (trimmedVariation) {
      const safeVariations = exerciseDataTransform.ensureArray(exercise.variations);
      setExercise({
        ...exercise,
        variations: [...safeVariations, trimmedVariation],
      });
      setNewVariation("");
    }
  };

  // Remove a variation from the exercise with safety checks
  const removeVariation = (index: number) => {
    const safeVariations = exerciseDataTransform.ensureArray(exercise.variations);
    setExercise({
      ...exercise,
      variations: safeVariations.filter((_, i) => i !== index),
    });
  };

  // Handle form submission with enterprise-grade validation
  const handleSubmit = () => {
    try {
      // Clear previous errors
      setFormError("");
      
      // Validate using our enterprise utility
      const validation = exerciseDataTransform.validateExerciseData(exercise);
      if (!validation.isValid) {
        setFormError(validation.errors.join(', '));
        return;
      }

      // Apply data transformation before submission (CRITICAL FIX)
      const safeExerciseData = exerciseDataTransform.toDatabase(exercise);
      
      console.log("Submitting transformed exercise data:", safeExerciseData);
      
      // Submit the transformed exercise data
      onSubmit(safeExerciseData);
    } catch (error) {
      console.error("Error preparing exercise data:", error);
      setFormError(error instanceof Error ? error.message : "Failed to prepare exercise data");
    }
  };

  // Safe array access with defensive programming
  const safeTips = exerciseDataTransform.ensureArray(exercise.tips);
  const safeVariations = exerciseDataTransform.ensureArray(exercise.variations);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {mode === "add" ? "Add Exercise" : "Edit Exercise"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 overflow-auto">
            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-4 mt-2">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Exercise Name*</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Bench Press"
                    value={exercise.name}
                    onChange={(e) =>
                      setExercise({ ...exercise, name: e.target.value })
                    }
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of the exercise..."
                    value={exercise.description}
                    onChange={(e) =>
                      setExercise({ ...exercise, description: e.target.value })
                    }
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <Label>Primary Muscle Groups*</Label>
                  <div className="mt-1">
                    <MultiSelect
                      options={COMMON_MUSCLE_GROUPS.map(group => ({ label: group, value: group }))}
                      selected={exercise.primary_muscle_groups}
                      onChange={(selected) =>
                        setExercise({ ...exercise, primary_muscle_groups: selected as MuscleGroup[] })
                      }
                      placeholder="Select primary muscle groups"
                    />
                  </div>
                </div>

                <div>
                  <Label>Secondary Muscle Groups</Label>
                  <div className="mt-1">
                    <MultiSelect
                      options={COMMON_MUSCLE_GROUPS.map(group => ({ label: group, value: group }))}
                      selected={exercise.secondary_muscle_groups}
                      onChange={(selected) =>
                        setExercise({ ...exercise, secondary_muscle_groups: selected as MuscleGroup[] })
                      }
                      placeholder="Select secondary muscle groups"
                    />
                  </div>
                </div>

                <div>
                  <Label>Equipment Type*</Label>
                  <div className="mt-1">
                    <MultiSelect
                      options={COMMON_EQUIPMENT.map(equip => ({ label: equip, value: equip }))}
                      selected={exercise.equipment_type}
                      onChange={(selected) =>
                        setExercise({ ...exercise, equipment_type: selected as EquipmentType[] })
                      }
                      placeholder="Select equipment types"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-4 mt-2">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={exercise.difficulty}
                    onValueChange={(value) =>
                      setExercise({ ...exercise, difficulty: value as Difficulty })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {DIFFICULTY_LEVELS.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level.charAt(0).toUpperCase() + level.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="movement">Movement Pattern</Label>
                  <Select
                    value={exercise.movement_pattern}
                    onValueChange={(value) =>
                      setExercise({ ...exercise, movement_pattern: value as MovementPattern })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select movement pattern" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOVEMENT_PATTERNS.map((pattern) => (
                        <SelectItem key={pattern} value={pattern}>
                          {pattern.charAt(0).toUpperCase() + pattern.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_compound"
                    checked={exercise.is_compound}
                    onCheckedChange={(checked) =>
                      setExercise({ ...exercise, is_compound: checked as boolean })
                    }
                  />
                  <Label htmlFor="is_compound">Is compound exercise</Label>
                </div>

                <Separator />
                
                <div>
                  <Label>Exercise Tips</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      placeholder="Add a tip..."
                      value={newTip}
                      onChange={(e) => setNewTip(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addTip}
                      disabled={!newTip.trim()}
                    >
                      Add
                    </Button>
                  </div>
                  {exercise.tips.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {exercise.tips.map((tip, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded bg-muted p-2"
                        >
                          <span className="text-sm">{tip}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTip(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <Label>Exercise Variations</Label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Input
                      placeholder="Add a variation..."
                      value={newVariation}
                      onChange={(e) => setNewVariation(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addVariation}
                      disabled={!newVariation.trim()}
                    >
                      Add
                    </Button>
                  </div>
                  {exercise.variations.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {exercise.variations.map((variation, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between rounded bg-muted p-2"
                        >
                          <span className="text-sm">{variation}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVariation(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Metrics Tab */}
            <TabsContent value="metrics" className="space-y-4 mt-2">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_bodyweight"
                    checked={exercise.is_bodyweight}
                    onCheckedChange={(checked) =>
                      setExercise({ ...exercise, is_bodyweight: checked as boolean })
                    }
                  />
                  <Label htmlFor="is_bodyweight">Bodyweight exercise</Label>
                </div>
                
                {exercise.is_bodyweight && (
                  <div>
                    <Label htmlFor="estimated_load_percent">Estimated Body Load (%)</Label>
                    <div className="flex items-center space-x-4">
                      <Slider
                        id="estimated_load_percent"
                        defaultValue={[exercise.estimated_load_percent || 65]}
                        min={10}
                        max={100}
                        step={5}
                        onValueChange={(value) =>
                          setExercise({ ...exercise, estimated_load_percent: value[0] })
                        }
                        className="flex-1"
                      />
                      <span className="w-16 text-center">
                        {exercise.estimated_load_percent || 65}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Percentage of bodyweight used in the exercise
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="loading_type">Loading Type</Label>
                  <Select
                    value={exercise.loading_type || (exercise.is_bodyweight ? 'bodyweight' : '')}
                    onValueChange={(value) =>
                      setExercise({ ...exercise, loading_type: value as LoadingType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select loading type" />
                    </SelectTrigger>
                    <SelectContent>
                      {LOADING_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    How resistance is applied in this exercise
                  </p>
                </div>

                <div>
                  <Label htmlFor="variant_category">Variant Category</Label>
                  <Select
                    value={exercise.variant_category || ''}
                    onValueChange={(value) =>
                      setExercise({ ...exercise, variant_category: value as VariantCategory })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select variant category" />
                    </SelectTrigger>
                    <SelectContent>
                      {VARIANT_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Helps with exercise progression tracking
                  </p>
                </div>

                <div>
                  <Label htmlFor="energy_cost_factor">Energy Cost Factor</Label>
                  <div className="flex items-center space-x-4">
                    <Slider
                      id="energy_cost_factor"
                      defaultValue={[exercise.energy_cost_factor || 1]}
                      min={0.5}
                      max={2}
                      step={0.1}
                      onValueChange={(value) =>
                        setExercise({ ...exercise, energy_cost_factor: value[0] })
                      }
                      className="flex-1"
                    />
                    <span className="w-16 text-center">
                      {exercise.energy_cost_factor || 1}x
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Relative energy expenditure compared to standard exercises
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Instructions Tab */}
            <TabsContent value="instructions" className="space-y-4 mt-2">
              <div className="space-y-4">
                <div>
                  <Label>Exercise Instructions</Label>
                  <Textarea
                    placeholder="Step-by-step instructions..."
                    className="min-h-[200px] mt-2"
                    value={exercise.instructions.steps || ""}
                    onChange={(e) =>
                      setExercise({
                        ...exercise,
                        instructions: {
                          ...exercise.instructions,
                          steps: e.target.value,
                        },
                      })
                    }
                  />
                </div>
                
                <div>
                  <Label>Form Cues</Label>
                  <Textarea
                    placeholder="Form cues and common mistakes to avoid..."
                    className="min-h-[100px] mt-2"
                    value={exercise.instructions.form || ""}
                    onChange={(e) =>
                      setExercise({
                        ...exercise,
                        instructions: {
                          ...exercise.instructions,
                          form: e.target.value,
                        },
                      })
                    }
                  />
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Enhanced error display */}
        {formError && (
          <div className="text-red-500 text-sm p-2 bg-red-50 rounded border border-red-200">
            {formError}
          </div>
        )}
        
        {validationErrors.length > 0 && (
          <div className="text-amber-600 text-xs">
            <div className="font-medium">Validation:</div>
            {validationErrors.map((error, index) => (
              <div key={index} className="ml-2">• {error}</div>
            ))}
          </div>
        )}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || validationErrors.length > 0}
            className="min-w-[100px]"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                <span>Saving...</span>
              </div>
            ) : (
              mode === "add" ? "Add Exercise" : "Update Exercise"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
