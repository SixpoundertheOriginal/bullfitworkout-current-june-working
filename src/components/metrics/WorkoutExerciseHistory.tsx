
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TopExercisesTable } from './TopExercisesTable';
import { Skeleton } from "@/components/ui/skeleton";

interface WorkoutExerciseHistoryProps {
  exerciseVolumeHistory: any[];
  loading?: boolean;
  className?: string;
}

export const WorkoutExerciseHistory: React.FC<WorkoutExerciseHistoryProps> = ({
  exerciseVolumeHistory = [],
  loading = false,
  className = ''
}) => {
  const hasData = Array.isArray(exerciseVolumeHistory) && exerciseVolumeHistory.length > 0;
  
  return (
    <Card className={`bg-gray-900 border-gray-800 ${className}`}>
      <CardHeader>
        <CardTitle>Exercise History</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="w-full h-48" />
        ) : hasData ? (
          <TopExercisesTable exerciseVolumeHistory={exerciseVolumeHistory} />
        ) : (
          <div className="text-center p-6 text-gray-500">
            No exercise history data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};
