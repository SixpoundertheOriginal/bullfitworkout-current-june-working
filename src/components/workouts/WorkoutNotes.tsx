
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WorkoutNotesProps {
  notes?: string;
  workoutName: string;
  className?: string;
}

export const WorkoutNotes: React.FC<WorkoutNotesProps> = React.memo(({
  notes,
  workoutName,
  className = ""
}) => {
  if (!notes || notes.trim().length === 0) {
    return null;
  }

  return (
    <Card className={`bg-gray-900 border-gray-800 ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Workout Notes</span>
          <span className="text-sm text-gray-400 font-normal">({workoutName})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
          {notes}
        </div>
      </CardContent>
    </Card>
  );
});

WorkoutNotes.displayName = 'WorkoutNotes';
