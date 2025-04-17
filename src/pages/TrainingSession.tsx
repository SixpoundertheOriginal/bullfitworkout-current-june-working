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
import { useElementVisibility } from "@/hooks/useElementVisibility";

interface LocationState {
  trainingType?: string;
  [key: string]: any;
}

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Exercise, ExerciseSet } from "@/types/exercise";
import { supabase } from "@/integrations/supabase/client";
import { ExerciseAutocomplete } from "@/components/ExerciseAutocomplete";
import { WeightUnitToggle } from "@/components/WeightUnitToggle";
import { useWeightUnit } from "@/context/WeightUnitContext";
import { convertWeight, formatWeightWithUnit, WeightUnit } from "@/utils/unitConversion";
import { ExerciseFAB } from "@/components/ExerciseFAB";
import { RestTimer } from "@/components/RestTimer";
import { WorkoutMetrics } from "@/components/WorkoutMetrics";

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

const SetRow = ({ 
  setNumber, 
  weight, 
  reps, 
  completed, 
  onComplete, 
  onEdit, 
  onRemove, 
  isEditing, 
  onSave, 
  onWeightChange, 
  onRepsChange,
  onWeightIncrement,
  onRepsIncrement,
  weightUnit
}) => {
  const { weightUnit: globalWeightUnit } = useWeightUnit();
  
  const displayWeight = weightUnit ? convertWeight(weight, weightUnit, globalWeightUnit) : weight;
  
  return (
    <div className={`flex items-center justify-between py-2 border-b border-gray-800 transition-all duration-200 ${completed ? 'bg-gray-800/30' : ''}`}>
      <div className="w-8 text-center font-medium text-gray-400">#{setNumber}</div>
      
      {isEditing ? (
        <>
          <div className="flex-1 px-2">
            <div className="flex items-center">
              <button 
                onClick={() => onWeightIncrement(-1)} 
                className="p-1 text-gray-400 hover:text-white"
              >
                <MinusCircle size={16} />
              </button>
              <Input 
                type="number"
                value={weight}
                onChange={onWeightChange}
                className="bg-gray-800 border-gray-700 text-white h-8 px-2 mx-1 text-center"
              />
              <button 
                onClick={() => onWeightIncrement(1)} 
                className="p-1 text-gray-400 hover:text-white"
              >
                <PlusCircle size={16} />
              </button>
            </div>
          </div>
          <div className="flex-1 px-2">
            <div className="flex items-center">
              <button 
                onClick={() => onRepsIncrement(-1)} 
                className="p-1 text-gray-400 hover:text-white"
              >
                <MinusCircle size={16} />
              </button>
              <Input 
                type="number"
                value={reps}
                onChange={onRepsChange}
                className="bg-gray-800 border-gray-700 text-white h-8 px-2 mx-1 text-center"
              />
              <button 
                onClick={() => onRepsIncrement(1)} 
                className="p-1 text-gray-400 hover:text-white"
              >
                <PlusCircle size={16} />
              </button>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={onSave}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-600/70 text-blue-100"
            >
              <Save size={16} />
            </button>
            <button
              onClick={onRemove}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-red-600/70 text-red-100"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="flex-1 px-2">
            <button 
              onClick={onEdit}
              className="flex gap-1 items-baseline hover:bg-gray-800 px-2 py-1 rounded w-full"
            >
              <span className="font-medium">{displayWeight}</span>
              <span className="text-xs text-gray-400">{globalWeightUnit}</span>
            </button>
          </div>
          <div className="flex-1 px-2">
            <button 
              onClick={onEdit}
              className="flex gap-1 items-baseline hover:bg-gray-800 px-2 py-1 rounded w-full"
            >
              <span className="font-medium">{reps}</span>
              <span className="text-xs text-gray-400">reps</span>
            </button>
          </div>
          <div className="flex gap-1">
            {completed ? (
              <button
                onClick={onEdit}
                className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-700 text-gray-300"
              >
                <Edit size={16} />
              </button>
            ) : (
              <button 
                onClick={onComplete} 
                className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-800 text-gray-400 hover:bg-green-700 hover:text-white transform transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <Check size={16} />
              </button>
            )}
            <button
              onClick={onRemove}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-700 text-gray-300 hover:bg-red-700 hover:text-white transform transition-all duration-200"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </>
      )}
    </div>
  );
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
  onWeightIncrement,
  onRepsIncrement,
  isActive,
  onShowRestTimer
}) => {
  const { weightUnit } = useWeightUnit();
  const history = exerciseHistoryData[exercise] || [];
  const previousSession = history[0] || { weight: 0, reps: 0, sets: 0 };
  const olderSession = history[1] || previousSession;
  
  const previousSessionWeight = convertWeight(previousSession.weight, "lb", weightUnit);
  
  const weightDiff = previousSession.weight - olderSession.weight;
  const percentChange = olderSession.weight ? ((weightDiff / olderSession.weight) * 100).toFixed(1) : "0";
  const isImproved = weightDiff > 0;
  
  const currentVolume = sets.reduce((total, set) => {
    if (set.completed) {
      const weightInCurrentUnit = convertWeight(set.weight, "lb", weightUnit);
      return total + (weightInCurrentUnit * set.reps);
    }
    return total;
  }, 0);
  
  const previousVolume = previousSessionWeight * previousSession.reps * previousSession.sets;
  const volumeDiff = (currentVolume - previousVolume);
  const volumePercentChange = previousVolume ? ((volumeDiff / previousVolume) * 100).toFixed(1) : "0";
  
  const completedSetsCount = sets.filter(set => set.completed).length;
  const completionPercentage = sets.length > 0 ? (completedSetsCount / sets.length) * 100 : 0;
  
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
          <div className="w-20"></div>
        </div>
        
        <div className="my-2">
          {sets.map((set, index) => (
            <SetRow 
              key={index}
              setNumber={index + 1}
              weight={set.weight}
              reps={set.reps}
              completed={set.completed}
              isEditing={set.isEditing}
              onComplete={() => {
                onCompleteSet(exercise, index);
                if (navigator.vibrate) navigator.vibrate(50);
                onShowRestTimer();
              }}
              onEdit={() => onEditSet(exercise, index)}
              onSave={() => onSaveSet(exercise, index)}
              onRemove={() => onRemoveSet(exercise, index)}
              onWeightChange={(e) => onWeightChange(exercise, index, e.target.value)}
              onRepsChange={(e) => onRepsChange(exercise, index, e.target.value)}
              onWeightIncrement={(value) => onWeightIncrement(exercise, index, value)}
              onRepsIncrement={(value) => onRepsIncrement(exercise, index, value)}
              weightUnit="lb"
            />
          ))}
          
          <button 
            onClick={() => onAddSet(exercise)}
            className="w-full mt-3 py-2 flex items-center justify-center text-sm bg-gray-800 hover:bg-gray-750 rounded-md text-gray-300 font-medium transition-colors hover:bg-gray-700"
          >
            <Plus size={16} className="mr-1" />
            Add Set
          </button>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-800">
          <div className="flex justify-between text-sm mb-2">
            <span className="volume-label">Volume vs last session</span>
            <div className={`${volumeDiff >= 0 ? "text-green-300" : "text-red-300"} volume-value`}>
              {volumeDiff > 0 ? "+" : ""}{volumeDiff.toFixed(1)} {weightUnit} ({volumePercentChange}%)
            </div>
          </div>
          <Progress 
            value={currentVolume > 0 ? (currentVolume / Math.max(previousVolume, 1)) * 100 : 0} 
            className={`h-1.5 bg-gray-800 ${currentVolume >= previousVolume ? "[&>div]:bg-green-500" : "[&>div]:bg-red-500"}`}
          />
        </div>
      </CardContent>
    </Card>
  );
};

const TrainingSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { weightUnit } = useWeightUnit();
  const [time, setTime] = useState(0);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [heartRate, setHeartRate] = useState(75);
  const [currentExercise, setCurrentExercise] = useState("");
  const [startTime, setStartTime] = useState(new Date());
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const mainStartButtonVisible = useElementVisibility(startButtonRef, {
    threshold: 0.5,
    rootMargin: '-100px'
  });

  const locationState = location.state as LocationState | null;
  const [trainingType, setTrainingType] = useState(
    locationState?.trainingType || "Training Session"
  );
  
  const [exercises, setExercises] = useState<Record<string, { weight: number; reps: number; completed: boolean; isEditing?: boolean }[]>>({});
  
  useEffect(() => {
    setStartTime(new Date());
  }, []);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => prev + 1);
      setHeartRate(prev => {
        const change = Math.floor(Math.random() * 5) - 2;
        return Math.max(70, Math.min(160, prev + change));
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const handleAddSet = (exerciseName: string) => {
    const exerciseSets = exercises[exerciseName] || [];
    const lastSet = exerciseSets[exerciseSets.length - 1] || { weight: 0, reps: 0 };
    
    setExercises({
      ...exercises,
      [exerciseName]: [
        ...exerciseSets,
        { weight: lastSet.weight, reps: lastSet.reps, completed: false, isEditing: false }
      ]
    });
  };
  
  const handleCompleteSet = (exerciseName: string, setIndex: number) => {
    if (!exercises[exerciseName]) return;
    
    const updatedExercises = { ...exercises };
    if (updatedExercises[exerciseName] && updatedExercises[exerciseName][setIndex]) {
      updatedExercises[exerciseName][setIndex].completed = true;
      setExercises(updatedExercises);
      
      toast.success(`${exerciseName}: Set ${setIndex + 1} logged successfully`, {
        style: {
          backgroundColor: "rgba(20, 20, 20, 0.9)",
          color: "white",
          border: "1px solid rgba(120, 120, 120, 0.3)",
        },
      });
    }
  };
  
  const handleRemoveSet = (exerciseName: string, setIndex: number) => {
    if (!exercises[exerciseName]) return;
    
    const updatedExercises = { ...exercises };
    updatedExercises[exerciseName] = updatedExercises[exerciseName].filter((_, i) => i !== setIndex);
    
    if (updatedExercises[exerciseName].length === 0) {
      delete updatedExercises[exerciseName];
      
      if (currentExercise === exerciseName) {
        const remainingExercises = Object.keys(updatedExercises);
        setCurrentExercise(remainingExercises.length > 0 ? remainingExercises[0] : "");
      }
    }
    
    setExercises(updatedExercises);
    
    toast.error(`${exerciseName}: Set ${setIndex + 1} removed`, {
      style: {
        backgroundColor: "rgba(220, 38, 38, 0.9)",
        color: "white",
        border: "1px solid rgba(239, 68, 68, 0.3)",
      },
    });
  };
  
  const handleEditSet = (exerciseName: string, setIndex: number) => {
    if (!exercises[exerciseName]) return;
    
    const updatedExercises = { ...exercises };
    if (updatedExercises[exerciseName] && updatedExercises[exerciseName][setIndex]) {
      updatedExercises[exerciseName][setIndex].isEditing = true;
      setExercises(updatedExercises);
    }
  };
  
  const handleSaveSet = (exerciseName: string, setIndex: number) => {
    if (!exercises[exerciseName]) return;
    
    const updatedExercises = { ...exercises };
    if (updatedExercises[exerciseName] && updatedExercises[exerciseName][setIndex]) {
      updatedExercises[exerciseName][setIndex].isEditing = false;
      setExercises(updatedExercises);
      
      toast.success(`${exerciseName}: Set ${setIndex + 1} updated successfully`, {
        style: {
          backgroundColor: "rgba(20, 20, 20, 0.9)", 
          color: "white",
          border: "1px solid rgba(120, 120, 120, 0.3)",
        },
      });
    }
  };
  
  const handleSetWeightChange = (exerciseName: string, setIndex: number, value: string) => {
    if (!exercises[exerciseName]) return;
    
    const updatedExercises = { ...exercises };
    if (updatedExercises[exerciseName] && updatedExercises[exerciseName][setIndex]) {
      updatedExercises[exerciseName][setIndex].weight = Number(value) || 0;
      setExercises(updatedExercises);
    }
  };
  
  const handleSetRepsChange = (exerciseName: string, setIndex: number, value: string) => {
    if (!exercises[exerciseName]) return;
    
    const updatedExercises = { ...exercises };
    if (updatedExercises[exerciseName] && updatedExercises[exerciseName][setIndex]) {
      updatedExercises[exerciseName][setIndex].reps = Number(value) || 0;
      setExercises(updatedExercises);
    }
  };

  const handleWeightIncrement = (exerciseName: string, setIndex: number, increment: number) => {
    if (!exercises[exerciseName]) return;
    
    const updatedExercises = { ...exercises };
    if (updatedExercises[exerciseName] && updatedExercises[exerciseName][setIndex]) {
      const currentWeight = updatedExercises[exerciseName][setIndex].weight;
      updatedExercises[exerciseName][setIndex].weight = Math.max(0, currentWeight + increment);
      setExercises(updatedExercises);
    }
  };
  
  const handleRepsIncrement = (exerciseName: string, setIndex: number, increment: number) => {
    if (!exercises[exerciseName]) return;
    
    const updatedExercises = { ...exercises };
    if (updatedExercises[exerciseName] && updatedExercises[exerciseName][setIndex]) {
      const currentReps = updatedExercises[exerciseName][setIndex].reps;
      updatedExercises[exerciseName][setIndex].reps = Math.max(0, currentReps + increment);
      setExercises(updatedExercises);
    }
  };
  
  const handleSelectExercise = (exercise: Exercise) => {
    console.log("Selected exercise:", exercise);
    setSelectedExercise(exercise);
    setNewExerciseName(exercise.name);
  };
  
  const handleAddExercise = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!newExerciseName.trim()) return;
    
    if (!exercises[newExerciseName]) {
      const defaultWeight = selectedExercise?.metadata?.default_weight || 0;
      const defaultReps = selectedExercise?.metadata?.default_reps || 0;
      
      setExercises({
        ...exercises,
        [newExerciseName]: [
          { weight: defaultWeight, reps: defaultReps, completed: false, isEditing: false },
          { weight: defaultWeight, reps: defaultReps, completed: false, isEditing: false },
          { weight: defaultWeight, reps: defaultReps, completed: false, isEditing: false },
        ]
      });
      setCurrentExercise(newExerciseName);
      setNewExerciseName("");
      setSelectedExercise(null);
    } else {
      toast.error("This exercise is already in your workout", {
        style: {
          backgroundColor: "rgba(220, 38, 38, 0.9)",
          color: "white",
          border: "1px solid rgba(239, 68, 68, 0.3)",
        },
      });
    }
  };
  
  const totalSets = Object.values(exercises || {}).reduce((sum, sets) => sum + sets.length, 0);
  const completedSets = Object.values(exercises || {}).reduce((sum, sets) => 
    sum + sets.filter(set => set.completed).length, 0);
  
  const completionPercentage = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  
  const finishWorkout = () => {
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    
    const endTime = new Date();
    const durationInSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
    
    const workoutData = {
      exercises: exercises,
      duration: durationInSeconds,
      startTime: startTime,
      endTime: endTime,
      trainingType: trainingType,
      name: trainingType
    };
    
    navigate("/workout-complete", { state: { workoutData } });
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="sticky top-0 z-10 flex justify-between items-center p-4 border-b border-gray-800 bg-black/95 backdrop-blur-sm">
        <button 
          onClick={() => navigate('/')}
          className="p-2 rounded-full hover:bg-gray-900 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="title-large">{trainingType}</h1>
        <WeightUnitToggle variant="badge" />
      </header>

      <WorkoutMetrics 
        time={time}
        exerciseCount={Object.keys(exercises).length}
        completedSets={completedSets}
        totalSets={totalSets}
        heartRate={heartRate}
        className="sticky top-[73px] z-10 mx-4 mt-4"
      />
      
      <main className="flex-1 overflow-auto px-4 py-6 pb-24">
        <div className="mb-8 rounded-xl p-6 bg-gradient-to-r from-purple-600 to-pink-500">
          {Object.keys(exercises || {}).map((exerciseName) => (
            <ExerciseCard
              key={exerciseName}
              exercise={exerciseName}
              sets={exercises[exerciseName] || []}
              onAddSet={handleAddSet}
              onCompleteSet={handleCompleteSet}
              onRemoveSet={handleRemoveSet}
              onEditSet={handleEditSet}
              onSaveSet={handleSaveSet}
              onWeightChange={handleSetWeightChange}
              onRepsChange={handleSetRepsChange}
              onWeightIncrement={handleWeightIncrement}
              onRepsIncrement={handleRepsIncrement}
              isActive={exerciseName === currentExercise}
              onShowRestTimer={() => setShowRestTimer(true)}
            />
          ))}
        </div>

        <div className="mb-6 bg-gray-900/80 backdrop-blur-sm p-4 rounded-lg border border-gray-800">
          <div className="flex justify-between items-center mb-3">
            <h3 className="title-small">Add Exercise</h3>
          </div>
          <form onSubmit={handleAddExercise} className="flex flex-col gap-3">
            <ExerciseAutocomplete onSelectExercise={handleSelectExercise} />
            <Button 
              type="submit" 
              variant="secondary" 
              className="font-medium bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white"
              disabled={!newExerciseName.trim()}
            >
              <Plus size={16} />
              Add Exercise
            </Button>
          </form>
        </div>
        
        <Button 
          ref={startButtonRef}
          onClick={finishWorkout}
          className="w-full py-6 text-lg bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 font-heading font-medium shadow-lg transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] mb-10"
        >
          Complete Workout
        </Button>
      </main>
      
      <RestTimer 
        isVisible={showRestTimer}
        onClose={() => setShowRestTimer(false)}
        onComplete={() => {
          toast.success("Rest complete! Continue your workout.", {
            style: {
              backgroundColor: "rgba(20, 20, 20, 0.9)",
              color: "white",
              border: "1px solid rgba(120, 120, 120, 0.3)",
            },
          });
          setShowRestTimer(false);
        }}
      />
    </div>
  );
};

export default TrainingSession;
