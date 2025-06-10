
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TopExercisesTable } from '@/components/metrics/TopExercisesTable';

interface ExerciseDetailsTableProps {
  exerciseVolumeHistory: Array<{
    exercise_name: string;
    trend: 'increasing' | 'decreasing' | 'stable' | 'fluctuating';
    percentChange: number;
  }>;
}

export const ExerciseDetailsTable: React.FC<ExerciseDetailsTableProps> = React.memo(({
  exerciseVolumeHistory
}) => {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle>Exercise Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <TopExercisesTable exerciseVolumeHistory={exerciseVolumeHistory} />
      </CardContent>
    </Card>
  );
});

ExerciseDetailsTable.displayName = 'ExerciseDetailsTable';
