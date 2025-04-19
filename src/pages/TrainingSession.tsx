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
import { SetRow } from "@/components/SetRow";
import { useExercises } from "@/hooks/useExercises";
import { cn } from "@/lib/utils";
import { AddExerciseBar } from "@/components/AddExerciseBar";

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
  
  console.log(`Exercise: ${exercise}`);
  console.log(`Current volume: ${currentVolume}`);
  console.log(`Previous volume: ${previousVolume}`);
  console.log(`Volume diff: ${volumeDiff}`);
  console.log(`Volume % change: ${volumePercentChange}`);
  console.log(`Sets:`, sets);
  
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
              onComplete={() => handleCompleteSet(index)}
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
          <div className="flex justify-between text-sm mb-2">
            <span className="volume-label">Volume vs last session</span>
            <div className={`${volumeDiff >= 0 ? "text-green-300" : "text-red-300"} volume-value`}>
              {volumeDiff > 0 ? "+" : ""}{volumeDiff.toFixed(1)} {weightUnit} ({volumePercentChange}%)
            </div>
          </div>
          <Progress 
            value={currentVolume > 0 && previousVolume > 0 ? 
              Math.min((currentVolume / Math.max(previousVolume, 1)) * 100, 200) : 0} 
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
  const [showRestTimer, setShowRestTimer] = useState(false);
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const mainStartButtonVisible = useElementVisibility(startButtonRef, {
    threshold: 0.5,
    rootMargin: '-100px'
  });

  const [startTime, setStartTime] = useState(new Date());
  const [currentExercise, setCurrentExercise] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [newExerciseName, setNewExerciseName] = useState("");
  const [currentRestTime, setCurrentRestTime] = useState(0);

  const locationState = location.state as LocationState | null;
  const [trainingType, setTrainingType] = useState(
    locationState?.trainingType || "Training Session"
  );
  
  const [exercises, setExercises] = useState<Record<string, { weight: number; reps: number; restTime?: number; completed: boolean; isEditing?: boolean }[]>>({});
  
  useEffect(() => {
    setStartTime(new Date());
  }, []);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => prev + 1);
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
    const lastSet = exerciseSets[exerciseSets.length - 1] || { weight: 0, reps: 0, restTime: 60 };
    
    setExercises({
      ...exercises,
      [exerciseName]: [
        ...exerciseSets,
        { 
          weight: lastSet.weight, 
          reps: lastSet.reps, 
          restTime: lastSet.restTime || 60,
          completed: false, 
          isEditing: false 
        }
      ]
    });
  };
  
  const handleCompleteSet = (exerciseName: string, setIndex: number) => {
    if (!exercises[exerciseName]) return;
    
    const updatedExercises = { ...exercises };
    if (updatedExercises[exerciseName] && updatedExercises[exerciseName][setIndex]) {
      updatedExercises[exerciseName][setIndex].completed = true;
      updatedExercises[exerciseName][setIndex].restTime = currentRestTime;
      setExercises(updatedExercises);
      
      if (navigator.vibrate) {
        navigator.vibrate([50]);
      }
      
      console.log("Set completed, activating rest timer");
      setShowRestTimer(true);
      resetRestTimer();
      
      const currentSets = updatedExercises[exerciseName];
      const currentVolume = calculateSetVolume(currentSets, weightUnit);
      console.log(`Set ${setIndex + 1} completed with rest time: ${currentRestTime}s. New volume: ${currentVolume} ${weightUnit}`);
      
      toast.success(`${exerciseName}: Set ${setIndex + 1} logged successfully`, {
        style: {
          backgroundColor: "rgba(20, 20, 20, 0.9)",
          color: "white",
          border: "1px solid rgba(120, 120, 120, 0.3)",
        },
        id: `set-complete-${exerciseName}-${setIndex}`,
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
  
  const handleSetRestTimeChange = (exerciseName: string, setIndex: number, value: string) => {
    if (!exercises[exerciseName]) return;
    
    const updatedExercises = { ...exercises };
    if (updatedExercises[exerciseName] && updatedExercises[exerciseName][setIndex]) {
      updatedExercises[exerciseName][setIndex].restTime = Number(value) || 60;
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
  
  const handleRestTimeIncrement = (exerciseName: string, setIndex: number, increment: number) => {
    if (!exercises[exerciseName]) return;
    
    const updatedExercises = { ...exercises };
    if (updatedExercises[exerciseName] && updatedExercises[exerciseName][setIndex]) {
      const currentRestTime = updatedExercises[exerciseName][setIndex].restTime || 60;
      updatedExercises[exerciseName][setIndex].restTime = Math.max(0, currentRestTime + increment);
      setExercises(updatedExercises);
    }
  };
  
  const handleSelectExercise = (exercise: Exercise) => {
    console.log("Selected exercise:", exercise);
    setSelectedExercise(exercise);
    setNewExerciseName(exercise.name);
  };
  
  const handleAddExercise = () => {
    console.log("Add exercise button clicked");
    console.log("Selected exercise:", selectedExercise);
    console.log("New exercise name:", newExerciseName);
    
    if (!newExerciseName.trim()) {
      toast.error("Please select an exercise first", {
        style: {
          backgroundColor: "rgba(220, 38, 38, 0.9)",
          color: "white",
          border: "1px solid rgba(239, 68, 68, 0.3)",
        },
      });
      return;
    }
    
    if (!exercises[newExerciseName]) {
      const defaultWeight = selectedExercise?.metadata?.default_weight || 0;
      const defaultReps = selectedExercise?.metadata?.default_reps || 0;
      
      setExercises({
        ...exercises,
        [newExerciseName]: [
          { weight: defaultWeight, reps: defaultReps, completed: false, isEditing: false, restTime: 60 }
        ]
      });
      setCurrentExercise(newExerciseName);
      setNewExerciseName("");
      setSelectedExercise(null);
      
      toast.success(`${newExerciseName} added to your workout`, {
        style: {
          backgroundColor: "rgba(20, 20, 20, 0.9)",
          color: "white",
          border: "1px solid rgba(120, 120, 120, 0.3)",
        },
      });
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
  
  const handleRestTimerComplete = () => {
    toast.success("Rest complete! Continue your workout.", {
      style: {
        backgroundColor: "rgba(20, 20, 20, 0.9)",
        color: "white",
        border: "1px solid rgba(120, 120, 120, 0.3)",
      },
      id: "rest-complete-toast",
    });
  };
  
  const resetRestTimer = () => {
    console.log("Resetting rest timer");
    setShowRestTimer(false);
    setTimeout(() => {
      setShowRestTimer(true);
    }, 10);
  };
  
  const handleRestTimeUpdate = (time: number) => {
    console.log("Rest time updated:", time);
    setCurrentRestTime(time);
  };

  const handleManualRestStart = () => {
    console.log("Manual rest timer start requested");
    setShowRestTimer(true);
    resetRestTimer();
    
    toast.info("Rest timer started manually", {
      style: {
        backgroundColor: "rgba(20, 20, 20, 0.9)",
        color: "white",
        border: "1px solid rgba(120, 120, 120, 0.3)",
      },
    });
  };

  const { weightUnit } = useWeightUnit();
  const metrics = useWorkoutMetrics(exercises, time, weightUnit);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 via-gray-900/98 to-gray-900/95">
      <header className="sticky top-0 z-10 flex justify-between items-center p-4 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800/50">
        <button 
          onClick={() => navigate('/')}
          className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-4">
          <TrainingTypeTag type={trainingType as any} />
          <h1 className="text-xl font-semibold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
            {trainingType}
          </h1>
        </div>
        <WeightUnitToggle variant="badge" />
      </header>

      <WorkoutMetrics 
        time={time}
        exerciseCount={metrics.exerciseCount}
        completedSets={metrics.completedSets}
        totalSets={metrics.totalSets}
        showRestTimer={showRestTimer}
        onRestTimerComplete={handleRestTimerComplete}
        onRestTimeUpdate={handleRestTimeUpdate}
        onManualRestStart={handleManualRestStart}
        className="sticky top-[73px] z-10 mx-4 mt-4"
      />
      
      <main className="flex-1 px-4 py-6 pb-40 space-y-6">
        {Object.keys(exercises).length > 0 ? (
          <>
            <div className="space-y-6">
              <IntelligentMetricsDisplay
                exercises={exercises}
                intensity={metrics.performance.intensity}
                efficiency={metrics.performance.efficiency}
              />
              
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
                  onRestTimeChange={handleSetRestTimeChange}
                  onWeightIncrement={handleWeightIncrement}
                  onRepsIncrement={handleRepsIncrement}
                  onRestTimeIncrement={handleRestTimeIncrement}
                  isActive={exerciseName === currentExercise}
                  onShowRestTimer={() => setShowRestTimer(true)}
                  onResetRestTimer={resetRestTimer}
                />
              ))}
            </div>
            
            <div className="flex flex-col items-center justify-center text-center mt-8">
              <Button 
                ref={startButtonRef}
                onClick={finishWorkout}
                className="w-64 h-64 rounded-full text-lg bg-gradient-to-r from-purple-600 to-pink-500 
                  hover:from-purple-700 hover:to-pink-600 font-medium shadow-2xl hover:shadow-purple-500/50
                  transform transition-all duration-300 active:scale-[0.98] 
                  flex flex-col items-center justify-center space-y-2 
                  border border-purple-500/20"
              >
                <div className="bg-white/20 rounded-full p-3 mb-2">
                  <Weight size={32} className="text-white" />
                </div>
                <span className="text-white text-xl">Complete Workout</span>
              </Button>
            </div>
          </>
        ) : (
          <EmptyWorkoutState 
            onTemplateSelect={(templateType) => {
              const templateExercises = {
                "Push": ["Bench Press", "Shoulder Press", "Tricep Extensions"],
                "Pull": ["Pull-ups", "Barbell Rows", "Bicep Curls"],
                "Legs": ["Squats", "Deadlifts", "Leg Press"],
                "Full Body": ["Bench Press", "Pull-ups", "Squats", "Shoulder Press"]
              };

              const exercises = templateExercises[templateType] || [];
              
              const newExercises = {};
              exercises.forEach(exercise => {
                newExercises[exercise] = [
                  { weight: 0, reps: 0, completed: false, isEditing: false, restTime: 60 }
                ];
              });

              setExercises(newExercises);
              if (exercises.length > 0) {
                setCurrentExercise(exercises[0]);
              }

              toast.success(`${templateType} template added to your workout`, {
                style: {
                  backgroundColor: "rgba(20, 20, 20, 0.9)",
                  color: "white",
                  border: "1px solid rgba(120, 120, 120, 0.3)",
                },
              });
            }} 
          />
        )}
      </main>
      
      <AddExerciseBar
        onSelectExercise={handleSelectExercise}
        onAddExercise={handleAddExercise}
      />
    </div>
  );
};

export default TrainingSession;
