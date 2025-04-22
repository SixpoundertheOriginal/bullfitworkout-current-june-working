import React, { useState } from "react";
import { useExercises } from "@/hooks/useExercises";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Trash2, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AddExerciseDialog } from "@/components/AddExerciseDialog";
import { MuscleGroup, EquipmentType, MovementPattern, Difficulty } from "@/types/exercise";

export default function AllExercisesPage() {
  const { exercises, isLoading, isError, createExercise, isPending } = useExercises();
  const { toast } = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);

  const handleEdit = (exerciseId: string) => {
    toast({
      title: "Edit Exercise",
      description: `Editing exercise with ID: ${exerciseId}`,
    });
  };

  const handleDelete = (exerciseId: string) => {
    toast({
      title: "Delete Exercise",
      description: `Deleting exercise with ID: ${exerciseId}`,
      variant: "destructive",
    });
  };

  const handleAdd = () => {
    setShowAddDialog(true);
  };

  const handleAddExercise = async (exercise: {
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
    await new Promise(resolve => setTimeout(resolve, 350));
    return new Promise<void>((resolve, reject) => {
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
  };

  if (isLoading) return <div className="text-white text-center pt-8">Loading exercises...</div>;
  if (isError) return <div className="text-red-500 text-center pt-8">Error loading exercises.</div>;

  return (
    <div className="max-w-2xl mx-auto py-6 px-2 space-y-6">
      <AddExerciseDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAdd={handleAddExercise}
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
        {exercises.map((exercise) => (
          <Card key={exercise.id} className="bg-gray-900 border-gray-700">
            <CardContent className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <div className="font-semibold text-white">{exercise.name}</div>
                <div className="text-xs text-gray-400">{exercise.description}</div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  size="sm" 
                  onClick={() => handleEdit(exercise.id)}
                  className="text-white bg-gray-800 hover:bg-gray-700"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDelete(exercise.id)}
                  className="bg-red-900/50 hover:bg-red-800 text-white"
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
