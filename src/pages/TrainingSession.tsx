import React, { useState, useEffect, useRef } from "react";
import { 
  ArrowLeft, 
  ArrowUpRight, 
  ArrowDownRight, 
  Plus, 
  Check, 
  Dumbbell, 
  Timer, 
  BarChart3, 
  Heart, 
  ChevronRight,
  X,
  Trash2,
  Save,
  Edit,
  MinusCircle,
  PlusCircle,
  Weight
} from "lucide-react";
import { TrainingTypeTag, trainingTypes } from "@/components/TrainingTypeTag";
import { useElementVisibility } from "@/hooks/useElementVisibility";
import { useIsMobile } from "@/hooks/use-mobile";
import { TopRestTimer } from '@/components/TopRestTimer';
import { EmptyWorkoutState } from "@/components/EmptyWorkoutState";
import { useWorkoutMetrics } from "@/hooks/useWorkoutMetrics";
import { IntelligentMetricsDisplay } from "@/components/metrics/IntelligentMetricsDisplay";
import { ExerciseVolumeChart } from '@/components/metrics/ExerciseVolumeChart';
import { SmartExerciseFAB } from '@/components/SmartExerciseFAB';
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useWeightUnit } from "@/context/WeightUnitContext";
import { supabase } from "@/integrations/supabase/client";
import { Exercise, ExerciseSet } from "@/types/exercise";
import { convertWeight } from "@/utils/unitConversion";
import { WeightUnitToggle } from "@/components/WeightUnitToggle";
import { WorkoutMetrics } from "@/components/WorkoutMetrics";
import { SetRow } from "@/components/SetRow";
import { useExercises } from "@/hooks/useExercises";
import { AddExerciseBar } from "@/components/AddExerciseBar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/sonner";
import { ExerciseVolumeSparkline } from "@/components/metrics/ExerciseVolumeSparkline";

interface LocationState {
  trainingType?: string;
  [key: string]: any;
}

const exerciseHistoryData = {
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

const getPreviousSessionData = (exerciseName) => {
  const history = exerciseHistoryData[exerciseName] || [];
  if (history.length > 0) {
    return history[0];
  }
  
  return { date: "N/A", weight: 0, reps: 0, sets: 0 };
};

const calculateSetVolume = (sets, weightUnit) => {
  return sets.reduce((total, set) => {
    if (set.completed) {
      if (set.weight > 0 && set.reps > 0) {
        return total + (set.weight * set.reps);
      }
    }
    return total;
  }, 0);
};

const ExerciseCard = ({ 
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
}) => {
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
    
    onResetRestTimer();
    
    if (navigator.vibrate) {
      navigator.vibrate([50]);
    }
    
    toast.success(`${exercise}: Set ${index + 1} logged successfully`, {
      style: {
        backgroundColor: "rgba(20, 20, 20, 0.9)",
        color: "white",
        border: "1px solid rgba(120, 120, 120, 0.3)",
      },
      id: `set-complete-${exercise}-${index}`,
    });
  };

  const handleAutoAdvanceNext = (index: number) => {
    if (sets[index + 1] && sets[index + 1].isEditing) {
      onEditSet(exercise, index + 1);
    }
  };

  console.log(`Exercise: ${exercise}`);
  console.log(`Current volume: ${currentVolume}`);
  console.log(`Previous volume: ${previousVolume}`);
  console.log(`Volume diff: ${volumeDiff}`);
  console.log(`Volume % change: ${volumePercentChange}`);
  console.log(`Sets:`, sets);
  
  // Collect session volumes for sparkline: get up to 4 historical + current
  const sessionVolumes = [
    ...((exerciseHistoryData[exercise] || []).slice(0, 3).reverse().map(s => {
      // Convert to user's weightUnit for fair visual trend
      return convertWeight(s.weight, "lb", weightUnit) * s.reps * s.sets;
    })),
    currentVolume,
  ];
  // The most recent value is at the END of array

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
                onCompleteSet(exercise, index);
                setTimeout(() => handleAutoAdvanceNext(index), 550);
                onShowRestTimer();
              }}
              onEdit={() => onEditSet(exercise, index)}
              onSave={() => onSaveSet(exercise, index)}
              onRemove={() => onRemoveSet(exercise, index)}
              onWeightChange={(e) => onWeightChange(exercise, index, e.target.value)}
              onRepsChange={(e) => onRepsChange(exercise, index, e.target.value)}
              onRestTimeChange={(e) => onRestTimeChange && onRestTimeChange(exercise, index, e.target.value)}
              onWeightIncrement={(value) => onWeightIncrement(exercise, index, value)}
              onRepsIncrement={(value) => onRepsIncrement(exercise, index, value)}
              onRestTimeIncrement={(value) => onRestTimeIncrement && onRestTimeIncrement(exercise, index, value)}
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
            <PlusCircle 
              size={24} 
              className="mr-2 group-hover:rotate-90 transition-transform duration-300" 
            />
            Add Set
          </button>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-800">
          <div className="flex justify-between items-center text-sm mb-2">
            <span className="volume-label flex items-center">
              Volume vs last session
              {/* Sparkline */}
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

const TrainingSession = () => {
  // ... rest of code remains unchanged
};

export default TrainingSession;
