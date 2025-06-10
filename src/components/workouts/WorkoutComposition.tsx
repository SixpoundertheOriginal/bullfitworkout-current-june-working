
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface CompositionData {
  count: number;
  percentage: number;
}

interface WorkoutCompositionProps {
  composition: {
    compound: CompositionData;
    isolation: CompositionData;
    bodyweight: CompositionData;
    isometric: CompositionData;
    totalExercises: number;
  };
}

export const WorkoutComposition: React.FC<WorkoutCompositionProps> = React.memo(({
  composition
}) => {
  const compositionEntries = Object.entries(composition)
    .filter(([key]) => key !== 'totalExercises')
    .map(([type, data]) => ({
      type: type.charAt(0).toUpperCase() + type.slice(1),
      count: (data as CompositionData).count || 0,
      percentage: (data as CompositionData).percentage || 0
    }));

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle>Workout Composition</CardTitle>
      </CardHeader>
      <CardContent className="h-60">
        <div className="grid grid-cols-2 gap-4">
          {compositionEntries.map(({ type, count, percentage }) => (
            <div 
              key={type} 
              className="flex flex-col p-3 rounded-md bg-gray-800/50 border border-gray-700"
            >
              <div className="text-sm text-gray-400 mb-1">{type}</div>
              <div className="text-lg font-medium">
                {count} <span className="text-sm text-gray-400">({Math.round(percentage)}%)</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
});

WorkoutComposition.displayName = 'WorkoutComposition';
