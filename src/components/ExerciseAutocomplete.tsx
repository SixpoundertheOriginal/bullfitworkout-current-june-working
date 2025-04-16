
import React, { useState, useEffect } from "react";
import { Check, ChevronsUpDown, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Exercise } from "@/types/exercise";
import { useExercises } from "@/hooks/useExercises";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

interface ExerciseAutocompleteProps {
  onSelectExercise: (exercise: Exercise) => void;
}

export function ExerciseAutocomplete({ onSelectExercise }: ExerciseAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form state for new exercise with all required fields
  const [newExercise, setNewExercise] = useState<Omit<Exercise, 'id'>>({
    name: "",
    description: "",
    primary_muscle_groups: [],
    secondary_muscle_groups: [],
    equipment_type: [],
    movement_pattern: "push",
    difficulty: "beginner",
    instructions: {}, // Required field
    is_compound: false, // Required field
    // Other optional fields
    tips: [],
    variations: []
  });
  
  const [tempMuscleGroup, setTempMuscleGroup] = useState("");
  const [tempEquipment, setTempEquipment] = useState("");
  
  const { exercises, isLoading, createExercise, isPending, error, isError } = useExercises();

  // Safe exercises list that is always an array
  const safeExercises = exercises || [];

  // Log exercises data for debugging
  useEffect(() => {
    console.log(`Loaded ${safeExercises.length} exercises`);
    if (isError && error) {
      console.error("Error in useExercises:", error);
    }
  }, [safeExercises, isError, error]);

  const handleCreateExercise = () => {
    if (!newExercise.name) {
      toast({
        title: "Exercise name required",
        description: "Please provide a name for your exercise",
        variant: "destructive"
      });
      return;
    }

    if (newExercise.primary_muscle_groups.length === 0) {
      toast({
        title: "Muscle group required",
        description: "Please add at least one primary muscle group",
        variant: "destructive"
      });
      return;
    }

    createExercise(newExercise);
    setDialogOpen(false);
    
    // Reset form with all required fields
    setNewExercise({
      name: "",
      description: "",
      primary_muscle_groups: [],
      secondary_muscle_groups: [],
      equipment_type: [],
      movement_pattern: "push",
      difficulty: "beginner",
      instructions: {}, // Required field
      is_compound: false, // Required field
      tips: [],
      variations: []
    });
  };

  const addPrimaryMuscleGroup = () => {
    if (tempMuscleGroup && !newExercise.primary_muscle_groups.includes(tempMuscleGroup)) {
      setNewExercise({
        ...newExercise,
        primary_muscle_groups: [...newExercise.primary_muscle_groups, tempMuscleGroup],
      });
      setTempMuscleGroup("");
    }
  };

  const addEquipment = () => {
    if (tempEquipment && !newExercise.equipment_type.includes(tempEquipment)) {
      setNewExercise({
        ...newExercise,
        equipment_type: [...newExercise.equipment_type, tempEquipment],
      });
      setTempEquipment("");
    }
  };

  const removeMuscleGroup = (group: string) => {
    setNewExercise({
      ...newExercise,
      primary_muscle_groups: newExercise.primary_muscle_groups.filter(g => g !== group),
    });
  };

  const removeEquipment = (equipment: string) => {
    setNewExercise({
      ...newExercise,
      equipment_type: newExercise.equipment_type.filter(e => e !== equipment),
    });
  };

  // Filter exercises based on search term with careful null checking
  const filteredExercises = React.useMemo(() => {
    if (!searchTerm || !safeExercises || safeExercises.length === 0) {
      return safeExercises;
    }
    
    const searchTermLower = searchTerm.toLowerCase();
    return safeExercises.filter(ex => {
      // Check if exercise name includes search term
      const nameMatch = ex.name?.toLowerCase().includes(searchTermLower);
      
      // Check if any muscle group includes search term, with careful null checks
      const muscleMatch = Array.isArray(ex.primary_muscle_groups) && 
        ex.primary_muscle_groups.some(m => 
          m && typeof m === 'string' && m.toLowerCase().includes(searchTermLower)
        );
        
      return nameMatch || muscleMatch;
    });
  }, [searchTerm, safeExercises]);

  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-gray-900 border-gray-700 text-white"
          >
            {value
              ? safeExercises.find((exercise) => exercise.name === value)?.name || value
              : "Select exercise..."}
            {isLoading ? (
              <Loader2 className="ml-2 h-4 w-4 animate-spin" />
            ) : (
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0 bg-gray-800 text-white border-gray-700">
          <Command className="bg-gray-800">
            <CommandInput 
              placeholder="Search exercises..." 
              className="bg-gray-800 text-white"
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandEmpty className="py-6 text-center text-gray-400">
              {isLoading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="h-6 w-6 animate-spin mb-2" />
                  <span>Loading exercises...</span>
                </div>
              ) : (
                <>
                  No exercise found.
                  <Button 
                    variant="link" 
                    className="block w-full text-blue-400"
                    onClick={() => {
                      setDialogOpen(true);
                      setNewExercise({
                        ...newExercise,
                        name: searchTerm || "",
                      });
                      setOpen(false);
                    }}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create "{searchTerm || 'new exercise'}"
                  </Button>
                </>
              )}
            </CommandEmpty>
            {Array.isArray(filteredExercises) && filteredExercises.length > 0 ? (
              <CommandGroup heading="Exercises">
                {filteredExercises.map((exercise) => (
                  <CommandItem
                    key={exercise.id}
                    value={exercise.name}
                    onSelect={(currentValue) => {
                      setValue(currentValue);
                      onSelectExercise(exercise);
                      setOpen(false);
                    }}
                    className="text-white hover:bg-gray-700"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === exercise.name ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {exercise.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            ) : null}
          </Command>
        </PopoverContent>
      </Popover>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-gray-900 text-white border-gray-700 sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Exercise</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Exercise Name</Label>
              <Input
                id="name"
                value={newExercise.name}
                onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={newExercise.description || ''}
                onChange={(e) => setNewExercise({ ...newExercise, description: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Primary Muscle Groups</Label>
              <div className="flex gap-2">
                <Input
                  value={tempMuscleGroup}
                  onChange={(e) => setTempMuscleGroup(e.target.value)}
                  placeholder="e.g., Chest, Back, Legs"
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <Button type="button" size="sm" onClick={addPrimaryMuscleGroup}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {newExercise.primary_muscle_groups.map((group) => (
                  <Badge 
                    key={group} 
                    variant="secondary"
                    className="flex items-center gap-1 bg-gray-700"
                  >
                    {group}
                    <button 
                      onClick={() => removeMuscleGroup(group)}
                      className="ml-1 text-gray-400 hover:text-white"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Equipment Types</Label>
              <div className="flex gap-2">
                <Input
                  value={tempEquipment}
                  onChange={(e) => setTempEquipment(e.target.value)}
                  placeholder="e.g., Barbell, Dumbbell"
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <Button type="button" size="sm" onClick={addEquipment}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {newExercise.equipment_type.map((equipment) => (
                  <Badge 
                    key={equipment} 
                    variant="secondary"
                    className="flex items-center gap-1 bg-gray-700"
                  >
                    {equipment}
                    <button 
                      onClick={() => removeEquipment(equipment)}
                      className="ml-1 text-gray-400 hover:text-white"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="movement">Movement Pattern</Label>
              <Select 
                value={newExercise.movement_pattern}
                onValueChange={(value) => setNewExercise({ ...newExercise, movement_pattern: value })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select movement pattern" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="push">Push</SelectItem>
                  <SelectItem value="pull">Pull</SelectItem>
                  <SelectItem value="squat">Squat</SelectItem>
                  <SelectItem value="hinge">Hinge</SelectItem>
                  <SelectItem value="rotation">Rotation</SelectItem>
                  <SelectItem value="carry">Carry</SelectItem>
                  <SelectItem value="isolation">Isolation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select 
                value={newExercise.difficulty}
                onValueChange={(value) => setNewExercise({ ...newExercise, difficulty: value })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="isCompound">Exercise Type</Label>
              <Select 
                value={newExercise.is_compound.toString()}
                onValueChange={(value) => setNewExercise({ ...newExercise, is_compound: value === "true" })}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Select exercise type" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="true">Compound</SelectItem>
                  <SelectItem value="false">Isolation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateExercise} 
              disabled={!newExercise.name || isPending || newExercise.primary_muscle_groups.length === 0}
            >
              {isPending ? "Creating..." : "Create Exercise"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
