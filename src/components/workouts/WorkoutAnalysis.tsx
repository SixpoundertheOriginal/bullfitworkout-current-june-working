
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkoutDensityChart } from '@/components/metrics/WorkoutDensityChart';
import { TimeOfDayChart } from '@/components/metrics/TimeOfDayChart';
import { MuscleGroupChart } from '@/components/metrics/MuscleGroupChart';

interface WorkoutAnalysisProps {
  metrics: {
    duration: number;
    totalVolume: number;
    timeDistribution: {
      activeTime: number;
      restTime: number;
    };
    densityMetrics: {
      overallDensity: number;
      activeOnlyDensity: number;
    };
    intensity: number;
    efficiency: number;
    durationByTimeOfDay: {
      morning: number;
      afternoon: number;
      evening: number;
      night: number;
    };
    muscleFocus: Record<string, number>;
  };
  weightUnit: string;
}

export const WorkoutAnalysis: React.FC<WorkoutAnalysisProps> = React.memo(({
  metrics,
  weightUnit
}) => {
  const hasTimeOfDayData = Object.values(metrics.durationByTimeOfDay).some(value => value > 0);

  return (
    <div className="space-y-6">
      {/* Workout Density & Time Distribution */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Workout Density Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-60 mb-4" aria-label="Workout density analysis chart">
            <WorkoutDensityChart
              totalTime={metrics.duration}
              activeTime={metrics.timeDistribution.activeTime}
              restTime={metrics.timeDistribution.restTime}
              totalVolume={metrics.totalVolume}
              weightUnit={weightUnit}
              overallDensity={metrics.densityMetrics.overallDensity}
              activeOnlyDensity={metrics.densityMetrics.activeOnlyDensity}
              height={220}
            />
          </div>
          
          {/* Intensity & Efficiency metrics */}
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div className="p-4 rounded-md bg-gray-800/50 border border-gray-700">
              <div className="text-sm text-gray-400 mb-1">Intensity</div>
              <div className="text-lg font-medium">{metrics.intensity.toFixed(1)}%</div>
            </div>
            <div className="p-4 rounded-md bg-gray-800/50 border border-gray-700">
              <div className="text-sm text-gray-400 mb-1">Efficiency</div>
              <div className="text-lg font-medium">{metrics.efficiency.toFixed(1)}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time of Day Chart */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Time of Day Analysis</CardTitle>
        </CardHeader>
        <CardContent className="h-60">
          {hasTimeOfDayData ? (
            <div aria-label="Time of Day distribution chart">
              <TimeOfDayChart
                durationByTimeOfDay={metrics.durationByTimeOfDay}
                height={200}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              No time-of-day data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Muscle Focus */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Muscle Group Focus</CardTitle>
        </CardHeader>
        <CardContent className="h-60" aria-label="Muscle Group Focus chart">
          <MuscleGroupChart muscleFocus={metrics.muscleFocus} height={200} />
        </CardContent>
      </Card>
    </div>
  );
});

WorkoutAnalysis.displayName = 'WorkoutAnalysis';
