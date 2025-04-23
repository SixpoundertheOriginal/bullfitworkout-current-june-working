import React, { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart3, Dumbbell, Weight, Zap, Info } from "lucide-react";
import { useWeightUnit } from "@/context/WeightUnitContext";
import { convertWeight, formatWeightWithUnit } from "@/utils/unitConversion";
import { isBodyweightExercise, isIsometricExercise } from "@/utils/exerciseUtils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { theme } from "@/lib/theme";
import { typography } from "@/lib/typography";
import { cn } from "@/lib/utils";

interface ExerciseSet {
  id: string;
  exercise_name: string;
  workout_id: string;
  weight: number;
  reps: number;
  set_number: number;
  completed: boolean;
  duration?: number;
}

interface WorkoutMetricsSummaryProps {
  exerciseSets: ExerciseSet[];
  className?: string;
  userBodyweight?: number;
}

export const WorkoutMetricsSummary = ({ exerciseSets, className = "", userBodyweight = 70 }: WorkoutMetricsSummaryProps) => {
  const { weightUnit } = useWeightUnit();
  
  const metrics = useMemo(() => {
    if (!exerciseSets || exerciseSets.length === 0) {
      return {
        totalSets: 0,
        completedSets: 0,
        totalExercises: 0,
        totalVolume: 0,
        effortVolume: 0,
        hasBodyweightExercises: false,
        hasIsometricExercises: false,
        averageWeight: 0,
        totalReps: 0,
        highestWeight: 0,
        volumePerExercise: {},
        exerciseTypes: { weighted: 0, bodyweight: 0, isometric: 0 }
      };
    }
    
    const uniqueExercises = new Set(exerciseSets.map(set => set.exercise_name));
    const totalSets = exerciseSets.length;
    const completedSets = exerciseSets.filter(set => set.completed).length;
    
    let totalVolume = 0;
    let effortVolume = 0;
    let totalWeight = 0;
    let totalReps = 0;
    let highestWeight = 0;
    let hasBodyweightExercises = false;
    let hasIsometricExercises = false;
    
    const volumePerExercise: Record<string, { standard: number, effort: number }> = {};
    const exerciseTypes = { weighted: 0, bodyweight: 0, isometric: 0 };
    
    const getLoadFactor = (exerciseName: string) => {
      const factors: Record<string, number> = {
        "Pull-ups": 1.0,
        "Push-ups": 0.65,
        "Plank": 0.6,
        "Leg Raises": 0.5
      };
      
      for (const [key, factor] of Object.entries(factors)) {
        if (exerciseName.toLowerCase().includes(key.toLowerCase())) {
          return factor;
        }
      }
      return 0.5;
    };
    
    const exerciseSetsMap: Record<string, ExerciseSet[]> = {};
    exerciseSets.forEach(set => {
      if (!exerciseSetsMap[set.exercise_name]) {
        exerciseSetsMap[set.exercise_name] = [];
      }
      exerciseSetsMap[set.exercise_name].push(set);
      
      if (isIsometricExercise(set.exercise_name)) {
        hasIsometricExercises = true;
        exerciseTypes.isometric++;
      } else if (isBodyweightExercise(set.exercise_name)) {
        hasBodyweightExercises = true;
        exerciseTypes.bodyweight++;
      } else {
        exerciseTypes.weighted++;
      }
    });
    
    Object.entries(exerciseSetsMap).forEach(([exerciseName, sets]) => {
      if (!volumePerExercise[exerciseName]) {
        volumePerExercise[exerciseName] = { standard: 0, effort: 0 };
      }
      
      sets.forEach(set => {
        if (set.completed) {
          const loadFactor = getLoadFactor(exerciseName);
          const convertedWeight = convertWeight(set.weight, "lb", weightUnit);
          
          const standardVolume = convertedWeight > 0 && set.reps > 0 ? 
            convertedWeight * set.reps : 0;
          
          let effortBasedVolume = 0;
          
          if (isIsometricExercise(exerciseName) && set.duration) {
            const effectiveWeight = convertedWeight > 0 ? 
              convertedWeight : convertWeight(userBodyweight, "kg", weightUnit) * loadFactor;
            
            effortBasedVolume = effectiveWeight * set.duration / 10;
          } else if (isBodyweightExercise(exerciseName) && set.reps > 0) {
            effortBasedVolume = convertWeight(userBodyweight, "kg", weightUnit) * 
              set.reps * loadFactor;
          } else if (convertedWeight > 0 && set.reps > 0) {
            effortBasedVolume = standardVolume;
          }
          
          totalVolume += standardVolume;
          effortVolume += effortBasedVolume;
          totalWeight += convertedWeight;
          totalReps += set.reps || 0;
          
          if (convertedWeight > highestWeight) {
            highestWeight = convertedWeight;
          }
          
          volumePerExercise[exerciseName].standard += standardVolume;
          volumePerExercise[exerciseName].effort += effortBasedVolume;
        }
      });
    });
    
    const averageWeight = completedSets > 0 ? totalWeight / completedSets : 0;
    
    return {
      totalSets,
      completedSets,
      totalExercises: uniqueExercises.size,
      totalVolume,
      effortVolume,
      hasBodyweightExercises,
      hasIsometricExercises,
      averageWeight,
      totalReps,
      highestWeight,
      volumePerExercise,
      exerciseTypes
    };
  }, [exerciseSets, weightUnit, userBodyweight]);
  
  return (
    <Card className={`bg-gray-900 border-gray-800 ${className}`}>
      <CardContent className="p-4">
        <h3 className={cn("mb-3 flex items-center gap-2", theme.colors.accent.purple, typography.headings.h3)}>
          <BarChart3 size={18} />
          Workout Summary
        </h3>
        
        <div className="grid grid-cols-2 gap-4 mb-3">
          <div className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between">
            <div>
              <div className={cn("flex items-center gap-1", typography.text.secondary, "text-sm")}>
                {metrics.hasBodyweightExercises || metrics.hasIsometricExercises ? (
                  <>
                    <span>Effort Volume</span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span><Info size={14} className={theme.colors.accent.purple} /></span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-gray-800 border-gray-700 text-white">
                          <p className="max-w-sm">
                            Includes estimated load for bodyweight and isometric exercises
                            based on {userBodyweight}kg bodyweight
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </>
                ) : (
                  "Total Volume"
                )}
              </div>
              <div className={cn("text-xl", typography.text.primary)}>
                {Math.round(metrics.hasBodyweightExercises || metrics.hasIsometricExercises ? 
                  metrics.effortVolume : metrics.totalVolume * 10) / 10} <span className={typography.text.secondary}>{weightUnit}</span>
              </div>
              {(metrics.hasBodyweightExercises || metrics.hasIsometricExercises) && (
                <div className={cn("mt-1", typography.text.muted, "text-xs")}>
                  Based on body weight and exercise type
                </div>
              )}
            </div>
            <div className="p-2 bg-purple-500/20 rounded-full text-purple-400">
              <Weight size={18} />
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-3 flex items-center justify-between">
            <div>
              <div className={cn(typography.text.secondary, "text-sm")}>Total Sets</div>
              <div className={cn("text-xl", typography.text.primary)}>
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
            <div className={cn("text-sm", typography.text.secondary)}>Avg Weight</div>
            <div className={cn("font-mono", typography.text.primary, "text-lg")}>
              {Math.round(metrics.averageWeight * 10) / 10}
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-2 text-center">
            <div className={cn("text-sm", typography.text.secondary)}>Total Reps</div>
            <div className={cn("font-mono", typography.text.primary, "text-lg")}>
              {metrics.totalReps}
            </div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-2 text-center">
            <div className={cn("text-sm", typography.text.secondary)}>Max Weight</div>
            <div className={cn("font-mono", typography.text.primary, "text-lg")}>
              {Math.round(metrics.highestWeight * 10) / 10}
            </div>
          </div>
        </div>
        
        {metrics.totalExercises > 0 && (
          <div className="mt-4">
            <div className={cn("mb-2", typography.text.secondary, "text-sm")}>Volume Distribution</div>
            {Object.entries(metrics.volumePerExercise).map(([exercise, volumes]) => {
              const displayVolume = metrics.hasBodyweightExercises || metrics.hasIsometricExercises ? 
                volumes.effort : volumes.standard;
                
              return (
                <div key={exercise} className="mb-2">
                  <div className="flex justify-between text-sm">
                    <span className={typography.text.primary}>{exercise}</span>
                    <span className={cn("font-mono", typography.text.primary)}>{Math.round(displayVolume * 10) / 10}</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full mt-1 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                      style={{ 
                        width: `${Math.min(100, (displayVolume / (metrics.hasBodyweightExercises || metrics.hasIsometricExercises ? 
                          metrics.effortVolume : metrics.totalVolume)) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
