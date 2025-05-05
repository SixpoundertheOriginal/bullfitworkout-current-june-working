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
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MultiSelect } from "@/components/MultiSelect";
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
import { useSessionState, useSessionForm } from "@/hooks/useSessionState";

interface ExerciseDialogProps {
  open: boolean;                                   // for edit mode
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
  energy_cost_factor: 1,
};

export function ExerciseDialog({
  open: externalOpen,
  onOpenChange,
  mode = "add",
  onSubmit,
  initialExercise,
  loading = false,
}: ExerciseDialogProps) {
  const isAddMode = mode === "add";

  // Generate unique IDs for ARIA attributes
  const dialogTitleId = React.useId();
  const dialogDescriptionId = React.useId();

  // single source of truth for open state:
  const [sessionOpen, setSessionOpen] = useSessionState<boolean>("addExerciseOpen", false);
  const isOpen = isAddMode ? sessionOpen : externalOpen;

  // form state (persists only in add mode)
  const {
    formState: exercise,
    setFormState: setExercise,
    resetForm: resetExerciseForm
  } = useSessionForm("addExerciseForm", DEFAULT_EXERCISE);

  const [activeTab, setActiveTab] = useSessionState<string>("addExerciseActiveTab", "basic");
  const [newTip, setNewTip] = useState("");
  const [newVariation, setNewVariation] = useState("");
  const [formError, setFormError] = useState("");

  // Sync external open → session (only for add mode)
  useEffect(() => {
    if (isAddMode && externalOpen !== sessionOpen) {
      setSessionOpen(externalOpen);
    }
  }, [externalOpen, isAddMode, sessionOpen, setSessionOpen]);

  // Reset or hydrate form when opening
  useEffect(() => {
    if (initialExercise && mode === "edit") {
      // Use setTimeout to debounce initialization to prevent blocking render
      const timerId = setTimeout(() => {
        setExercise({
          ...DEFAULT_EXERCISE,
          ...initialExercise,
          // Ensure these are never undefined by providing fallbacks
          primary_muscle_groups: initialExercise.primary_muscle_groups || [],
          secondary_muscle_groups: initialExercise.secondary_muscle_groups || [],
          equipment_type: initialExercise.equipment_type || [],
          tips: initialExercise.tips || [],
          variations: initialExercise.variations || [],
          loading_type: initialExercise.loading_type,
          estimated_load_percent: initialExercise.estimated_load_percent,
          variant_category: initialExercise.variant_category,
          is_bodyweight: initialExercise.is_bodyweight,
          energy_cost_factor: initialExercise.energy_cost_factor,
        });
      }, 0);
      
      return () => clearTimeout(timerId);
    } else if (!isAddMode) {
      resetExerciseForm();
    }
    setFormError("");
  }, [initialExercise, isOpen, mode, isAddMode, setExercise, resetExerciseForm]);

  // Keep bodyweight flag in sync
  useEffect(() => {
    const equipmentTypes = exercise.equipment_type || [];
    if (Array.isArray(equipmentTypes) && equipmentTypes.includes("bodyweight")) {
      setExercise(prev => ({ ...prev, is_bodyweight: true }));
    }
  }, [exercise.equipment_type, setExercise]);

  const handleSubmit = () => {
    if (!exercise.name) return setFormError("Exercise name is required");
    
    // Ensure we have arrays, not undefined values
    const primaryMuscleGroups = Array.isArray(exercise.primary_muscle_groups) ? exercise.primary_muscle_groups : [];
    if (!primaryMuscleGroups.length) return setFormError("Select at least one primary muscle group");
    
    const equipmentType = Array.isArray(exercise.equipment_type) ? exercise.equipment_type : [];
    if (!equipmentType.length) return setFormError("Select at least one equipment type");

    const toSubmit = { 
      ...exercise,
      // Ensure all array properties are properly initialized
      primary_muscle_groups: primaryMuscleGroups,
      secondary_muscle_groups: Array.isArray(exercise.secondary_muscle_groups) ? exercise.secondary_muscle_groups : [],
      equipment_type: equipmentType,
      tips: Array.isArray(exercise.tips) ? exercise.tips : [],
      variations: Array.isArray(exercise.variations) ? exercise.variations : [],
    };
    
    if (toSubmit.is_bodyweight && !toSubmit.loading_type) {
      toSubmit.loading_type = "bodyweight";
    }

    onSubmit(toSubmit);
    if (isAddMode) {
      resetExerciseForm();
      setSessionOpen(false);
      sessionStorage.removeItem("addExerciseActiveTab");
      sessionStorage.removeItem("addExerciseForm");
    }
    onOpenChange(false);
  };

  const handleClose = () => {
    if (isAddMode) {
      resetExerciseForm();
      setSessionOpen(false);
      sessionStorage.removeItem("addExerciseActiveTab");
      sessionStorage.removeItem("addExerciseForm");
    }
    onOpenChange(false);
  };

  // Unsaved changes warning
  useEffect(() => {
    if (isOpen && isAddMode && (exercise.name || (Array.isArray(exercise.primary_muscle_groups) && exercise.primary_muscle_groups.length > 0))) {
      const warn = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        return (e.returnValue = "You have unsaved changes. Leave anyway?");
      };
      window.addEventListener("beforeunload", warn);
      return () => window.removeEventListener("beforeunload", warn);
    }
  }, [isOpen, exercise, isAddMode]);

  // Debounce any heavy initialization on dialog open to prevent flicker
  useEffect(() => {
    // This effect is just for debouncing heavy operations on open
    if (isOpen) {
      // Use setTimeout to delay heavy operations
      const timer = setTimeout(() => {
        // Any heavy initialization can go here
        console.log("Dialog fully initialized");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent 
        className="sm:max-w-[600px] max-h-[90vh] flex flex-col overflow-hidden"
        aria-labelledby={dialogTitleId}
        aria-describedby={dialogDescriptionId}
      >
        <DialogHeader>
          <DialogTitle id={dialogTitleId}>{mode === "add" ? "Add Exercise" : "Edit Exercise"}</DialogTitle>
          <DialogDescription id={dialogDescriptionId} className="sr-only">
            {mode === "add"
              ? "Fill in the details to add a new exercise."
              : "Modify the details of this exercise."}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 overflow-auto">
            {/* Basic Tab */}
            <TabsContent value="basic" className="p-4 space-y-4">
              <div>
                <Label htmlFor="name">Exercise Name*</Label>
                <Input id="name" placeholder="e.g. Bench Press"
                  value={exercise.name || ""}
                  onChange={e => setExercise({ ...exercise, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="..." 
                  value={exercise.description || ""}
                  onChange={e => setExercise({ ...exercise, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Primary Muscle Groups*</Label>
                <MultiSelect
                  options={COMMON_MUSCLE_GROUPS.map(g => ({ label: g, value: g }))}
                  selected={Array.isArray(exercise.primary_muscle_groups) ? exercise.primary_muscle_groups : []}
                  onChange={sel => setExercise({ ...exercise, primary_muscle_groups: sel as MuscleGroup[] })}
                  placeholder="Select..."
                />
              </div>
              <div>
                <Label>Secondary Muscle Groups</Label>
                <MultiSelect
                  options={COMMON_MUSCLE_GROUPS.map(g => ({ label: g, value: g }))}
                  selected={Array.isArray(exercise.secondary_muscle_groups) ? exercise.secondary_muscle_groups : []}
                  onChange={sel => setExercise({ ...exercise, secondary_muscle_groups: sel as MuscleGroup[] })}
                  placeholder="Select..."
                />
              </div>
              <div>
                <Label>Equipment Type*</Label>
                <MultiSelect
                  options={COMMON_EQUIPMENT.map(e => ({ label: e, value: e }))}
                  selected={Array.isArray(exercise.equipment_type) ? exercise.equipment_type : []}
                  onChange={sel => setExercise({ ...exercise, equipment_type: sel as EquipmentType[] })}
                  placeholder="Select..."
                />
              </div>
            </TabsContent>

            {/* Advanced Tab */}
            <TabsContent value="advanced" className="p-4 space-y-4">
              <div>
                <Label>Difficulty Level</Label>
                <Select value={exercise.difficulty} onValueChange={v => setExercise({ ...exercise, difficulty: v as Difficulty })}>
                  <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                  <SelectContent>{DIFFICULTY_LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Movement Pattern</Label>
                <Select value={exercise.movement_pattern} onValueChange={v => setExercise({ ...exercise, movement_pattern: v as MovementPattern })}>
                  <SelectTrigger><SelectValue placeholder="Select pattern" /></SelectTrigger>
                  <SelectContent>{MOVEMENT_PATTERNS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  checked={exercise.is_compound || false}
                  onCheckedChange={c => setExercise({ ...exercise, is_compound: c as boolean })}
                /><Label>Compound</Label>
              </div>
              <Separator />
              <div>
                <Label>Tips</Label>
                <div className="flex space-x-2">
                  <Input placeholder="Add tip..." value={newTip} onChange={e => setNewTip(e.target.value)} />
                  <Button variant="outline" onClick={() => {
                    if (newTip.trim()) {
                      const currentTips = Array.isArray(exercise.tips) ? exercise.tips : [];
                      setExercise({ 
                        ...exercise, 
                        tips: [...currentTips, newTip.trim()] 
                      });
                      setNewTip("");
                    }
                  }}>Add</Button>
                </div>
                <div className="space-y-2 mt-2">
                  {(Array.isArray(exercise.tips) ? exercise.tips : []).map((t, i) => (
                    <div key={i} className="flex justify-between bg-muted p-2 rounded">
                      <span>{t}</span>
                      <Button variant="ghost" size="sm" onClick={() => {
                        const currentTips = Array.isArray(exercise.tips) ? exercise.tips : [];
                        setExercise({
                          ...exercise,
                          tips: currentTips.filter((_, idx) => idx !== i)
                        });
                      }}>Remove</Button>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label>Variations</Label>
                <div className="flex space-x-2">
                  <Input placeholder="Add variation..." value={newVariation} onChange={e => setNewVariation(e.target.value)} />
                  <Button variant="outline" onClick={() => {
                    if (newVariation.trim()) {
                      const currentVariations = Array.isArray(exercise.variations) ? exercise.variations : [];
                      setExercise({ 
                        ...exercise, 
                        variations: [...currentVariations, newVariation.trim()] 
                      });
                      setNewVariation("");
                    }
                  }}>Add</Button>
                </div>
                <div className="space-y-2 mt-2">
                  {(Array.isArray(exercise.variations) ? exercise.variations : []).map((v, i) => (
                    <div key={i} className="flex justify-between bg-muted p-2 rounded">
                      <span>{v}</span>
                      <Button variant="ghost" size="sm" onClick={() => {
                        const currentVariations = Array.isArray(exercise.variations) ? exercise.variations : [];
                        setExercise({
                          ...exercise,
                          variations: currentVariations.filter((_, idx) => idx !== i)
                        });
                      }}>Remove</Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* Metrics & Instructions tabs */}
            <TabsContent value="metrics" className="p-4 space-y-4">
              
            </TabsContent>
            
            <TabsContent value="instructions" className="p-4 space-y-4">
              
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {formError && <p className="text-red-500 mt-2">{formError}</p>}

        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>{loading ? "Saving..." : mode === "add" ? "Add Exercise" : "Update Exercise"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
