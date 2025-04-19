
import React from 'react';
import { CircularProgress } from '@/components/ui/circular-progress';
import { Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkoutIntensityGaugeProps {
  intensity: number;
  className?: string;
}

export const WorkoutIntensityGauge = ({ intensity, className }: WorkoutIntensityGaugeProps) => {
  const getIntensityColor = () => {
    if (intensity >= 80) return 'text-red-500';
    if (intensity >= 60) return 'text-orange-500';
    if (intensity >= 40) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      <div className="relative">
        <CircularProgress 
          value={intensity} 
          size={80}
          className={cn("[&>circle]:text-gray-700", `[&>circle:last-child]:${getIntensityColor()}`)}
        >
          <Gauge className={cn("w-6 h-6 absolute inset-0 m-auto", getIntensityColor())} />
        </CircularProgress>
      </div>
      <div className="mt-2 text-center">
        <p className="text-sm font-medium text-gray-400">Intensity</p>
        <p className={cn("text-2xl font-semibold", getIntensityColor())}>
          {intensity}%
        </p>
      </div>
    </div>
  );
};
