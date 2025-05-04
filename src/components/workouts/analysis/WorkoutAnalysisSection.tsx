
import React from 'react';
import { Card } from '@/components/ui/card';
import { WorkoutDensityChart } from '@/components/metrics/WorkoutDensityChart';
import { MuscleFocusChart } from '@/components/metrics/MuscleFocusChart';
import { useWeightUnit } from '@/context/WeightUnitContext';
import { Activity } from 'lucide-react';
import { processWorkoutMetrics } from '@/utils/workoutMetricsProcessor';

interface WorkoutAnalysisSectionProps {
  workout: {
    id: string;
    name: string;
    training_type: string;
    start_time: string;
    duration: number;
  };
  exerciseSets: Record<string, any>;
  muscleFocus: Record<string, number>;
  totalVolume: number;
  activeWorkoutTime: number;
  totalRestTime: number;
  densityMetrics: {
    setsPerMinute: number;
    volumePerMinute: number;
    overallDensity: number;
    activeOnlyDensity: number;
    formattedOverallDensity: string;
    formattedActiveOnlyDensity: string;
  };
}

export const WorkoutAnalysisSection: React.FC<WorkoutAnalysisSectionProps> = ({
  workout,
  exerciseSets,
  muscleFocus,
  totalVolume,
  activeWorkoutTime,
  totalRestTime,
  densityMetrics
}) => {
  const { weightUnit } = useWeightUnit();
  
  // Calculate density metrics if not provided or fallback to zero
  // This properly calculates volume / duration as requested
  const overallDensity = densityMetrics?.overallDensity ?? 
    (workout.duration > 0 ? totalVolume / workout.duration : 0);
  
  const activeOnlyDensity = densityMetrics?.activeOnlyDensity ?? 
    (activeWorkoutTime > 0 ? totalVolume / activeWorkoutTime : 0);
    
  // Log the density calculations for debugging
  console.log(`WorkoutAnalysisSection - Density calculations:
    - Total Volume: ${totalVolume} ${weightUnit}
    - Duration: ${workout.duration} minutes
    - Active Time: ${activeWorkoutTime} minutes
    - Rest Time: ${totalRestTime} minutes
    - Overall Density: ${overallDensity.toFixed(2)} ${weightUnit}/min
    - Active-Only Density: ${activeOnlyDensity.toFixed(2)} ${weightUnit}/min
  `);
    
  // If metrics provides muscleFocus, use it, otherwise use the prop
  const muscleGroups = muscleFocus;

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
              restTime={totalRestTime}
              totalVolume={totalVolume}
              weightUnit={weightUnit}
              overallDensity={overallDensity}
              activeOnlyDensity={activeOnlyDensity}
            />
          </div>
        </div>
      </Card>

      <Card className="bg-gray-900/80 border-gray-800">
        <div className="p-4">
          <h3 className="text-sm mb-4">Muscle Focus Distribution</h3>
          <MuscleFocusChart muscleGroups={muscleGroups} />
        </div>
      </Card>
    </div>
  );
};
