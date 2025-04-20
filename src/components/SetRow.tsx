import React from "react";
import { MinusCircle, PlusCircle, Save, Trash2, Edit, Check, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWeightUnit } from "@/context/WeightUnitContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { convertWeight, WeightUnit } from "@/utils/unitConversion";
import { isIsometricExercise, formatDuration, formatIsometricSet } from "@/utils/exerciseUtils";
import { useExerciseWeight } from '@/hooks/useExerciseWeight';
import { Exercise } from '@/types/exercise';
import { Tooltip } from '@/components/ui/tooltip';
import { cn } from "@/utils/cn";

interface SetRowProps {
  setNumber: number;
  weight: number;
  reps: number;
  duration?: number;
  restTime?: number;
  completed: boolean;
  isEditing: boolean;
  exerciseName: string;
  onComplete: () => void;
  onEdit: () => void;
  onSave: () => void;
  onRemove: () => void;
  onWeightChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRepsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDurationChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRestTimeChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onWeightIncrement: (value: number) => void;
  onRepsIncrement: (value: number) => void;
  onDurationIncrement?: (value: number) => void;
  onRestTimeIncrement?: (value: number) => void;
  weightUnit: string;
  currentVolume?: number;
  exerciseData?: Exercise;
  userWeight?: number;
}

export const SetRow = ({
  setNumber,
  weight,
  reps,
  duration = 0,
  restTime = 60,
  completed,
  isEditing,
  exerciseName,
  onComplete,
  onEdit,
  onSave,
  onRemove,
  onWeightChange,
  onRepsChange,
  onDurationChange,
  onRestTimeChange,
  onWeightIncrement,
  onRepsIncrement,
  onDurationIncrement,
  onRestTimeIncrement,
  weightUnit,
  currentVolume,
  exerciseData,
  userWeight,
}: SetRowProps) => {
  const { weightUnit: globalWeightUnit } = useWeightUnit();
  const isMobile = useIsMobile();
  const isIsometric = isIsometricExercise(exerciseName);
  
  const { 
    weight: calculatedWeight,
    isAutoWeight,
    weightSource,
    updateWeight,
    resetToAuto 
  } = useExerciseWeight({
    exercise: exerciseData,
    userWeight,
    defaultWeight: weight
  });

  const displayUnit = weightUnit || globalWeightUnit;
  const displayWeight = isEditing ? weight : (isAutoWeight ? calculatedWeight : weight);

  const formatRestTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRestTimeIncrement = (increment: number) => {
    if (onRestTimeIncrement) {
      onRestTimeIncrement(increment);
    }
  };

  const handleManualRestTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onRestTimeChange) {
      onRestTimeChange(e);
    }
  };

  const handleSetComplete = () => {
    onComplete();
  };

  return (
    <div className="grid grid-cols-[auto_3fr_3fr_3fr_2fr_2fr] items-center gap-2 py-3 px-2 border-b border-gray-800 transition-all duration-200">
      <div className="text-center font-medium text-gray-400">
        #{setNumber}
      </div>
      
      {isEditing ? (
        <>
          <div className="col-span-3 flex items-center gap-1">
            <button 
              type="button"
              onClick={() => onWeightIncrement(-1)} 
              className="h-11 w-11 flex items-center justify-center text-gray-400 hover:text-white bg-gray-800 rounded-full"
            >
              <MinusCircle size={isMobile ? 20 : 18} />
            </button>
            <Tooltip content={isAutoWeight ? `Auto-calculated from bodyweight (${userWeight}kg)` : "Manual weight"}>
              <Input 
                type="number"
                min="0"
                step="any"
                value={weight}
                onChange={(e) => {
                  onWeightChange(e);
                  updateWeight(Number(e.target.value));
                }}
                className={cn(
                  "workout-number-input text-center flex-1",
                  isAutoWeight && "italic text-gray-400"
                )}
                placeholder={isIsometric ? "Optional weight" : "Weight"}
              />
            </Tooltip>
            <button 
              type="button"
              onClick={() => onWeightIncrement(1)} 
              className="h-11 w-11 flex items-center justify-center text-gray-400 hover:text-white bg-gray-800 rounded-full"
            >
              <PlusCircle size={isMobile ? 20 : 18} />
            </button>
          </div>
          
          {isIsometric ? (
            <div className="col-span-3 flex items-center gap-1">
              <button 
                type="button"
                onClick={() => onDurationIncrement?.(-5)} 
                className="h-11 w-11 flex items-center justify-center text-gray-400 hover:text-white bg-gray-800 rounded-full"
              >
                <MinusCircle size={isMobile ? 20 : 18} />
              </button>
              <Input 
                type="number"
                min="0"
                step="5"
                value={duration}
                onChange={onDurationChange}
                className="workout-number-input text-center flex-1"
                placeholder="Duration (seconds)"
              />
              <button 
                type="button"
                onClick={() => onDurationIncrement?.(5)} 
                className="h-11 w-11 flex items-center justify-center text-gray-400 hover:text-white bg-gray-800 rounded-full"
              >
                <PlusCircle size={isMobile ? 20 : 18} />
              </button>
            </div>
          ) : (
            <div className="col-span-3 flex items-center gap-1">
              <button 
                type="button"
                onClick={() => onRepsIncrement(-1)} 
                className="h-11 w-11 flex items-center justify-center text-gray-400 hover:text-white bg-gray-800 rounded-full"
              >
                <MinusCircle size={isMobile ? 20 : 18} />
              </button>
              <Input 
                type="number"
                min="0"
                step="1"
                value={reps}
                onChange={onRepsChange}
                className="workout-number-input text-center flex-1"
                placeholder="Reps"
              />
              <button 
                type="button"
                onClick={() => onRepsIncrement(1)} 
                className="h-11 w-11 flex items-center justify-center text-gray-400 hover:text-white bg-gray-800 rounded-full"
              >
                <PlusCircle size={isMobile ? 20 : 18} />
              </button>
            </div>
          )}
          
          <div className="col-span-3 flex items-center gap-1">
            {onRestTimeIncrement && (
              <button 
                type="button"
                onClick={() => handleRestTimeIncrement(-5)} 
                className="h-11 w-11 flex items-center justify-center text-gray-400 hover:text-white bg-gray-800 rounded-full"
              >
                <MinusCircle size={isMobile ? 20 : 18} />
              </button>
            )}
            <Input 
              type="number"
              min="0"
              step="5"
              value={restTime || 60}
              onChange={handleManualRestTimeChange}
              disabled={!onRestTimeChange}
              className="workout-number-input text-center flex-1"
              onBlur={(e) => {
                if (parseInt(e.target.value) < 0 || e.target.value === '') {
                  if (onRestTimeChange) {
                    handleManualRestTimeChange({
                      target: { value: "0" }
                    } as React.ChangeEvent<HTMLInputElement>);
                  }
                }
              }}
            />
            {onRestTimeIncrement && (
              <button 
                type="button"
                onClick={() => handleRestTimeIncrement(5)} 
                className="h-11 w-11 flex items-center justify-center text-gray-400 hover:text-white bg-gray-800 rounded-full"
              >
                <PlusCircle size={isMobile ? 20 : 18} />
              </button>
            )}
          </div>
          
          <div className="col-span-2 flex justify-end gap-2">
            <Button
              size="icon"
              onClick={onSave}
              className="h-11 w-11 bg-blue-600/70 text-blue-100 hover:bg-blue-600"
            >
              <Save size={isMobile ? 20 : 18} />
            </Button>
            <Button
              size="icon"
              onClick={onRemove}
              className="h-11 w-11 bg-red-600/70 text-red-100 hover:bg-red-600"
            >
              <Trash2 size={isMobile ? 20 : 18} />
            </Button>
          </div>
        </>
      ) : (
        <>
          <Tooltip content={isAutoWeight ? `Auto-calculated from bodyweight (${userWeight}kg)` : "Manual weight"}>
            <div 
              className={cn(
                "flex gap-1 items-center px-3 py-2 rounded min-h-[44px] hover:bg-gray-800/70 cursor-pointer transition-all duration-200",
                isAutoWeight && "italic text-gray-400"
              )}
              onClick={onEdit}
            >
              <span className="font-medium">
                {displayWeight}
                {isAutoWeight && " (auto)"}
              </span>
              <span className="text-xs text-gray-400">{globalWeightUnit}</span>
            </div>
          </Tooltip>
          
          <div 
            className="flex gap-1 items-center px-3 py-2 rounded min-h-[44px] hover:bg-gray-800/70 cursor-pointer transition-all duration-200"
            onClick={onEdit}
          >
            {isIsometric ? (
              <span className="text-sm text-gray-400">
                {duration > 0 ? formatDuration(duration) : "Not set"} hold
              </span>
            ) : (
              <>
                <span className="font-medium">{reps}</span>
                <span className="text-xs text-gray-400">reps</span>
              </>
            )}
          </div>
          
          <div className="flex items-center justify-start gap-2 text-gray-400">
            <Timer size={16} className="text-purple-400" />
            <span className="font-mono text-sm">
              {formatRestTime(restTime)}
            </span>
            {currentVolume && (
              <span className="ml-2 text-sm text-emerald-400">
                Vol: {currentVolume} {weightUnit}
              </span>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            {completed ? (
              <Button
                size="icon"
                onClick={onEdit}
                className="h-11 w-11 bg-gray-700 text-gray-300 hover:bg-gray-600"
              >
                <Edit size={20} />
              </Button>
            ) : (
              <Button 
                size="icon"
                onClick={handleSetComplete}
                className="h-11 w-11 bg-gray-800 text-gray-400 hover:bg-green-700 hover:text-white transform transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Check size={20} />
              </Button>
            )}
            <Button
              size="icon"
              onClick={onRemove}
              className="h-11 w-11 bg-gray-700 text-gray-300 hover:bg-red-700 hover:text-white"
            >
              <Trash2 size={20} />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
