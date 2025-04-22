
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface AddExerciseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (exercise: { name: string; description: string }) => Promise<void>;
}

export function AddExerciseDialog({ open, onOpenChange, onAdd }: AddExerciseDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onAdd({ name: name.trim(), description: description.trim() });
      setName("");
      setDescription("");
      onOpenChange(false);
      toast({ title: "Exercise Added", description: `"${name}" was added to your exercises.` });
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "Failed to add exercise", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>Add New Exercise</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1" htmlFor="exercise-name">
              Name
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
          <DialogFooter className="flex justify-end gap-2">
            <Button type="button" variant="outline" className="bg-gray-800 border-gray-700" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={loading || !name.trim()}>
              {loading ? "Adding..." : "Add Exercise"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
