
import React from 'react';
import { ExerciseVolumeCard } from './ExerciseVolumeCard';
import { WorkoutIntensityGauge } from './WorkoutIntensityGauge';
import { WorkoutEfficiencyScore } from './WorkoutEfficiencyScore';
import { cn } from '@/lib/utils';

interface IntelligentMetricsDisplayProps {
  volumeData: {
    exerciseName: string;
    volume: number;
    trend: 'increasing' | 'decreasing' | 'stable' | 'fluctuating';
    percentChange: number;
  }[];
  intensity: number;
  efficiency: number;
  className?: string;
}

export const IntelligentMetricsDisplay = ({
  volumeData,
  intensity,
  efficiency,
  className
}: IntelligentMetricsDisplayProps) => {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {volumeData.map((data, index) => (
          <ExerciseVolumeCard
            key={index}
            exerciseName={data.exerciseName}
            volume={data.volume}
            trend={data.trend}
            percentChange={data.percentChange}
          />
        ))}
      </div>
      
      <div className="flex flex-wrap gap-4 justify-around items-center">
        <WorkoutIntensityGauge intensity={intensity} />
        <WorkoutEfficiencyScore score={efficiency} />
      </div>
    </div>
  );
};
