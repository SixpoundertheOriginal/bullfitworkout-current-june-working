
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { MuscleGroup, EquipmentType, MovementPattern, Difficulty } from "@/types/exercise";

interface AddExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (exercise: {
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
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  "full body", "chest", "back", "shoulders", "arms", "legs", "core", "glutes", "triceps", "biceps", "hamstrings", "quads", "calves", "forearms", "traps", "lats"
];
const EQUIPMENT_TYPES: EquipmentType[] = [
  "barbell", "dumbbell", "machine", "bodyweight", "cable", "kettlebell", "band", "other"
];
const MOVEMENT_PATTERNS: MovementPattern[] = [
  "push", "pull", "squat", "hinge", "carry", "rotation", "isolation", "other"
];
const DIFFICULTIES: Difficulty[] = [
  "beginner", "intermediate", "advanced"
];

export function AddExerciseDialog({ open, onOpenChange, onAdd }: AddExerciseDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [primaryMuscleGroups, setPrimaryMuscleGroups] = useState<MuscleGroup[]>([]);
  const [secondaryMuscleGroups, setSecondaryMuscleGroups] = useState<MuscleGroup[]>([]);
  const [equipmentType, setEquipmentType] = useState<EquipmentType[]>([]);
  const [movementPattern, setMovementPattern] = useState<MovementPattern>("push");
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
    setLoading(true);
    try {
      await onAdd({
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
        metadata: {}
      });
      clearForm();
      onOpenChange(false);
      toast({ title: "Exercise Added", description: `"${name}" was added to your exercises.` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to add exercise", variant: "destructive" });
    } finally {
      setLoading(false);
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
          <DialogTitle>Add New Exercise</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
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
          {/* Description */}
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
          {/* Primary Muscle Groups */}
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
          {/* Secondary Muscle Groups */}
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
          {/* Equipment Types */}
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
          {/* Movement Pattern */}
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
          {/* Difficulty */}
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
            <Button type="submit" variant="gradient" disabled={loading || !name.trim() || primaryMuscleGroups.length === 0}>
              {loading ? "Adding..." : "Create Exercise"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
