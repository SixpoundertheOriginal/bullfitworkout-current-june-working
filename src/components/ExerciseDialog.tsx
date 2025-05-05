
// src/components/workouts/ExerciseDialog.tsx

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { MultiSelect } from "@/components/MultiSelect";
import { useSessionForm } from "@/hooks/useSessionState";

// Import from canonical source
import {
  MuscleGroup,
  EquipmentType,
  MovementPattern,
  Difficulty,
  MUSCLE_GROUPS,
  EQUIPMENT_TYPES,
  MOVEMENT_PATTERNS,
  DIFFICULTY_LEVELS,
  getMuscleGroupOptions,
  getEquipmentOptions,
  formatDisplayName
} from "@/constants/exerciseMetadata";

const DEFAULT_EXERCISE = {
  name: "",
  description: "",
  primary_muscle_groups: [] as MuscleGroup[],
  secondary_muscle_groups: [] as MuscleGroup[],
  equipment_type: [] as EquipmentType[],
  movement_pattern: "push" as MovementPattern,
  difficulty: "beginner" as Difficulty,
  instructions: { steps: "", form: "" },
  is_compound: false,
  tips: [] as string[],
  variations: [] as string[],
  loading_type: undefined,
  estimated_load_percent: undefined,
  variant_category: undefined,
  is_bodyweight: false,
  energy_cost_factor: 1
};

interface ExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  onSubmit: (ex: typeof DEFAULT_EXERCISE) => void;
  initialExercise?: Partial<typeof DEFAULT_EXERCISE>;
  loading?: boolean;
}

export function ExerciseDialog({
  open,
  onOpenChange,
  mode = "add",
  onSubmit,
  initialExercise,
  loading = false
}: ExerciseDialogProps) {
  const isAdd = mode === "add";

  // Persist form fields across reloads/tabs, but NOT the modal open-state
  const {
    formState: exercise,
    setFormState: setExercise,
    resetForm
  } = useSessionForm("addExerciseForm", DEFAULT_EXERCISE);

  // Define the valid tab types to fix the type error
  type TabType = "basic" | "advanced" | "metrics" | "instructions";
  
  const [activeTab, setActiveTab] = useState<TabType>("basic");
  const [formError, setFormError] = useState("");

  // On mount or when initialExercise changes, seed or reset the form
  useEffect(() => {
    if (initialExercise) {
      setExercise({ ...DEFAULT_EXERCISE, ...initialExercise });
    } else if (mode === "edit") {
      resetForm();
    }
    setFormError("");
  }, [initialExercise, mode, resetForm, setExercise]);

  const handleSubmit = () => {
    if (!exercise.name.trim()) {
      setFormError("Name is required");
      return;
    }
    if (!exercise.primary_muscle_groups.length) {
      setFormError("Pick at least one primary muscle group");
      return;
    }
    if (!exercise.equipment_type.length) {
      setFormError("Pick at least one equipment type");
      return;
    }

    onSubmit(exercise);

    if (isAdd) {
      resetForm();
    }
  };

  const handleClose = () => {
    if (isAdd) {
      resetForm();
    }
    onOpenChange(false);
  };

  // Generate options for MultiSelect components
  const muscleGroupOptions = getMuscleGroupOptions();
  const equipmentOptions = getEquipmentOptions();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[600px] max-h-[90vh] flex flex-col"
        aria-labelledby="exercise-dialog-title"
        aria-describedby="exercise-dialog-description"
      >
        <DialogHeader>
          <DialogTitle id="exercise-dialog-title" className="text-xl">
            {mode === "add" ? "Add Exercise" : "Edit Exercise"}
          </DialogTitle>
          <DialogDescription
            id="exercise-dialog-description"
            className="sr-only"
          >
            {mode === "add"
              ? "Fill in details to add a new exercise."
              : "Edit the exercise details."}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value: TabType) => setActiveTab(value)}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 overflow-auto">
            {/* BASIC */}
            <TabsContent value="basic" className="space-y-4 mt-2">
              <div>
                <Label>Name*</Label>
                <Input
                  placeholder="e.g. Bench Press"
                  value={exercise.name}
                  onChange={e =>
                    setExercise({ ...exercise, name: e.target.value })
                  }
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Brief description…"
                  value={exercise.description}
                  onChange={e =>
                    setExercise({ ...exercise, description: e.target.value })
                  }
                  className="min-h-[100px]"
                />
              </div>
              <div>
                <Label>Primary Muscle Groups*</Label>
                <MultiSelect
                  options={muscleGroupOptions}
                  selected={exercise.primary_muscle_groups}
                  onChange={sel =>
                    setExercise({
                      ...exercise,
                      primary_muscle_groups: sel as MuscleGroup[]
                    })
                  }
                  placeholder="Select primary muscle groups"
                />
              </div>
              <div>
                <Label>Secondary Muscle Groups</Label>
                <MultiSelect
                  options={muscleGroupOptions}
                  selected={exercise.secondary_muscle_groups}
                  onChange={sel =>
                    setExercise({
                      ...exercise,
                      secondary_muscle_groups: sel as MuscleGroup[]
                    })
                  }
                  placeholder="Select secondary muscle groups"
                />
              </div>
              <div>
                <Label>Equipment Type*</Label>
                <MultiSelect
                  options={equipmentOptions}
                  selected={exercise.equipment_type}
                  onChange={sel =>
                    setExercise({
                      ...exercise,
                      equipment_type: sel as EquipmentType[]
                    })
                  }
                  placeholder="Select equipment types"
                />
              </div>
            </TabsContent>

            {/* ADVANCED */}
            <TabsContent value="advanced" className="space-y-4 mt-2">
              <div>
                <Label>Difficulty</Label>
                <Select
                  value={exercise.difficulty}
                  onValueChange={v =>
                    setExercise({ ...exercise, difficulty: v as Difficulty })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_LEVELS.map(lvl => (
                      <SelectItem key={lvl} value={lvl}>
                        {formatDisplayName(lvl)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Movement</Label>
                <Select
                  value={exercise.movement_pattern}
                  onValueChange={v =>
                    setExercise({
                      ...exercise,
                      movement_pattern: v as MovementPattern
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select movement" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOVEMENT_PATTERNS.map(m => (
                      <SelectItem key={m} value={m}>
                        {formatDisplayName(m)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={exercise.is_compound}
                  onCheckedChange={c =>
                    setExercise({ ...exercise, is_compound: c as boolean })
                  }
                />
                <Label>Compound exercise</Label>
              </div>
            </TabsContent>

            {/* METRICS */}
            <TabsContent value="metrics" className="space-y-4 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={exercise.is_bodyweight}
                  onCheckedChange={c =>
                    setExercise({ ...exercise, is_bodyweight: c as boolean })
                  }
                />
                <Label>Bodyweight exercise</Label>
              </div>
              {/* …additional metrics fields… */}
            </TabsContent>

            {/* INSTRUCTIONS */}
            <TabsContent value="instructions" className="space-y-4 mt-2">
              <div>
                <Label>Instructions</Label>
                <Textarea
                  placeholder="Step-by-step instructions…"
                  value={exercise.instructions.steps}
                  onChange={e =>
                    setExercise({
                      ...exercise,
                      instructions: { ...exercise.instructions, steps: e.target.value }
                    })
                  }
                  className="min-h-[100px]"
                />
              </div>
              <div>
                <Label>Form Cues</Label>
                <Textarea
                  placeholder="Form cues…"
                  value={exercise.instructions.form}
                  onChange={e =>
                    setExercise({
                      ...exercise,
                      instructions: { ...exercise.instructions, form: e.target.value }
                    })
                  }
                  className="min-h-[100px]"
                />
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {formError && <p className="text-red-500 mt-2">{formError}</p>}

        <DialogFooter className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving…" : isAdd ? "Add Exercise" : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
