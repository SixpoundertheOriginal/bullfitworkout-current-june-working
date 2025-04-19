
import React from "react";
import { MinusCircle, PlusCircle, Save, Trash2, Edit, Check, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWeightUnit } from "@/context/WeightUnitContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { convertWeight, WeightUnit } from "@/utils/unitConversion";

interface SetRowProps {
  setNumber: number;
  weight: number;
  reps: number;
  restTime?: number; // New prop for rest time
  completed: boolean;
  isEditing: boolean;
  onComplete: () => void;
  onEdit: () => void;
  onSave: () => void;
  onRemove: () => void;
  onWeightChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRepsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onWeightIncrement: (value: number) => void;
  onRepsIncrement: (value: number) => void;
  weightUnit: string;
}

export const SetRow = ({
  setNumber,
  weight,
  reps,
  restTime,
  completed,
  isEditing,
  onComplete,
  onEdit,
  onSave,
  onRemove,
  onWeightChange,
  onRepsChange,
  onWeightIncrement,
  onRepsIncrement,
  weightUnit,
}: SetRowProps) => {
  const { weightUnit: globalWeightUnit } = useWeightUnit();
  const isMobile = useIsMobile();
  
  const displayUnit = weightUnit || globalWeightUnit;
  const displayWeight = weight > 0 ? convertWeight(weight, weightUnit as WeightUnit, globalWeightUnit) : 0;
  
  const formatRestTime = (seconds?: number) => {
    if (!seconds) return "--:--";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleSetComplete = () => {
    onComplete();
  };
  
  return (
    <div className="grid grid-cols-14 items-center gap-2 py-3 px-2 border-b border-gray-800 transition-all duration-200">
      <div className="col-span-1 text-center font-medium text-gray-400">
        #{setNumber}
      </div>
      
      {isEditing ? (
        <>
          <div className="col-span-5 flex items-center gap-1">
            <button 
              onClick={() => onWeightIncrement(-1)} 
              className="h-11 w-11 flex items-center justify-center text-gray-400 hover:text-white bg-gray-800 rounded-full"
            >
              <MinusCircle size={isMobile ? 20 : 18} />
            </button>
            <Input 
              type="number"
              value={weight}
              onChange={onWeightChange}
              className="workout-number-input text-center flex-1"
            />
            <button 
              onClick={() => onWeightIncrement(1)} 
              className="h-11 w-11 flex items-center justify-center text-gray-400 hover:text-white bg-gray-800 rounded-full"
            >
              <PlusCircle size={isMobile ? 20 : 18} />
            </button>
          </div>
          
          <div className="col-span-4 flex items-center gap-1">
            <button 
              onClick={() => onRepsIncrement(-1)} 
              className="h-11 w-11 flex items-center justify-center text-gray-400 hover:text-white bg-gray-800 rounded-full"
            >
              <MinusCircle size={isMobile ? 20 : 18} />
            </button>
            <Input 
              type="number"
              value={reps}
              onChange={onRepsChange}
              className="workout-number-input text-center flex-1"
            />
            <button 
              onClick={() => onRepsIncrement(1)} 
              className="h-11 w-11 flex items-center justify-center text-gray-400 hover:text-white bg-gray-800 rounded-full"
            >
              <PlusCircle size={isMobile ? 20 : 18} />
            </button>
          </div>
          
          {/* Rest time column (read-only in edit mode) */}
          <div className="col-span-2 flex items-center justify-center gap-2 text-gray-400">
            <Timer size={16} />
            <span className="font-mono text-sm">{formatRestTime(restTime)}</span>
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
          <div className="col-span-5">
            <button 
              onClick={onEdit}
              className="w-full flex gap-1 items-center hover:bg-gray-800 px-3 py-2 rounded min-h-[44px]"
            >
              <span className="font-medium">{displayWeight}</span>
              <span className="text-xs text-gray-400">{globalWeightUnit}</span>
            </button>
          </div>
          
          <div className="col-span-4">
            <button 
              onClick={onEdit}
              className="w-full flex gap-1 items-center hover:bg-gray-800 px-3 py-2 rounded min-h-[44px]"
            >
              <span className="font-medium">{reps}</span>
              <span className="text-xs text-gray-400">reps</span>
            </button>
          </div>
          
          {/* Rest time column */}
          <div className="col-span-2 flex items-center justify-center gap-2">
            <Timer size={16} className="text-purple-400" />
            <span className="font-mono text-sm">
              {formatRestTime(restTime)}
            </span>
          </div>
          
          <div className="col-span-2 flex justify-end gap-2">
            {completed ? (
              <Button
                size="icon"
                onClick={onEdit}
                className="h-11 w-11 bg-gray-700 text-gray-300 hover:bg-gray-600"
              >
                <Edit size={isMobile ? 20 : 18} />
              </Button>
            ) : (
              <Button 
                size="icon"
                onClick={handleSetComplete}
                className="h-11 w-11 bg-gray-800 text-gray-400 hover:bg-green-700 hover:text-white transform transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Check size={isMobile ? 20 : 18} />
              </Button>
            )}
            <Button
              size="icon"
              onClick={onRemove}
              className="h-11 w-11 bg-gray-700 text-gray-300 hover:bg-red-700 hover:text-white"
            >
              <Trash2 size={isMobile ? 20 : 18} />
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
