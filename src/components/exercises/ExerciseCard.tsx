import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, ArrowDownRight, PlusCircle } from 'lucide-react';
import { SetRow } from '@/components/SetRow';
import { Badge } from "@/components/ui/badge";
import { ExerciseHeader } from '@/components/ExerciseHeader';
import { useWeightUnit } from "@/context/WeightUnitContext";
import { useExercises } from "@/hooks/useExercises";
import { convertWeight, formatWeightWithUnit, WeightUnit } from "@/utils/unitConversion";

interface ExerciseHistoryData {
  [exerciseName: string]: {
    date: string;
    weight: number;
    reps: number;
    sets: number;
  }[];
}

interface ExerciseCardProps {
  exercise: string;
  sets: { weight: number; reps: number; restTime?: number; completed: boolean; isEditing?: boolean }[];
  onAddSet: (exerciseName: string) => void;
  onCompleteSet: (exerciseName: string, setIndex: number) => void;
  onRemoveSet: (exerciseName: string, setIndex: number) => void;
  onEditSet: (exerciseName: string, setIndex: number) => void;
  onSaveSet: (exerciseName: string, setIndex: number) => void;
  onWeightChange: (exerciseName: string, setIndex: number, value: string) => void;
  onRepsChange: (exerciseName: string, setIndex: number, value: string) => void;
  onRestTimeChange?: (exerciseName: string, setIndex: number, value: string) => void;
  onWeightIncrement: (exerciseName: string, setIndex: number, increment: number) => void;
  onRepsIncrement: (exerciseName: string, setIndex: number, increment: number) => void;
  onRestTimeIncrement?: (exerciseName: string, setIndex: number, increment: number) => void;
  isActive: boolean;
  onShowRestTimer: () => void;
}

const exerciseHistoryData: ExerciseHistoryData = {
  "Bench Press": [
    { date: "Apr 10", weight: 135, reps: 10, sets: 3 },
    { date: "Apr 3", weight: 130, reps: 10, sets: 3 },
    { date: "Mar 27", weight: 125, reps: 8, sets: 3 },
  ],
  "Squats": [
    { date: "Apr 9", weight: 185, reps: 8, sets: 3 },
    { date: "Apr 2", weight: 175, reps: 8, sets: 3 },
    { date: "Mar 26", weight: 165, reps: 8, sets: 3 },
  ],
  "Deadlift": [
    { date: "Apr 8", weight: 225, reps: 5, sets: 3 },
    { date: "Apr 1", weight: 215, reps: 5, sets: 3 },
    { date: "Mar 25", weight: 205, reps: 5, sets: 3 },
  ],
  "Pull-ups": [
    { date: "Apr 7", weight: 0, reps: 8, sets: 3 },
    { date: "Mar 31", weight: 0, reps: 7, sets: 3 },
    { date: "Mar 24", weight: 0, reps: 6, sets: 3 },
  ],
};

const getPreviousSessionData = (exerciseName: string) => {
  const history = exerciseHistoryData[exerciseName] || [];
  if (history.length > 0) {
    return history[0];
  }
  
  return { date: "N/A", weight: 0, reps: 0, sets: 0 };
};

const calculateSetVolume = (sets: { weight: number; reps: number; completed: boolean }[], weightUnit: string) => {
  return sets.reduce((total, set) => {
    if (set.completed) {
      if (set.weight > 0 && set.reps > 0) {
        return total + (set.weight * set.reps);
      }
    }
    return total;
  }, 0);
};

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
  onShowRestTimer
}: ExerciseCardProps) => {
  const { weightUnit } = useWeightUnit();
  const { exercises: dbExercises } = useExercises();
  
  const previousSession = getPreviousSessionData(exercise);
  const olderSession = exerciseHistoryData[exercise]?.[1] || previousSession;
  
  const previousSessionWeight = convertWeight(previousSession.weight, "lb", weightUnit);
  
  const weightDiff = previousSession.weight - olderSession.weight;
  const percentChange = olderSession.weight ? ((weightDiff / olderSession.weight) * 100).toFixed(1) : "0";
  const isImproved = weightDiff > 0;
  
  const currentVolume = calculateSetVolume(sets, weightUnit);
  
  const previousVolume = previousSession.weight > 0 ? 
    previousSessionWeight * previousSession.reps * previousSession.sets : 0;
  
  const volumeDiff = (currentVolume - previousVolume);
  const volumePercentChange = previousVolume > 0 ? 
    ((volumeDiff / previousVolume) * 100).toFixed(1) : "0";
  
  const completedSetsCount = sets.filter(set => set.completed).length;
  const completionPercentage = sets.length > 0 ? (completedSetsCount / sets.length) * 100 : 0;
  
  const [activeRestTimer, setActiveRestTimer] = React.useState<number | null>(null);
  
  const handleCompleteSet = (index: number) => {
    onCompleteSet(exercise, index);
    setActiveRestTimer(index);
    onShowRestTimer();
    
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };
  
  console.log(`Exercise: ${exercise}`);
  console.log(`Current volume: ${currentVolume}`);
  console.log(`Previous volume: ${previousVolume}`);
  console.log(`Volume diff: ${volumeDiff}`);
  console.log(`Volume % change: ${volumePercentChange}`);
  console.log(`Sets:`, sets);

  const calculateCurrentSetVolume = (set: { weight: number; reps: number }) => {
    return set.weight * set.reps;
  };
  
  return (
    <Card className={`relative overflow-hidden transition-all duration-300 ${
      isActive ? "ring-2 ring-purple-500/50" : "ring-1 ring-gray-800"
    }`}>
      <CardContent className="p-0">
        <ExerciseHeader
          exerciseName={exercise}
          lastSession={{
            weight: previousSessionWeight,
            reps: previousSession.reps,
            sets: previousSession.sets
          }}
          weightUnit={weightUnit}
        />
        
        <div className="px-4 pb-4">
          <Progress 
            value={completionPercentage} 
            className="h-1.5 mb-6 bg-gray-800/50 [&>div]:bg-gradient-to-r [&>div]:from-purple-500 [&>div]:to-pink-500"
          />
          
          <div className="flex items-center justify-between mb-4">
            <Badge 
              variant="outline"
              className={`flex items-center gap-1 ${
                volumeDiff >= 0 
                  ? "text-green-300 border-green-500/30" 
                  : "text-red-300 border-red-500/30"
              }`}
            >
              {volumeDiff >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
              <span className="font-mono">{Math.abs(parseFloat(volumePercentChange))}%</span>
            </Badge>
          </div>

          <div className="space-y-2">
            {sets.map((set, index) => (
              <SetRow 
                key={index}
                setNumber={index + 1}
                weight={set.weight}
                reps={set.reps}
                restTime={set.restTime}
                completed={set.completed}
                isEditing={set.isEditing || false}
                onComplete={() => handleCompleteSet(index)}
                onEdit={() => onEditSet(exercise, index)}
                onSave={() => onSaveSet(exercise, index)}
                onRemove={() => onRemoveSet(exercise, index)}
                onWeightChange={(e) => onWeightChange(exercise, index, e.target.value)}
                onRepsChange={(e) => onRepsChange(exercise, index, e.target.value)}
                onRestTimeChange={onRestTimeChange ? (e) => onRestTimeChange(exercise, index, e.target.value) : undefined}
                onWeightIncrement={(value) => onWeightIncrement(exercise, index, value)}
                onRepsIncrement={(value) => onRepsIncrement(exercise, index, value)}
                onRestTimeIncrement={onRestTimeIncrement ? (value) => onRestTimeIncrement(exercise, index, value) : undefined}
                weightUnit={weightUnit}
                currentVolume={calculateCurrentSetVolume(set)}
              />
            ))}
          </div>

          <Button 
            onClick={() => onAddSet(exercise)}
            className="w-full mt-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Set
          </Button>
          
          <div className="mt-4 pt-4 border-t border-gray-800">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400 font-medium">Volume vs last session</span>
              <span className={`font-mono ${volumeDiff >= 0 ? "text-green-400" : "text-red-400"}`}>
                {volumeDiff > 0 ? "+" : ""}{volumeDiff.toFixed(1)} {weightUnit}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
