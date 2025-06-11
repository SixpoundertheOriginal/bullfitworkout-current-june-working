
import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ExerciseInstructionsTabProps {
  exercise: {
    instructions: {
      steps: string;
      form: string;
    };
  };
  onUpdate: (updates: any) => void;
}

export const ExerciseInstructionsTab: React.FC<ExerciseInstructionsTabProps> = React.memo(({
  exercise,
  onUpdate
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Exercise Instructions</Label>
        <Textarea
          placeholder="Step-by-step instructions..."
          className="min-h-[200px] mt-2"
          value={exercise.instructions.steps || ""}
          onChange={(e) =>
            onUpdate({
              instructions: {
                ...exercise.instructions,
                steps: e.target.value,
              },
            })
          }
        />
      </div>
      
      <div>
        <Label>Form Cues</Label>
        <Textarea
          placeholder="Form cues and common mistakes to avoid..."
          className="min-h-[100px] mt-2"
          value={exercise.instructions.form || ""}
          onChange={(e) =>
            onUpdate({
              instructions: {
                ...exercise.instructions,
                form: e.target.value,
              },
            })
          }
        />
      </div>
    </div>
  );
});

ExerciseInstructionsTab.displayName = 'ExerciseInstructionsTab';
