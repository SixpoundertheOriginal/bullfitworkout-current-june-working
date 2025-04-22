
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MuscleGroup, EquipmentType, MovementPattern, Difficulty } from "@/types/exercise";
import { useToast } from "@/hooks/use-toast";

interface ExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
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
  }) => Promise<void>;
  initialExercise?: {
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
  };
  loading?: boolean;
  mode?: "add" | "edit";
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  "full body", "chest", "back", "shoulders", "arms", "legs", "core", "glutes", "triceps", "biceps", "hamstrings", "quads", "calves", "forearms", "traps", "lats"
];
const EQUIPMENT_TYPES: EquipmentType[] = [
  "barbell", "dumbbell", "machine", "bodyweight", "cable", "kettlebell", "resistance band", "smith machine", "other"
];
const MOVEMENT_PATTERNS: MovementPattern[] = [
  "push", "pull", "squat", "hinge", "carry", "rotation", "lunge", "isometric"
];
const DIFFICULTIES: Difficulty[] = [
  "beginner", "intermediate", "advanced"
];

export function ExerciseDialog({
  open,
  onOpenChange,
  onSubmit,
  initialExercise,
  loading = false,
  mode = "add",
}: ExerciseDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [primaryMuscleGroups, setPrimaryMuscleGroups] = useState<MuscleGroup[]>([]);
  const [secondaryMuscleGroups, setSecondaryMuscleGroups] = useState<MuscleGroup[]>([]);
  const [equipmentType, setEquipmentType] = useState<EquipmentType[]>([]);
  const [movementPattern, setMovementPattern] = useState<MovementPattern>("push");
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const { toast } = useToast();

  useEffect(() => {
    if (initialExercise && open) {
      setName(initialExercise.name);
      setDescription(initialExercise.description);
      setPrimaryMuscleGroups(initialExercise.primary_muscle_groups);
      setSecondaryMuscleGroups(initialExercise.secondary_muscle_groups);
      setEquipmentType(initialExercise.equipment_type);
      setMovementPattern(initialExercise.movement_pattern);
      setDifficulty(initialExercise.difficulty);
    } else if (open && !initialExercise) {
      clearForm();
    }
    // ignore eslint exhaustive-deps on open change
    // eslint-disable-next-line
  }, [open, initialExercise]);

  const clearForm = () => {
    setName("");
    setDescription("");
    setPrimaryMuscleGroups([]);
    setSecondaryMuscleGroups([]);
    setEquipmentType([]);
    setMovementPattern("push");
    setDifficulty("beginner");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || primaryMuscleGroups.length === 0) {
      toast({ title: "Missing fields", description: "Please provide a name and at least one primary muscle group.", variant: "destructive" });
      return;
    }
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        primary_muscle_groups: primaryMuscleGroups,
        secondary_muscle_groups: secondaryMuscleGroups,
        equipment_type: equipmentType,
        movement_pattern: movementPattern,
        difficulty,
        instructions: {},
        is_compound: false,
        tips: [],
        variations: [],
        metadata: {},
      });
      clearForm();
      onOpenChange(false);
      toast({ title: mode === "add" ? "Exercise Added" : "Exercise Updated", description: `"${name}" has been ${mode === "add" ? "added" : "updated"}.` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to save exercise", variant: "destructive" });
    }
  };

  const toggleSelect = <T,>(value: T, arr: T[], setArr: (v: T[]) => void) => {
    if (arr.includes(value)) {
      setArr(arr.filter(v => v !== value));
    } else {
      setArr([...arr, value]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>{mode === "add" ? "Add New Exercise" : "Edit Exercise"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="exercise-name">
              Exercise Name
            </label>
            <input
              id="exercise-name"
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring focus:ring-purple-600"
              required
              maxLength={50}
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Barbell Bench Press"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="exercise-description">
              Description
            </label>
            <textarea
              id="exercise-description"
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring focus:ring-purple-600"
              rows={3}
              maxLength={256}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the movement, muscles, or instructions…"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Primary Muscle Groups</label>
            <div className="flex flex-wrap gap-2">
              {MUSCLE_GROUPS.map(muscle => (
                <button
                  type="button"
                  key={muscle}
                  className={`px-3 py-1 rounded-full border ${primaryMuscleGroups.includes(muscle) ? "bg-purple-600 border-purple-300 text-white" : "bg-gray-800 border-gray-700 text-gray-200"} text-xs`}
                  onClick={() => toggleSelect(muscle, primaryMuscleGroups, setPrimaryMuscleGroups)}
                  disabled={loading}
                >
                  {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Secondary Muscle Groups</label>
            <div className="flex flex-wrap gap-2">
              {MUSCLE_GROUPS.map(muscle => (
                <button
                  type="button"
                  key={muscle + "_secondary"}
                  className={`px-3 py-1 rounded-full border ${secondaryMuscleGroups.includes(muscle) ? "bg-pink-700 border-pink-300 text-white" : "bg-gray-800 border-gray-700 text-gray-200"} text-xs`}
                  onClick={() => toggleSelect(muscle, secondaryMuscleGroups, setSecondaryMuscleGroups)}
                  disabled={loading}
                >
                  {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Equipment Types</label>
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT_TYPES.map(eq => (
                <button
                  type="button"
                  key={eq}
                  className={`px-3 py-1 rounded-full border ${equipmentType.includes(eq) ? "bg-blue-700 border-blue-300 text-white" : "bg-gray-800 border-gray-700 text-gray-200"} text-xs`}
                  onClick={() => toggleSelect(eq, equipmentType, setEquipmentType)}
                  disabled={loading}
                >
                  {eq.charAt(0).toUpperCase() + eq.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Movement Pattern</label>
            <select
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring focus:ring-purple-600"
              value={movementPattern}
              onChange={e => setMovementPattern(e.target.value as MovementPattern)}
              disabled={loading}
            >
              {MOVEMENT_PATTERNS.map(p => (
                <option value={p} key={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-300 mb-1">Difficulty</label>
            <select
              className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white focus:outline-none focus:ring focus:ring-purple-600"
              value={difficulty}
              onChange={e => setDifficulty(e.target.value as Difficulty)}
              disabled={loading}
            >
              {DIFFICULTIES.map(d => (
                <option value={d} key={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
              ))}
            </select>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" className="bg-gray-800 border-gray-700" onClick={() => { onOpenChange(false); clearForm(); }} disabled={loading}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="gradient" 
              disabled={loading || !name.trim() || primaryMuscleGroups.length === 0}
            >
              {loading
                ? (mode === "add" ? "Adding..." : "Saving...")
                : (mode === "add" ? "Create Exercise" : "Save Changes")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
