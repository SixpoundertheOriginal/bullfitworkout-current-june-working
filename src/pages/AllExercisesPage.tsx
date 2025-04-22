
import React from "react";
import { useExercises } from "@/hooks/useExercises";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";

export default function AllExercisesPage() {
  const { exercises, isLoading, isError } = useExercises();
  const navigate = useNavigate();

  const handleEdit = (exerciseId: string) => {
    // Placeholder for edit logic - can open a modal or navigate to edit page
    toast({
      title: "Edit Exercise",
      description: `Editing exercise with ID: ${exerciseId}`,
    });
  };

  const handleDelete = (exerciseId: string) => {
    // Placeholder for delete logic
    toast({
      title: "Delete Exercise",
      description: `Deleting exercise with ID: ${exerciseId}`,
      variant: "destructive",
    });
  };

  const handleAdd = () => {
    // Placeholder for add new exercise logic
    toast({
      title: "Add Exercise",
      description: "Opening new exercise form",
    });
  };

  if (isLoading) return <div className="text-white text-center pt-8">Loading exercises...</div>;
  if (isError) return <div className="text-red-500 text-center pt-8">Error loading exercises.</div>;

  return (
    <div className="max-w-2xl mx-auto py-6 px-2 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">All Exercises</h2>
        <Button onClick={handleAdd} variant="gradient" size="sm">
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
