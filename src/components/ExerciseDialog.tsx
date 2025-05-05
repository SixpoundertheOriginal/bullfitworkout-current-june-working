// src/components/workouts/ExerciseDialog.tsx

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
import { MultiSelect } from "@/components/MultiSelect";
import { useSessionState, useSessionForm } from "@/hooks/useSessionState";
import {
  MuscleGroup,
  EquipmentType,
  MovementPattern,
  Difficulty,
  COMMON_MUSCLE_GROUPS,
  COMMON_EQUIPMENT,
  MOVEMENT_PATTERNS,
  DIFFICULTY_LEVELS,
  LOADING_TYPES,
  VARIANT_CATEGORIES,
  LoadingType,
  VariantCategory
} from "@/types/exercise";

interface ExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  onSubmit: (exercise: any) => void;
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
  instructions: { steps: "", form: "" },
  is_compound: false,
  tips: [] as string[],
  variations: [] as string[],
  metadata: {},
  loading_type: undefined as LoadingType | undefined,
  estimated_load_percent: undefined as number | undefined,
  variant_category: undefined as VariantCategory | undefined,
  is_bodyweight: false,
  energy_cost_factor: 1
};

export function ExerciseDialog({
  open,
  onOpenChange,
  mode = "add",
  onSubmit,
  initialExercise,
  loading = false
}: ExerciseDialogProps) {
  const isAddMode = mode === "add";
  // session storage for open state
  const [persistedOpen, setPersistedOpen] = useSessionState<boolean>(
    "addExerciseOpen",
    false
  );
  // local tab state (no longer using useSessionState here)
  const [activeTab, setActiveTab] = useSessionState<string>(
    "addExerciseActiveTab",
    "basic"
  );
  // session‐persisted form
  const {
    formState: exercise,
    setFormState: setExercise,
    resetForm: resetExerciseForm
  } = useSessionForm("addExerciseForm", DEFAULT_EXERCISE);

  const [newTip, setNewTip] = useState("");
  const [newVariation, setNewVariation] = useState("");
  const [formError, setFormError] = useState("");

  // sync parent→persisted
  useEffect(() => {
    if (isAddMode) setPersistedOpen(open);
  }, [open, isAddMode, setPersistedOpen]);

  // sync persisted→parent
  useEffect(() => {
    if (isAddMode && persistedOpen !== open) {
      onOpenChange(persistedOpen);
    }
  }, [persistedOpen, open, onOpenChange, isAddMode]);

  // reset or initialize form
  useEffect(() => {
    if (initialExercise) {
      setExercise({
        ...DEFAULT_EXERCISE,
        ...initialExercise
      });
    } else if (mode === "edit") {
      resetExerciseForm();
    }
    setFormError("");
  }, [initialExercise, mode, resetExerciseForm, setExercise]);

  const handleSubmit = () => {
    if (!exercise.name) {
      setFormError("Exercise name is required");
      return;
    }
    if (!exercise.primary_muscle_groups.length) {
      setFormError("Select at least one primary muscle group");
      return;
    }
    if (!exercise.equipment_type.length) {
      setFormError("Select at least one equipment type");
      return;
    }
    onSubmit(exercise);
    if (isAddMode) {
      resetExerciseForm();
      setPersistedOpen(false);
      sessionStorage.removeItem("addExerciseActiveTab");
    }
  };

  const handleClose = () => {
    if (isAddMode) {
      resetExerciseForm();
      setPersistedOpen(false);
      sessionStorage.removeItem("addExerciseActiveTab");
    }
    onOpenChange(false);
  };

  // prevent outside clicks from closing dialog when interacting with selects
  const onPointerDownOutside = (e: React.PointerEvent) => {
    // you _could_ whitelist scrim clicks here, or just blanket-prevent:
    e.preventDefault();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-[600px] max-h-[90vh] flex flex-col"
        aria-labelledby="exercise-dialog-title"
        aria-describedby="exercise-dialog-description"
        onPointerDownOutside={onPointerDownOutside}
      >
        <DialogHeader>
          <DialogTitle id="exercise-dialog-title" className="text-xl">
            {mode === "add" ? "Add Exercise" : "Edit Exercise"}
          </DialogTitle>
          <DialogDescription id="exercise-dialog-description" className="sr-only">
            {mode === "add"
              ? "Fill in the exercise details to add a new exercise."
              : "Modify the details of this exercise."}
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 overflow-hidden flex flex-col"
        >
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 overflow-auto">
            {/* ─── BASIC ───────────────────────────────────────────────────────── */}
            <TabsContent value="basic" className="space-y-4 mt-2">
              {/* Name & Description */}
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
                    placeholder="Brief description..."
                    value={exercise.description}
                    onChange={(e) =>
                      setExercise({ ...exercise, description: e.target.value })
                    }
                    className="min-h-[100px]"
                  />
                </div>
              </div>

              {/* PRIMARY */}
              <div>
                <Label>Primary Muscle Groups*</Label>
                <div
                  className="mt-1"
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                >
                  <MultiSelect
                    options={COMMON_MUSCLE_GROUPS.map((g) => ({ label: g, value: g }))}
                    selected={exercise.primary_muscle_groups}
                    onChange={(sel) =>
                      setExercise({
                        ...exercise,
                        primary_muscle_groups: sel as MuscleGroup[]
                      })
                    }
                    placeholder="Select primary muscle groups"
                  />
                </div>
              </div>

              {/* SECONDARY */}
              <div>
                <Label>Secondary Muscle Groups</Label>
                <div
                  className="mt-1"
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                >
                  <MultiSelect
                    options={COMMON_MUSCLE_GROUPS.map((g) => ({ label: g, value: g }))}
                    selected={exercise.secondary_muscle_groups}
                    onChange={(sel) =>
                      setExercise({
                        ...exercise,
                        secondary_muscle_groups: sel as MuscleGroup[]
                      })
                    }
                    placeholder="Select secondary muscle groups"
                  />
                </div>
              </div>

              {/* EQUIPMENT */}
              <div>
                <Label>Equipment Type*</Label>
                <div
                  className="mt-1"
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                >
                  <MultiSelect
                    options={COMMON_EQUIPMENT.map((e) => ({ label: e, value: e }))}
                    selected={exercise.equipment_type}
                    onChange={(sel) =>
                      setExercise({
                        ...exercise,
                        equipment_type: sel as EquipmentType[]
                      })
                    }
                    placeholder="Select equipment types"
                  />
                </div>
              </div>
            </TabsContent>

            {/* ─── ADVANCED ─────────────────────────────────────────────────────── */}
            <TabsContent value="advanced" className="space-y-4 mt-2">
              {/* Difficulty */}
              <div>
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select
                  value={exercise.difficulty}
                  onValueChange={(v) =>
                    setExercise({ ...exercise, difficulty: v as Difficulty })
                  }
                >
                  <SelectTrigger onMouseDown={(e) => e.stopPropagation()}>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent onMouseDown={(e) => e.stopPropagation()}>
                    {DIFFICULTY_LEVELS.map((lvl) => (
                      <SelectItem key={lvl} value={lvl}>
                        {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Movement Pattern */}
              <div>
                <Label htmlFor="movement">Movement Pattern</Label>
                <Select
                  value={exercise.movement_pattern}
                  onValueChange={(v) =>
                    setExercise({ ...exercise, movement_pattern: v as MovementPattern })
                  }
                >
                  <SelectTrigger onMouseDown={(e) => e.stopPropagation()}>
                    <SelectValue placeholder="Select movement" />
                  </SelectTrigger>
                  <SelectContent onMouseDown={(e) => e.stopPropagation()}>
                    {MOVEMENT_PATTERNS.map((pat) => (
                      <SelectItem key={pat} value={pat}>
                        {pat.charAt(0).toUpperCase() + pat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_compound"
                  checked={exercise.is_compound}
                  onCheckedChange={(ch) =>
                    setExercise({ ...exercise, is_compound: ch as boolean })
                  }
                />
                <Label htmlFor="is_compound">Compound Exercise</Label>
              </div>
              <Separator />
              {/* Tips & Variations… (unchanged) */}
            </TabsContent>

            {/* ─── METRICS ──────────────────────────────────────────────────────── */}
            <TabsContent value="metrics" className="space-y-4 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_bodyweight"
                  checked={exercise.is_bodyweight}
                  onCheckedChange={(ch) =>
                    setExercise({ ...exercise, is_bodyweight: ch as boolean })
                  }
                />
                <Label htmlFor="is_bodyweight">Bodyweight exercise</Label>
              </div>
              {/* …and the rest of your sliders/selects with the same stopPropagation on triggers */}
            </TabsContent>

            {/* ─── INSTRUCTIONS ───────────────────────────────────────────────── */}
            <TabsContent value="instructions" className="space-y-4 mt-2">
              <div>
                <Label>Instructions</Label>
                <Textarea
                  placeholder="Step-by-step…"
                  value={exercise.instructions.steps}
                  onChange={(e) =>
                    setExercise({
                      ...exercise,
                      instructions: { ...exercise.instructions, steps: e.target.value }
                    })
                  }
                />
              </div>
              <div>
                <Label>Form Cues</Label>
                <Textarea
                  placeholder="Form cues…"
                  value={exercise.instructions.form}
                  onChange={(e) =>
                    setExercise({
                      ...exercise,
                      instructions: { ...exercise.instructions, form: e.target.value }
                    })
                  }
                />
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {formError && <p className="text-red-400">{formError}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving…" : mode === "add" ? "Add Exercise" : "Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
