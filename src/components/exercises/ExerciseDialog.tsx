
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Exercise } from "@/types/exercise";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/MultiSelect";
import { 
  MuscleGroup, 
  EquipmentType, 
  MovementPattern, 
  Difficulty,
  MUSCLE_GROUPS,
  EQUIPMENT_TYPES,
  MOVEMENT_PATTERNS,
  DIFFICULTY_LEVELS,
  formatDisplayName
} from "@/constants/exerciseMetadata";
import { useMultiSelectField } from "@/hooks/useMultiSelectField";

interface ExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (exercise: any) => Promise<void>;
  initialExercise?: Exercise;
  loading: boolean;
  mode: "add" | "edit";
}

function ExerciseDialogComponent({
  open,
  onOpenChange,
  onSubmit,
  initialExercise,
  loading,
  mode
}: ExerciseDialogProps) {
  const [activeTab, setActiveTab] = useState<string>("basic");
  const [formError, setFormError] = useState<string>("");

  // Form state
  const [exercise, setExercise] = useState<{
    name: string;
    description: string;
    primary_muscle_groups: MuscleGroup[];
    secondary_muscle_groups: MuscleGroup[];
    equipment_type: EquipmentType[];
    movement_pattern: MovementPattern;
    difficulty: Difficulty;
    is_compound: boolean;
    instructions: {
      steps: string; // Non-optional now
      form: string;  // Non-optional now
    };
  }>({
    name: "",
    description: "",
    primary_muscle_groups: [],
    secondary_muscle_groups: [],
    equipment_type: [],
    movement_pattern: "push",
    difficulty: "beginner",
    is_compound: false,
    instructions: {
      steps: "", // Initialize with empty string instead of undefined
      form: ""   // Initialize with empty string instead of undefined
    }
  });

  // Update form when initialExercise changes
  useEffect(() => {
    if (initialExercise && mode === "edit") {
      setExercise({
        name: initialExercise.name || "",
        description: initialExercise.description || "",
        primary_muscle_groups: Array.isArray(initialExercise.primary_muscle_groups) 
          ? initialExercise.primary_muscle_groups as MuscleGroup[]
          : [],
        secondary_muscle_groups: Array.isArray(initialExercise.secondary_muscle_groups)
          ? initialExercise.secondary_muscle_groups as MuscleGroup[]
          : [],
        equipment_type: Array.isArray(initialExercise.equipment_type)
          ? initialExercise.equipment_type as EquipmentType[]
          : [],
        movement_pattern: (initialExercise.movement_pattern as MovementPattern) || "push",
        difficulty: (initialExercise.difficulty as Difficulty) || "beginner",
        is_compound: initialExercise.is_compound || false,
        instructions: {
          steps: initialExercise.instructions?.steps || "", // Ensure non-optional with default
          form: initialExercise.instructions?.form || ""    // Ensure non-optional with default
        }
      });
    } else {
      // Reset form for "add" mode
      setExercise({
        name: "",
        description: "",
        primary_muscle_groups: [],
        secondary_muscle_groups: [],
        equipment_type: [],
        movement_pattern: "push",
        difficulty: "beginner",
        is_compound: false,
        instructions: {
          steps: "",
          form: ""
        }
      });
    }
  }, [initialExercise, mode]);

  // Get options for select fields
  const muscleGroupOptions = MUSCLE_GROUPS.map(group => ({
    value: group,
    label: formatDisplayName(group)
  }));

  const equipmentOptions = EQUIPMENT_TYPES.map(type => ({
    value: type,
    label: formatDisplayName(type)
  }));

  // Use the new hook for MultiSelect fields
  const primaryMuscleField = useMultiSelectField(
    exercise.primary_muscle_groups,
    sel => setExercise(prev => ({ ...prev, primary_muscle_groups: sel as MuscleGroup[] }))
  );

  const secondaryMuscleField = useMultiSelectField(
    exercise.secondary_muscle_groups,
    sel => setExercise(prev => ({ ...prev, secondary_muscle_groups: sel as MuscleGroup[] }))
  );

  const equipmentField = useMultiSelectField(
    exercise.equipment_type,
    sel => setExercise(prev => ({ ...prev, equipment_type: sel as EquipmentType[] }))
  );

  // Handle form submission
  const handleSubmit = () => {
    // Form validation
    if (!exercise.name.trim()) {
      setFormError("Exercise name is required");
      return;
    }

    if (!exercise.primary_muscle_groups.length) {
      setFormError("At least one primary muscle group is required");
      return;
    }

    if (!exercise.equipment_type.length) {
      setFormError("At least one equipment type is required");
      return;
    }

    setFormError("");
    onSubmit(exercise);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add Exercise" : "Edit Exercise"}</DialogTitle>
        </DialogHeader>
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
          </TabsList>
          
          <ScrollArea className="flex-1 overflow-auto mt-4 px-1">
            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="name">Exercise Name*</Label>
                <Input 
                  id="name" 
                  value={exercise.name}
                  onChange={(e) => setExercise({...exercise, name: e.target.value})}
                  placeholder="E.g., Bench Press" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  value={exercise.description}
                  onChange={(e) => setExercise({...exercise, description: e.target.value})}
                  placeholder="Brief description of the exercise"
                  className="min-h-[80px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Primary Muscle Groups*</Label>
                <MultiSelect
                  options={muscleGroupOptions}
                  selected={primaryMuscleField.selected}
                  onChange={primaryMuscleField.onChange}
                  placeholder="Select primary muscles"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Secondary Muscle Groups</Label>
                <MultiSelect
                  options={muscleGroupOptions}
                  selected={secondaryMuscleField.selected}
                  onChange={secondaryMuscleField.onChange}
                  placeholder="Select secondary muscles"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Equipment Type*</Label>
                <MultiSelect
                  options={equipmentOptions}
                  selected={equipmentField.selected}
                  onChange={equipmentField.onChange}
                  placeholder="Select equipment types"
                />
              </div>
            </TabsContent>
            
            {/* Advanced Tab */}
            <TabsContent value="advanced" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Difficulty Level</Label>
                <Select 
                  value={exercise.difficulty}
                  onValueChange={(value) => 
                    setExercise({...exercise, difficulty: value as Difficulty})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {DIFFICULTY_LEVELS.map((level) => (
                      <SelectItem key={level} value={level}>
                        {formatDisplayName(level)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Movement Pattern</Label>
                <Select 
                  value={exercise.movement_pattern}
                  onValueChange={(value) => 
                    setExercise({...exercise, movement_pattern: value as MovementPattern})
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select movement pattern" />
                  </SelectTrigger>
                  <SelectContent>
                    {MOVEMENT_PATTERNS.map((pattern) => (
                      <SelectItem key={pattern} value={pattern}>
                        {formatDisplayName(pattern)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="is_compound" 
                  checked={exercise.is_compound}
                  onCheckedChange={(checked) => 
                    setExercise({...exercise, is_compound: checked as boolean})
                  }
                />
                <Label htmlFor="is_compound">Compound Exercise</Label>
              </div>
            </TabsContent>
            
            {/* Instructions Tab */}
            <TabsContent value="instructions" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="steps">Execution Steps</Label>
                <Textarea 
                  id="steps"
                  value={exercise.instructions.steps}
                  onChange={(e) => setExercise({
                    ...exercise, 
                    instructions: {...exercise.instructions, steps: e.target.value}
                  })}
                  placeholder="Step-by-step instructions for performing the exercise"
                  className="min-h-[120px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="form">Form Cues</Label>
                <Textarea 
                  id="form"
                  value={exercise.instructions.form}
                  onChange={(e) => setExercise({
                    ...exercise, 
                    instructions: {...exercise.instructions, form: e.target.value}
                  })}
                  placeholder="Important form cues and common mistakes to avoid"
                  className="min-h-[120px]"
                />
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
        
        {formError && (
          <p className="text-red-500 text-sm mt-2">{formError}</p>
        )}
        
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : mode === "add" ? "Add" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Wrap the component in React.memo to prevent unnecessary re-renders
export const ExerciseDialog = React.memo(ExerciseDialogComponent);
