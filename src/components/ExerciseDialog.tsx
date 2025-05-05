
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
import { useSessionState, useSessionForm } from "@/hooks/useSessionState";

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

const DEFAULT_EXERCISE = {
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
};

export function ExerciseDialog({
  open,
  onOpenChange,
  mode = "add",
  onSubmit,
  initialExercise,
  loading = false,
}: ExerciseDialogProps) {
  // Fixed IDs for ARIA attributes
  const dialogTitleId = "exercise-dialog-title";
  const dialogDescId = "exercise-dialog-description";

  // Use session storage for the dialog state (only for "add" mode)
  const isAddMode = mode === "add";
  const [persistedOpen, setPersistedOpen] = useSessionState<boolean>("addExerciseOpen", false);
  const [activeTab, setActiveTab] = useSessionState<string>("addExerciseActiveTab", "basic");
  
  // Use session storage for form state when in "add" mode
  const {
    formState: exercise,
    setFormState: setExercise,
    resetForm: resetExerciseForm
  } = useSessionForm(
    "addExerciseForm", 
    DEFAULT_EXERCISE
  );

  const [newTip, setNewTip] = useState("");
  const [newVariation, setNewVariation] = useState("");
  const [formError, setFormError] = useState("");

  // Sync external open state with persisted state (for "add" mode only)
  useEffect(() => {
    if (isAddMode) {
      setPersistedOpen(open);
    }
  }, [open, isAddMode, setPersistedOpen]);

  // Update component's open state from persisted state (for "add" mode only)
  useEffect(() => {
    if (isAddMode && persistedOpen !== open) {
      onOpenChange(persistedOpen);
    }
  }, [persistedOpen, open, onOpenChange, isAddMode]);

  // Reset form when dialog opens/closes or when initialExercise changes - use setTimeout to debounce
  useEffect(() => {
    if (initialExercise) {
      // Debounce setting form data to avoid blocking the initial render
      const timeout = setTimeout(() => {
        setExercise({
          ...initialExercise,
          loading_type: initialExercise.loading_type || undefined,
          estimated_load_percent: initialExercise.estimated_load_percent,
          variant_category: initialExercise.variant_category || undefined,
          is_bodyweight: initialExercise.is_bodyweight || false,
          energy_cost_factor: initialExercise.energy_cost_factor || 1,
        });
      }, 0);
      
      return () => clearTimeout(timeout);
    } else if (mode === "edit") {
      setExercise(DEFAULT_EXERCISE);
    }
    // Note: For "add" mode, we keep the form state from sessionStorage
    
    setFormError("");
  }, [initialExercise, open, setExercise, mode]);

  // Update whether the exercise is bodyweight based on equipment type
  useEffect(() => {
    if (exercise.equipment_type.includes('bodyweight')) {
      setExercise(prev => ({ ...prev, is_bodyweight: true }));
    }
  }, [exercise.equipment_type, setExercise]);

  // Add a tip to the exercise
  const addTip = () => {
    if (newTip.trim()) {
      setExercise({
        ...exercise,
        tips: [...exercise.tips, newTip.trim()],
      });
      setNewTip("");
    }
  };

  // Remove a tip from the exercise
  const removeTip = (index: number) => {
    setExercise({
      ...exercise,
      tips: exercise.tips.filter((_, i) => i !== index),
    });
  };

  // Add a variation to the exercise
  const addVariation = () => {
    if (newVariation.trim()) {
      setExercise({
        ...exercise,
        variations: [...exercise.variations, newVariation.trim()],
      });
      setNewVariation("");
    }
  };

  // Remove a variation from the exercise
  const removeVariation = (index: number) => {
    setExercise({
      ...exercise,
      variations: exercise.variations.filter((_, i) => i !== index),
    });
  };

  // Handle form submission
  const handleSubmit = () => {
    // Validate form
    if (!exercise.name) {
      setFormError("Exercise name is required");
      return;
    }

    if (exercise.primary_muscle_groups.length === 0) {
      setFormError("At least one primary muscle group is required");
      return;
    }

    if (exercise.equipment_type.length === 0) {
      setFormError("At least one equipment type is required");
      return;
    }

    // Check if the exercise is bodyweight and set appropriate loading_type if needed
    const updatedExercise = { ...exercise };
    if (exercise.is_bodyweight && !exercise.loading_type) {
      updatedExercise.loading_type = 'bodyweight';
    }

    // Submit the exercise
    onSubmit(updatedExercise);
    
    // Clear form if in "add" mode
    if (isAddMode) {
      resetExerciseForm();
      setPersistedOpen(false);
      sessionStorage.removeItem("addExerciseActiveTab");
    }
  };

  // Handle dialog close
  const handleClose = () => {
    if (isAddMode) {
      // Clear form data on cancel when in "add" mode
      resetExerciseForm();
      setPersistedOpen(false);
      sessionStorage.removeItem("addExerciseActiveTab");
    }
    
    onOpenChange(false);
  };

  // Setup beforeunload warning for unsaved changes
  useEffect(() => {
    // Only add warning if dialog is open and in "add" mode
    if (open && isAddMode && (exercise.name || exercise.primary_muscle_groups.length > 0)) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        const message = "You have unsaved changes. Are you sure you want to leave?";
        e.preventDefault();
        e.returnValue = message;
        return message;
      };
      
      window.addEventListener('beforeunload', handleBeforeUnload);
      
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [open, exercise, isAddMode]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col"
        aria-labelledby={dialogTitleId}
        aria-describedby={dialogDescId}
      >
        <DialogHeader>
          <DialogTitle id={dialogTitleId} className="text-xl">
            {mode === "add" ? "Add Exercise" : "Edit Exercise"}
          </DialogTitle>
          <DialogDescription id={dialogDescId} className="sr-only">
            {mode === "add" 
              ? "Fill in the exercise details to add a new exercise to your library." 
              : "Edit the details of this exercise."}
          </DialogDescription>
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

        {formError && <p className="text-red-500 text-sm">{formError}</p>}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : mode === "add" ? "Add Exercise" : "Update Exercise"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
