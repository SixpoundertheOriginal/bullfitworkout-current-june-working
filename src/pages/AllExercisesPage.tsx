
import React from "react";
import { useExercises } from "@/hooks/useExercises";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Edit } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AllExercisesPage() {
  const { exercises, isLoading, isError } = useExercises();
  const navigate = useNavigate();

  const handleEdit = (exerciseId: string) => {
    // Placeholder for edit logic - can open a modal or navigate to edit page
    alert("Edit functionality coming soon for ID: " + exerciseId);
  };

  const handleAdd = () => {
    // Placeholder for add new exercise logic
    alert("Add Exercise dialog coming soon!");
  };

  if (isLoading) return <div className="text-white text-center pt-8">Loading exercises...</div>;
  if (isError) return <div className="text-red-500 text-center pt-8">Error loading exercises.</div>;

  return (
    <div className="max-w-2xl mx-auto py-6 px-2 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">All Exercises</h2>
        <Button onClick={handleAdd} variant="gradient" size="sm">
          <Plus className="w-4 h-4" />
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
              <Button variant="outline" size="sm" onClick={() => handleEdit(exercise.id)}>
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
