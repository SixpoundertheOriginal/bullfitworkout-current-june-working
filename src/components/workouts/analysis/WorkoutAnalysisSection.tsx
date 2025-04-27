
import React from 'react';
import { Card } from '@/components/ui/card';
import { WorkoutDensityChart } from '@/components/metrics/WorkoutDensityChart';
import { MuscleFocusChart } from '@/components/metrics/MuscleFocusChart';
import { useWeightUnit } from '@/context/WeightUnitContext';
import { Activity } from 'lucide-react';

interface WorkoutAnalysisSectionProps {
  workout: {
    duration: number;
  };
  exerciseSets: Record<string, any[]>;
  muscleFocus: Record<string, number>;
  activeWorkoutTime: number;
  totalVolume: number;
  totalRestTime: number;
}

export const WorkoutAnalysisSection: React.FC<WorkoutAnalysisSectionProps> = ({
  workout,
  exerciseSets,
  muscleFocus,
  activeWorkoutTime,
  totalVolume,
  totalRestTime,
}) => {
  const { weightUnit } = useWeightUnit();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="bg-gray-900/80 border-gray-800">
        <div className="p-4">
          <h3 className="text-sm flex items-center mb-4">
            <Activity className="h-4 w-4 mr-2 text-purple-400" />
            Workout Density Analysis
          </h3>
          <div className="h-48">
            <WorkoutDensityChart 
              totalTime={workout.duration}
              activeTime={activeWorkoutTime}
              restTime={totalRestTime / 60}
              totalVolume={totalVolume}
              weightUnit={weightUnit}
            />
          </div>
        </div>
      </Card>

      <Card className="bg-gray-900/80 border-gray-800">
        <div className="p-4">
          <h3 className="text-sm mb-4">Muscle Focus Distribution</h3>
          <MuscleFocusChart muscleGroups={muscleFocus} />
        </div>
      </Card>
    </div>
  );
};
