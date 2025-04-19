
import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Dumbbell, Weight, Zap } from "lucide-react";
import { useWeightUnit } from "@/context/WeightUnitContext";
import { convertWeight, formatWeightWithUnit } from "@/utils/unitConversion";

interface ExerciseSet {
  id: string;
  exercise_name: string;
  workout_id: string;
  weight: number;
  reps: number;
  set_number: number;
  completed: boolean;
}

interface WorkoutMetricsSummaryProps {
  exerciseSets: ExerciseSet[];
  className?: string;
}

export const WorkoutMetricsSummary = ({ exerciseSets, className = "" }: WorkoutMetricsSummaryProps) => {
  const { weightUnit } = useWeightUnit();
  
  const metrics = useMemo(() => {
    if (!exerciseSets || exerciseSets.length === 0) {
      return {
        totalSets: 0,
        completedSets: 0,
        totalExercises: 0,
        totalVolume: 0,
        averageWeight: 0,
        totalReps: 0,
        highestWeight: 0,
        volumePerExercise: {}
      };
    }
    
    const uniqueExercises = new Set(exerciseSets.map(set => set.exercise_name));
    const totalSets = exerciseSets.length;
    const completedSets = exerciseSets.filter(set => set.completed).length;
    
    let totalVolume = 0;
    let totalWeight = 0;
    let totalReps = 0;
    let highestWeight = 0;
    const volumePerExercise: Record<string, number> = {};
    
    exerciseSets.forEach(set => {
      if (set.completed) {
        const convertedWeight = convertWeight(set.weight, "lb", weightUnit);
        const setVolume = convertedWeight * set.reps;
        
        totalVolume += setVolume;
        totalWeight += convertedWeight;
        totalReps += set.reps;
        
        if (convertedWeight > highestWeight) {
          highestWeight = convertedWeight;
        }
        
        // Track volume per exercise
        if (!volumePerExercise[set.exercise_name]) {
          volumePerExercise[set.exercise_name] = 0;
        }
        volumePerExercise[set.exercise_name] += setVolume;
      }
    });
    
    const averageWeight = completedSets > 0 ? totalWeight / completedSets : 0;
    
    return {
      totalSets,
      completedSets,
      totalExercises: uniqueExercises.size,
      totalVolume,
      averageWeight,
      totalReps,
      highestWeight,
      volumePerExercise
    };
  }, [exerciseSets, weightUnit]);
  
  return (
    <Card className={`bg-gray-900 border-gray-800 ${className}`}>
      <CardContent className="p-4">
        <h3 className="font-medium mb-3 flex items-center gap-2 text-purple-400">
          <BarChart3 size={18} />
          Workout Summary
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Total Volume</div>
              <div className="text-xl font-medium">
                {Math.round(metrics.totalVolume * 10) / 10} <span className="text-sm text-gray-400">{weightUnit}</span>
              </div>
            </div>
            <div className="p-2 bg-purple-500/20 rounded-full text-purple-400">
              <Weight size={18} />
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Total Sets</div>
              <div className="text-xl font-medium">
                {metrics.completedSets}/{metrics.totalSets}
              </div>
            </div>
            <div className="p-2 bg-purple-500/20 rounded-full text-purple-400">
              <Dumbbell size={18} />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-800/50 rounded-lg p-2 text-center">
            <div className="text-sm text-gray-400">Avg Weight</div>
            <div className="text-lg font-mono">
              {Math.round(metrics.averageWeight * 10) / 10}
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-2 text-center">
            <div className="text-sm text-gray-400">Total Reps</div>
            <div className="text-lg font-mono">
              {metrics.totalReps}
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-2 text-center">
            <div className="text-sm text-gray-400">Max Weight</div>
            <div className="text-lg font-mono">
              {Math.round(metrics.highestWeight * 10) / 10}
            </div>
          </div>
        </div>
        
        {metrics.totalExercises > 0 && (
          <div className="mt-4">
            <div className="text-sm text-gray-400 mb-2">Volume Distribution</div>
            {Object.entries(metrics.volumePerExercise).map(([exercise, volume]) => (
              <div key={exercise} className="mb-2">
                <div className="flex justify-between text-sm">
                  <span>{exercise}</span>
                  <span className="font-mono">{Math.round(volume * 10) / 10}</span>
                </div>
                <div className="h-1.5 bg-gray-800 rounded-full mt-1 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                    style={{ 
                      width: `${Math.min(100, (volume / metrics.totalVolume) * 100)}%` 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
