
import React from 'react';
import { Dumbbell } from 'lucide-react';

interface ExerciseHeaderProps {
  exerciseName: string;
  lastSession?: {
    weight: number;
    reps: number;
    sets: number;
  };
  weightUnit: string;
}

export const ExerciseHeader = ({ exerciseName, lastSession, weightUnit }: ExerciseHeaderProps) => {
  return (
    <div className="flex items-start justify-between mb-4 p-4 rounded-lg bg-gray-900/50 backdrop-blur-sm border border-gray-800">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Dumbbell className="h-6 w-6 text-purple-400" />
          <h2 className="text-xl font-semibold tracking-tight">{exerciseName}</h2>
        </div>
        {lastSession && (
          <p className="text-sm text-gray-400">
            Last session:{' '}
            <span className="font-mono">
              {lastSession.weight} {weightUnit} × {lastSession.reps} × {lastSession.sets}
            </span>
          </p>
        )}
      </div>
    </div>
  );
};
