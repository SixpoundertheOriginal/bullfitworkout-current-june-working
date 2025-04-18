import React from "react";
import { MinusCircle, PlusCircle, Save, Trash2, Edit, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWeightUnit } from "@/context/WeightUnitContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from "sonner";
import { RestTimerControls } from "./RestTimerControls";
import { convertWeight, WeightUnit } from "@/utils/unitConversion";

interface SetRowProps {
  setNumber: number;
  weight: number;
  reps: number;
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
  showRestTimer?: boolean;
  onRestTimerComplete?: () => void;
}

export const SetRow = ({
  setNumber,
  weight,
  reps,
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
  showRestTimer = false,
  onRestTimerComplete
}: SetRowProps) => {
  const { weightUnit: globalWeightUnit } = useWeightUnit();
  const isMobile = useIsMobile();
  const [restTime, setRestTime] = React.useState(90);
  const [isTimerActive, setIsTimerActive] = React.useState(true);
  const timerRef = React.useRef<NodeJS.Timeout>();
  
  React.useEffect(() => {
    if (showRestTimer && restTime > 0 && isTimerActive) {
      timerRef.current = setInterval(() => {
        setRestTime(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            if (onRestTimerComplete) onRestTimerComplete();
            
            if (navigator.vibrate) {
              navigator.vibrate(200);
            }
            
            toast.success("Rest period complete!", {
              style: {
                backgroundColor: "rgba(20, 20, 20, 0.9)",
                color: "white",
                border: "1px solid rgba(120, 120, 120, 0.3)",
              },
            });
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [showRestTimer, restTime, isTimerActive, onRestTimerComplete]);
  
  const displayWeight = weightUnit ? convertWeight(weight, weightUnit as WeightUnit, globalWeightUnit) : weight;
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 items-center gap-2 py-3 px-2 border-b border-gray-800 transition-all duration-200">
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
                  onClick={onComplete}
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
      
      {showRestTimer && (
        <div className="flex justify-end px-2">
          <RestTimerControls
            timeLeft={restTime}
            totalTime={90}
            isActive={isTimerActive}
            onPause={() => setIsTimerActive(false)}
            onResume={() => setIsTimerActive(true)}
            onReset={() => setRestTime(90)}
            onSkip={() => {
              if (onRestTimerComplete) onRestTimerComplete();
              setRestTime(0);
            }}
            className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-3"
          />
        </div>
      )}
    </div>
  );
};
