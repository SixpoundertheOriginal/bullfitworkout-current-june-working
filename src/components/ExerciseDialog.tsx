// src/components/workouts/ExerciseDialog.tsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
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

import {
  MuscleGroup,
  EquipmentType,
  MovementPattern,
  Difficulty,
  getMuscleGroupOptions,
  getEquipmentOptions,
  ensureMuscleGroupArray,
  ensureEquipmentTypeArray,
  formatDisplayName,
  MOVEMENT_PATTERNS,
  DIFFICULTY_LEVELS
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
  is_bodyweight: false,
  tips: [] as string[],
  variations: [] as string[],
  loading_type: undefined,
  estimated_load_percent: undefined,
  variant_category: undefined,
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

  const {
    formState: exercise,
    setFormState: setExercise,
    resetForm
  } = useSessionForm("addExerciseForm", DEFAULT_EXERCISE);

  type TabType = "basic" | "advanced" | "metrics" | "instructions";
  const [activeTab, setActiveTab] = useState<TabType>("basic");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (initialExercise) {
      setExercise({ ...DEFAULT_EXERCISE, ...initialExercise });
    } else if (!isAdd) {
      resetForm();
    }
    setFormError("");
  }, [initialExercise, isAdd, resetForm, setExercise]);

  const muscleGroupOptions = useMemo(() => getMuscleGroupOptions(), []);
  const equipmentOptions = useMemo(() => getEquipmentOptions(), []);

  const safePrimary = ensureMuscleGroupArray(exercise.primary_muscle_groups);
  const safeSecondary = ensureMuscleGroupArray(exercise.secondary_muscle_groups);
  const safeEquip = ensureEquipmentTypeArray(exercise.equipment_type);

  // Memoized handlers to keep MultiSelect props stable
  const onPrimaryChange = useCallback(
    (sel: MuscleGroup[]) =>
      setExercise(prev => ({ ...prev, primary_muscle_groups: sel })),
    [setExercise]
  );

  const onSecondaryChange = useCallback(
    (sel: MuscleGroup[]) =>
      setExercise(prev => ({ ...prev, secondary_muscle_groups: sel })),
    [setExercise]
  );

  const onEquipmentChange = useCallback(
    (sel: EquipmentType[]) =>
      setExercise(prev => ({ ...prev, equipment_type: sel })),
    [setExercise]
  );

  const handleSubmit = () => {
    if (!exercise.name.trim()) {
      setFormError("Name is required");
      return;
    }
    if (!safePrimary.length) {
      setFormError("Pick at least one primary muscle group");
      return;
    }
    if (!safeEquip.length) {
      setFormError("Pick at least one equipment type");
      return;
    }
    onSubmit(exercise);
    if (isAdd) resetForm();
  };

  const handleClose = () => {
    if (isAdd) resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[600px] max-h-[90vh] flex flex-col"
        aria-labelledby="exercise-dialog-title"
        aria-describedby="exercise-dialog-description"
      >
        <DialogHeader>
          <DialogTitle id="exercise-dialog-title" className="text-xl">
            {isAdd ? "Add Exercise" : "Edit Exercise"}
          </DialogTitle>
          <DialogDescription
            id="exercise-dialog-description"
            className="text-sm text-gray-500"
          >
            {isAdd
              ? "Fill in details to add a new exercise."
              : "Edit the exercise details below."}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v: string) => setActiveTab(v as TabType)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 overflow-auto mt-2 p-2 space-y-4">
            {/* BASIC */}
            <TabsContent value="basic">
              <div>
                <Label>Name*</Label>
                <Input
                  placeholder="e.g. Bench Press"
                  value={exercise.name}
                  onChange={e =>
                    setExercise(prev => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Brief description…"
                  value={exercise.description}
                  onChange={e =>
                    setExercise(prev => ({ ...prev, description: e.target.value }))
                  }
                  className="min-h-[100px]"
                />
              </div>
              <div>
                <Label>Primary Muscle Groups*</Label>
                <MultiSelect
                  options={muscleGroupOptions}
                  selected={safePrimary}
                  onChange={onPrimaryChange}
                  placeholder="Select primary muscle groups"
                />
              </div>
              <div>
                <Label>Secondary Muscle Groups</Label>
                <MultiSelect
                  options={muscleGroupOptions}
                  selected={safeSecondary}
                  onChange={onSecondaryChange}
                  placeholder="Select secondary muscle groups"
                />
              </div>
              <div>
                <Label>Equipment Type*</Label>
                <MultiSelect
                  options={equipmentOptions}
                  selected={safeEquip}
                  onChange={onEquipmentChange}
                  placeholder="Select equipment types"
                />
              </div>
            </TabsContent>

            {/* ADVANCED */}
            <TabsContent value="advanced">
              <div>
                <Label>Difficulty</Label>
                <Select
                  value={exercise.difficulty}
                  onValueChange={v =>
                    setExercise(prev => ({ ...prev, difficulty: v as Difficulty }))
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
                <Label>Movement Pattern</Label>
                <Select
                  value={exercise.movement_pattern}
                  onValueChange={v =>
                    setExercise(prev => ({ ...prev, movement_pattern: v as MovementPattern }))
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
              <div className="flex items-center">
                <Checkbox
                  checked={exercise.is_compound}
                  onCheckedChange={c =>
                    setExercise(prev => ({ ...prev, is_compound: c as boolean }))
                  }
                />
                <Label className="ml-2">Compound exercise</Label>
              </div>
            </TabsContent>

            {/* METRICS */}
            <TabsContent value="metrics">
              <div className="flex items-center">
                <Checkbox
                  checked={exercise.is_bodyweight}
                  onCheckedChange={c =>
                    setExercise(prev => ({ ...prev, is_bodyweight: c as boolean }))
                  }
                />
                <Label className="ml-2">Bodyweight exercise</Label>
              </div>
              {/* …you can add Sets/Reps/Rest inputs here… */}
            </TabsContent>

            {/* INSTRUCTIONS */}
            <TabsContent value="instructions">
              <div>
                <Label>Instructions</Label>
                <Textarea
                  placeholder="Step-by-step instructions…"
                  value={exercise.instructions.steps}
                  onChange={e =>
                    setExercise(prev => ({
                      ...prev,
                      instructions: {
                        ...prev.instructions,
                        steps: e.target.value
                      }
                    }))
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
                    setExercise(prev => ({
                      ...prev,
                      instructions: {
                        ...prev.instructions,
                        form: e.target.value
                      }
                    }))
                  }
                  className="min-h-[100px]"
                />
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {formError && (
          <p className="mt-2 text-sm text-red-600">{formError}</p>
        )}

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
