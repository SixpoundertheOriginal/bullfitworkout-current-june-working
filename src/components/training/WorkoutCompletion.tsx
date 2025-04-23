
import React from 'react';
import { Button } from "@/components/ui/button";
import { IntelligentMetricsDisplay } from '@/components/metrics/IntelligentMetricsDisplay';
import { ExerciseVolumeChart } from '@/components/metrics/ExerciseVolumeChart';
import { ExerciseSet } from "@/types/exercise";
import { useWeightUnit } from "@/context/WeightUnitContext";

interface WorkoutCompletionProps {
  exercises: Record<string, ExerciseSet[]>;
  intensity: number;
  efficiency: number;
  onComplete: () => void;
}

export const WorkoutCompletion = ({
  exercises,
  intensity,
  efficiency,
  onComplete
}: WorkoutCompletionProps) => {
  const { weightUnit } = useWeightUnit();

  return (
    <div className="mt-8 flex flex-col items-center">
      <div className="flex w-full">
        <Button
          className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-500 
            hover:from-green-700 hover:to-emerald-600 text-white font-medium 
            rounded-full shadow-lg hover:shadow-xl mb-4"
          onClick={onComplete}
        >
          Complete Workout
        </Button>
      </div>
      
      <IntelligentMetricsDisplay 
        exercises={exercises} 
        intensity={intensity}
        efficiency={efficiency}
      />
      
      <div className="mt-4 bg-gray-900/50 p-4 rounded-xl border border-gray-800 w-full">
        <ExerciseVolumeChart 
          exercises={exercises}
          weightUnit={weightUnit}
        />
      </div>
    </div>
  );
};
