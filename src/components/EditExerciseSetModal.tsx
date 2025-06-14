import React, { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MinusCircle, PlusCircle, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast"; // Assuming this is shadcn toast via use-toast
import { useWeightUnit } from "@/context/WeightUnitContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { ExerciseSet as CanonicalExerciseSet } from "@/types/exercise"; // Import canonical ExerciseSet

interface EditExerciseSetModalProps {
  sets: CanonicalExerciseSet[]; // Use canonical ExerciseSet
  exerciseName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedSets: CanonicalExerciseSet[]) => Promise<void>; // Expects canonical ExerciseSet
}

export function EditExerciseSetModal({ 
  sets: initialSets, // Renamed to avoid conflict with props.sets in handleAddSet logic
  exerciseName,
  open, 
  onOpenChange, 
  onSave 
}: EditExerciseSetModalProps) {
  const [formSets, setFormSets] = useState<CanonicalExerciseSet[]>([]);
  const [saving, setSaving] = useState(false);
  const { weightUnit } = useWeightUnit();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (initialSets) {
      // Ensure set_number is correctly ordered if it's optional and might be missing/inconsistent
      const sortedSets = [...initialSets].sort((a, b) => (a.set_number || 0) - (b.set_number || 0));
      setFormSets(sortedSets.map((s, i) => ({ ...s, set_number: s.set_number || i + 1 })));
    }
  }, [initialSets]);

  const handleWeightChange = (index: number, value: string) => {
    const updatedSets = [...formSets];
    const numValue = parseFloat(value);
    updatedSets[index].weight = !isNaN(numValue) ? Math.max(0, numValue) : 0;
    // Also update volume if it's part of the ExerciseSet and should be dynamic
    updatedSets[index].volume = updatedSets[index].weight * updatedSets[index].reps;
    setFormSets(updatedSets);
  };

  const handleRepsChange = (index: number, value: string) => {
    const updatedSets = [...formSets];
    const numValue = parseInt(value, 10);
    updatedSets[index].reps = !isNaN(numValue) ? Math.max(0, numValue) : 0;
    // Also update volume
    updatedSets[index].volume = updatedSets[index].weight * updatedSets[index].reps;
    setFormSets(updatedSets);
  };

  const handleWeightIncrement = (index: number, increment: number) => {
    const updatedSets = [...formSets];
    const newWeight = Math.max(0, updatedSets[index].weight + increment);
    updatedSets[index].weight = newWeight;
    updatedSets[index].volume = newWeight * updatedSets[index].reps;
    setFormSets(updatedSets);
  };

  const handleRepsIncrement = (index: number, increment: number) => {
    const updatedSets = [...formSets];
    const newReps = Math.max(0, updatedSets[index].reps + increment);
    updatedSets[index].reps = newReps;
    updatedSets[index].volume = updatedSets[index].weight * newReps;
    setFormSets(updatedSets);
  };

  const handleRemoveSet = (index: number) => {
    const updatedSets = formSets.filter((_, i) => i !== index);
    updatedSets.forEach((set, i) => {
      set.set_number = i + 1;
    });
    setFormSets(updatedSets);
  };

  const handleAddSet = () => {
    const lastSet = formSets.length > 0 ? formSets[formSets.length - 1] : null;
    const newSetNumber = formSets.length + 1;
    
    const currentWorkoutId = formSets.length > 0 
      ? formSets[0].workout_id 
      : (initialSets.length > 0 ? initialSets[0].workout_id : undefined);

    const newWeight = lastSet?.weight || 0;
    const newReps = lastSet?.reps || 0;

    const newSet: CanonicalExerciseSet = {
      id: `temp-${Date.now()}-${newSetNumber}`, // Ensure unique ID
      weight: newWeight, // required
      reps: newReps, // required
      duration: lastSet?.duration || '0:00', // required
      completed: true, // required (modal's existing logic)
      volume: newWeight * newReps, // required
      restTime: lastSet?.restTime || 60, // required
      isEditing: true, // required (new set starts as editable)

      // Optional fields
      set_number: newSetNumber,
      exercise_name: exerciseName, // from props
      workout_id: currentWorkoutId, // Can be undefined if not available
      // metadata, created_at, etc., will be undefined or take default values
    };
    
    setFormSets([...formSets, newSet]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out any sets that might not be fully valid if needed, or ensure validation
    const validSets = formSets.map((set, index) => ({
      ...set,
      set_number: set.set_number || index + 1, // Ensure set_number if somehow missing
    }));

    try {
      setSaving(true);
      await onSave(validSets); // Pass validSets
      onOpenChange(false);
      // Use object syntax for shadcn toast
      toast({ title: "Exercise sets updated successfully", variant: "default" }); // "success" variant might not exist
    } catch (error) {
      console.error("Error updating exercise sets:", error);
      toast({ title: "Failed to update exercise sets", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-gray-900 border-gray-800 text-white">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">Edit {exerciseName}</DialogTitle>
            <DialogDescription className="text-gray-400">
              Edit sets, weight, and reps for this exercise.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <div className="grid grid-cols-12 gap-2 mb-2 text-sm text-gray-400">
              <div className="col-span-2 text-center">Set</div>
              <div className="col-span-4 text-center">Weight ({weightUnit})</div>
              <div className="col-span-4 text-center">Reps</div>
              <div className="col-span-2 text-center">Action</div>
            </div>
            
            {formSets.map((set, index) => (
              <div key={set.id} className="grid grid-cols-12 gap-2 mb-3 items-center">
                <div className="col-span-2 text-center font-medium">{set.set_number}</div>
                
                <div className="col-span-4 flex items-center gap-1">
                  <button 
                    type="button"
                    onClick={() => handleWeightIncrement(index, -1)} 
                    className="h-10 w-10 flex items-center justify-center text-gray-400 hover:text-white bg-gray-800 rounded-full"
                  >
                    <MinusCircle size={16} />
                  </button>
                  <Input 
                    type="number"
                    min="0"
                    step="any"
                    value={set.weight}
                    onChange={(e) => handleWeightChange(index, e.target.value)}
                    className="workout-number-input text-center flex-1 h-10 bg-gray-800 border-gray-700 text-white"
                    onBlur={(e) => {
                      if (parseFloat(e.target.value) < 0 || e.target.value === '') {
                        handleWeightChange(index, "0");
                      }
                    }}
                  />
                  <button 
                    type="button"
                    onClick={() => handleWeightIncrement(index, 1)} 
                    className="h-10 w-10 flex items-center justify-center text-gray-400 hover:text-white bg-gray-800 rounded-full"
                  >
                    <PlusCircle size={16} />
                  </button>
                </div>
                
                <div className="col-span-4 flex items-center gap-1">
                  <button 
                    type="button"
                    onClick={() => handleRepsIncrement(index, -1)} 
                    className="h-10 w-10 flex items-center justify-center text-gray-400 hover:text-white bg-gray-800 rounded-full"
                  >
                    <MinusCircle size={16} />
                  </button>
                  <Input 
                    type="number"
                    min="0"
                    step="1"
                    value={set.reps}
                    onChange={(e) => handleRepsChange(index, e.target.value)}
                    className="workout-number-input text-center flex-1 h-10 bg-gray-800 border-gray-700 text-white"
                    onBlur={(e) => {
                      if (parseInt(e.target.value) < 0 || e.target.value === '') {
                        handleRepsChange(index, "0");
                      }
                    }}
                  />
                  <button 
                    type="button"
                    onClick={() => handleRepsIncrement(index, 1)} 
                    className="h-10 w-10 flex items-center justify-center text-gray-400 hover:text-white bg-gray-800 rounded-full"
                  >
                    <PlusCircle size={16} />
                  </button>
                </div>
                
                <div className="col-span-2 flex justify-center">
                  <Button
                    type="button"
                    size="icon"
                    variant="destructive"
                    onClick={() => handleRemoveSet(index)}
                    className="h-10 w-10"
                    disabled={formSets.length <= 1}
                  >
                    <MinusCircle size={16} />
                  </Button>
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              onClick={handleAddSet}
              variant="outline"
              className="w-full mt-2 bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Set
            </Button>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-gray-800 text-white border-gray-700 hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-purple-600 text-white hover:bg-purple-700"
              disabled={saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
