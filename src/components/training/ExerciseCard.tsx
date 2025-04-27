import React, { useState } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SetRow } from "@/components/SetRow";
import { ExerciseSet } from "@/types/exercise";
import { useWeightUnit } from "@/context/WeightUnitContext";
import { ExerciseVolumeSparkline } from '@/components/metrics/ExerciseVolumeSparkline';
import { toast } from "@/components/ui/use-toast";
import { calculateSetVolume } from '@/utils/exerciseUtils';
import { exerciseHistoryData, getPreviousSessionData } from "@/constants/exerciseData";
import { convertWeight } from "@/utils/unitConversion";

interface LocalExerciseSet {
  weight: number;
  reps: number;
  restTime: number;
  completed: boolean;
  isEditing: boolean;
}

interface ExerciseCardProps {
  exercise: string;
  sets: LocalExerciseSet[];
  onAddSet: (exercise: string) => void;
  onCompleteSet: (exercise: string, index: number) => void;
  onRemoveSet: (exercise: string, index: number) => void;
  onEditSet: (exercise: string, index: number) => void;
  onSaveSet: (exercise: string, index: number) => void;
  onWeightChange: (exercise: string, index: number, value: string) => void;
  onRepsChange: (exercise: string, index: number, value: string) => void;
  onRestTimeChange: (exercise: string, index: number, value: string) => void;
  onWeightIncrement: (exercise: string, index: number, increment: number) => void;
  onRepsIncrement: (exercise: string, index: number, increment: number) => void;
  onRestTimeIncrement: (exercise: string, index: number, increment: number) => void;
  isActive: boolean;
  onShowRestTimer: () => void;
  onResetRestTimer: () => void;
}

export const ExerciseCard = ({
  exercise,
  sets,
  onAddSet,
  onCompleteSet,
  onRemoveSet,
  onEditSet,
  onSaveSet,
  onWeightChange,
  onRepsChange,
  onRestTimeChange,
  onWeightIncrement,
  onRepsIncrement,
  onRestTimeIncrement,
  isActive,
  onShowRestTimer,
  onResetRestTimer
}: ExerciseCardProps) => {
  const { weightUnit } = useWeightUnit();
  const [activeRestTimer, setActiveRestTimer] = useState<number | null>(null);

  const previousSession = getPreviousSessionData(exercise);
  const olderSession = exerciseHistoryData[exercise]?.[1] || previousSession;
  
  const previousSessionWeight = convertWeight(previousSession.weight, "lb", weightUnit);
  
  const weightDiff = previousSession.weight - olderSession.weight;
  const percentChange = olderSession.weight ? ((weightDiff / olderSession.weight) * 100).toFixed(1) : "0";
  const isImproved = weightDiff > 0;

  const currentVolume = (sets as unknown as ExerciseSet[]).reduce((total, set) => {
    return total + calculateSetVolume(set, exercise, undefined);
  }, 0);
  
  const previousVolume = previousSession.weight > 0 ? 
    previousSessionWeight * previousSession.reps * previousSession.sets : 0;
  
  const volumeDiff = (currentVolume - previousVolume);
  const volumePercentChange = previousVolume > 0 ? 
    ((volumeDiff / previousVolume) * 100).toFixed(1) : "0";
  
  const completedSetsCount = sets.filter(set => set.completed).length;
  const completionPercentage = sets.length > 0 ? (completedSetsCount / sets.length) * 100 : 0;
  
  const handleCompleteSet = (index: number) => {
    onCompleteSet(exercise, index);
    setActiveRestTimer(index);
    
    const restTime = sets[index]?.restTime || 60;
    console.log(`Set ${index + 1} completed with rest time: ${restTime}s`);
    
    onShowRestTimer();
    
    onResetRestTimer();
    
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    
    toast({
      description: `${exercise}: Set ${index + 1} logged successfully`
    });
  };

  const handleAutoAdvanceNext = (index: number) => {
    if (sets[index + 1] && !sets[index + 1].isEditing) {
      onEditSet(exercise, index + 1);
    }
  };
  
  const handleRestTimeUpdate = (time: number) => {
    if (sets.length > 0) {
      const currentSetIndex = sets.findIndex(set => !set.completed);
      if (currentSetIndex > 0) {
        onRestTimeChange(exercise, currentSetIndex - 1, time.toString());
      }
    }
  };

  const sessionVolumes = [
    ...((exerciseHistoryData[exercise] || []).slice(0, 3).reverse().map(s => {
      return convertWeight(s.weight, "lb", weightUnit) * s.reps * s.sets;
    })),
    currentVolume,
  ];
  
  const positiveTrend = volumeDiff > 0;
  const negativeTrend = volumeDiff < 0;

  return (
    <Card className={`bg-gray-900 border-gray-800 mb-4 transform transition-all duration-300 ${isActive ? "ring-1 ring-purple-500 scale-[1.01]" : ""}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="exercise-name">{exercise}</h3>
            <div className="exercise-detail">
              Last session: 
              <span className="mono-text ml-1">
                {previousSessionWeight} {weightUnit} × {previousSession.reps} × {previousSession.sets}
              </span>
            </div>
          </div>
          <Badge 
            variant="outline"
            className={`flex items-center gap-1 ${isImproved ? "text-green-300 border-green-500/30" : "text-red-300 border-red-500/30"}`}
          >
            {isImproved ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span className="mono-text">{Math.abs(parseFloat(percentChange))}%</span>
          </Badge>
        </div>
        
        <div className="mb-3">
          <Progress 
            value={completionPercentage} 
            className="h-1 bg-gray-800 [&>div]:bg-purple-500"
          />
        </div>
        
        <div className="flex items-center justify-between py-2 border-b border-gray-700 set-header">
          <div className="w-8 text-center">Set</div>
          <div className="flex-1 px-2">Weight ({weightUnit})</div>
          <div className="flex-1 px-2">Reps</div>
          <div className="flex-1 px-2">Rest</div>
          <div className="w-20"></div>
        </div>
        
        <div className="my-2">
          {sets.map((set, index) => (
            <SetRow 
              key={index}
              setNumber={index + 1}
              weight={set.weight}
              reps={set.reps}
              restTime={set.restTime}
              completed={set.completed}
              isEditing={set.isEditing}
              exerciseName={exercise}
              onComplete={() => {
                handleCompleteSet(index);
                setTimeout(() => handleAutoAdvanceNext(index), 550);
              }}
              onEdit={() => onEditSet(exercise, index)}
              onSave={() => onSaveSet(exercise, index)}
              onRemove={() => onRemoveSet(exercise, index)}
              onWeightChange={(e) => onWeightChange(exercise, index, e.target.value)}
              onRepsChange={(e) => onRepsChange(exercise, index, e.target.value)}
              onRestTimeChange={(e) => onRestTimeChange(exercise, index, e.target.value)}
              onWeightIncrement={(value) => onWeightIncrement(exercise, index, value)}
              onRepsIncrement={(value) => onRepsIncrement(exercise, index, value)}
              onRestTimeIncrement={(value) => onRestTimeIncrement(exercise, index, value)}
              weightUnit={weightUnit}
              onAutoAdvanceNext={() => handleAutoAdvanceNext(index)}
            />
          ))}
          
          <button 
            onClick={() => onAddSet(exercise)}
            className="w-full mt-3 py-3 flex items-center justify-center text-sm 
              bg-gradient-to-r from-purple-600 to-pink-500 
              hover:from-purple-700 hover:to-pink-600 
              text-white font-medium rounded-full 
              transition-all duration-300 
              transform hover:scale-[1.02] active:scale-[0.98] 
              shadow-lg hover:shadow-xl 
              group"
          >
            Add Set
          </button>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-800">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="volume-label flex items-center">
              Volume vs last session
              <ExerciseVolumeSparkline
                volumes={sessionVolumes}
                positive={positiveTrend}
                negative={negativeTrend}
              />
            </span>
            <div
              className={`${
                volumeDiff > 0 ? "text-green-300" : volumeDiff < 0 ? "text-red-300" : "text-gray-400"
              } volume-value font-mono animate-fade-in`}
              key={currentVolume}
            >
              {volumeDiff > 0 ? "+" : ""}
              {volumeDiff.toFixed(1)} {weightUnit} ({volumePercentChange}%)
            </div>
          </div>
          <Progress 
            value={
              currentVolume > 0 && previousVolume > 0
                ? Math.min((currentVolume / Math.max(previousVolume, 1)) * 100, 200)
                : 0
            }
            className={`h-1.5 bg-gray-800 ${
              currentVolume >= previousVolume
                ? "[&>div]:bg-green-500"
                : "[&>div]:bg-red-500"
            }`}
          />
        </div>
      </CardContent>
    </Card>
  );
};
