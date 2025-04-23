
import React, { useState } from "react";
import { useExercises } from "@/hooks/useExercises";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ExerciseDialog } from "@/components/ExerciseDialog";
import { MuscleGroup, EquipmentType, MovementPattern, Difficulty, Exercise } from "@/types/exercise";
import { Accordion } from "@/components/ui/accordion";
import ExerciseAccordionCard from "@/components/exercises/ExerciseAccordionCard";

interface AllExercisesPageProps {
  onSelectExercise?: (exercise: string | Exercise) => void;
}

export default function AllExercisesPage({ onSelectExercise }: AllExercisesPageProps = {}) {
  const { exercises, isLoading, isError, createExercise, isPending } = useExercises();
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  // For add/edit
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [exerciseToEdit, setExerciseToEdit] = useState<any | null>(null);

  const handleEdit = (exerciseId: string) => {
    const found = exercises.find(e => e.id === exerciseId);
    if (found) {
      setExerciseToEdit({
        name: found.name,
        description: found.description,
        primary_muscle_groups: found.primary_muscle_groups,
        secondary_muscle_groups: found.secondary_muscle_groups,
        equipment_type: found.equipment_type,
        movement_pattern: found.movement_pattern,
        difficulty: found.difficulty,
        instructions: found.instructions,
        is_compound: found.is_compound,
        tips: found.tips,
        variations: found.variations,
        metadata: found.metadata,
      });
      setDialogMode("edit");
      setShowDialog(true);
    } else {
      toast({ title: "Exercise not found", variant: "destructive" });
    }
  };

  const handleDelete = (exerciseId: string) => {
    toast({
      title: "Delete Exercise",
      description: `Deleting exercise with ID: ${exerciseId}`,
      variant: "destructive",
    });
  };

  const handleAdd = () => {
    setExerciseToEdit(null);
    setDialogMode("add");
    setShowDialog(true);
  };

  const handleAccordionSelect = (value: string) => {
    setActiveAccordion(prev => (prev === value ? null : value));
  };

  const handleSelectExercise = (exercise: Exercise) => {
    if (onSelectExercise) {
      onSelectExercise(exercise);
    } else {
      handleAccordionSelect(exercise.id);
    }
  };

  // Add/Edit handler
  const handleDialogSubmit = async (exercise: {
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
  }) => {
    if (dialogMode === "add") {
      await new Promise(resolve => setTimeout(resolve, 350));
      await new Promise<void>((resolve, reject) => {
        createExercise(
          {
            ...exercise,
            user_id: "",
          },
          {
            onSuccess: () => resolve(),
            onError: err => reject(err),
          }
        );
      });
    } else {
      // For now, just toast in edit mode (update functionality to be added)
      toast({ title: "Edit not implemented", description: "Update exercise functionality will be implemented soon!" });
    }
  };

  if (isLoading) return <div className="text-white text-center pt-8">Loading exercises...</div>;
  if (isError) return <div className="text-red-500 text-center pt-8">Error loading exercises.</div>;

  return (
    <div className="max-w-2xl mx-auto py-6 px-2 space-y-6">
      <ExerciseDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onSubmit={handleDialogSubmit}
        initialExercise={exerciseToEdit!}
        loading={isPending}
        mode={dialogMode}
      />
      <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:justify-between sm:items-center">
        <h2 className="text-2xl font-bold text-white">All Exercises</h2>
        <Button onClick={handleAdd} variant="gradient" size="sm" className="flex items-center justify-center mt-2 sm:mt-0">
          <Plus className="w-4 h-4 mr-1" />
          Add New
        </Button>
      </div>
      <div className="space-y-4">
        {exercises.length === 0 && (
          <div className="text-gray-400 text-center">
            No exercises found. Click "Add New" to create one!
          </div>
        )}
        <Accordion
          type="single"
          collapsible
          value={activeAccordion ? activeAccordion : ""}
          onValueChange={val => setActiveAccordion(val as string)}
        >
          {exercises.map((exercise) => (
            <ExerciseAccordionCard
              key={exercise.id}
              exercise={exercise}
              expanded={activeAccordion === exercise.id}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSelect={handleSelectExercise}
            />
          ))}
        </Accordion>
      </div>
    </div>
  );
}
