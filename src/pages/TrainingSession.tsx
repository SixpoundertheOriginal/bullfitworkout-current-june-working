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
import { TrainingTypeTag } from "@/components/TrainingTypeTag";
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
import { ExerciseSet, Exercise } from "@/types/exercise";
import { convertWeight } from "@/utils/unitConversion";
import { WorkoutMetrics } from "@/components/WorkoutMetrics";
import { SetRow } from "@/components/SetRow";
import { useExercises } from "@/hooks/useExercises";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ExerciseVolumeSparkline } from "@/components/metrics/ExerciseVolumeSparkline";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import AllExercisesPage from "@/pages/AllExercisesPage";

interface TrainingTypeObj {
  id: string;
  name: string;
  color: string;
  icon: React.ReactNode;
}

const trainingTypes: TrainingTypeObj[] = [
  { id: 'strength', name: 'Strength', color: 'purple', icon: <Dumbbell size={16} /> },
  { id: 'hypertrophy', name: 'Hypertrophy', color: 'pink', icon: <Weight size={16} /> },
  { id: 'cardio', name: 'Cardio', color: 'red', icon: <Heart size={16} /> },
  { id: 'calisthenics', name: 'Calisthenics', color: 'blue', icon: <ArrowUpRight size={16} /> },
  { id: 'stretching', name: 'Stretching', color: 'teal', icon: <ArrowUpRight size={16} /> },
  { id: 'yoga', name: 'Yoga', color: 'green', icon: <ArrowUpRight size={16} /> }
];

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

const popularExercises = [
  "Bench Press",
  "Squats",
  "Deadlift",
  "Pull-ups",
  "Push-ups",
  "Shoulder Press",
  "Decline Push-Up on Handrails"
];

const getPreviousSessionData = (exerciseName: string) => {
  const history = exerciseHistoryData[exerciseName] || [];
  if (history.length > 0) {
    return history[0];
  }
  
  return { date: "N/A", weight: 0, reps: 0, sets: 0 };
};

const calculateSetVolume = (sets: ExerciseSet[], weightUnit: string) => {
  return sets.reduce((total, set) => {
    if (set.completed) {
      if (set.weight > 0 && set.reps > 0) {
        return total + (set.weight * set.reps);
      }
    }
    return total;
  }, 0);
};

interface LocalExerciseSet {
  weight: number;
  reps: number;
  restTime: number;
  completed: boolean;
  isEditing: boolean;
}

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
}: {
  exercise: string,
  sets: LocalExerciseSet[],
  onAddSet: (exercise: string) => void,
  onCompleteSet: (exercise: string, index: number) => void,
  onRemoveSet: (exercise: string, index: number) => void,
  onEditSet: (exercise: string, index: number) => void,
  onSaveSet: (exercise: string, index: number) => void,
  onWeightChange: (exercise: string, index: number, value: string) => void,
  onRepsChange: (exercise: string, index: number, value: string) => void,
  onRestTimeChange: (exercise: string, index: number, value: string) => void,
  onWeightIncrement: (exercise: string, index: number, increment: number) => void,
  onRepsIncrement: (exercise: string, index: number, increment: number) => void,
  onRestTimeIncrement: (exercise: string, index: number, increment: number) => void,
  isActive: boolean,
  onShowRestTimer: () => void,
  onResetRestTimer: () => void
}) => {
  const { weightUnit } = useWeightUnit();
  const { exercises: dbExercises } = useExercises();
  
  const previousSession = getPreviousSessionData(exercise);
  const olderSession = exerciseHistoryData[exercise]?.[1] || previousSession;
  
  const previousSessionWeight = convertWeight(previousSession.weight, "lb", weightUnit);
  
  const weightDiff = previousSession.weight - olderSession.weight;
  const percentChange = olderSession.weight ? ((weightDiff / olderSession.weight) * 100).toFixed(1) : "0";
  const isImproved = weightDiff > 0;
  
  const currentVolume = calculateSetVolume(sets as unknown as ExerciseSet[], weightUnit);
  
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
    
    toast({
      title: `${exercise}: Set ${index + 1} logged successfully`,
      variant: "success",
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

const TrainingSession: React.FC = () => {
  const [exercises, setExercises] = useState<Record<string, LocalExerciseSet[]>>({});
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [showAddExerciseSheet, setShowAddExerciseSheet] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { weightUnit } = useWeightUnit();
  const isMobile = useIsMobile();
  
  const locationState = location.state as LocationState;
  const trainingType = locationState?.trainingType || searchParams.get('type') || 'strength';
  
  const trainingTypeObj = trainingTypes.find(t => t.id === trainingType);
  
  const { ref: metricsRef, isVisible: metricsVisible } = useElementVisibility({
    threshold: 0.2
  });
  
  const completedSets = Object.values(exercises).reduce(
    (total, sets) => total + sets.filter(set => set.completed).length, 
    0
  );
  
  const totalSets = Object.values(exercises).reduce(
    (total, sets) => total + sets.length, 
    0
  );

  const intensity = 75;
  const volume = 1250;
  const efficiency = 85;
  const projectedCalories = 320;
  
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  const handleAddExercise = (exerciseNameOrObj: string | Exercise) => {
    const exerciseName = typeof exerciseNameOrObj === 'object' && exerciseNameOrObj !== null && 'name' in exerciseNameOrObj 
      ? exerciseNameOrObj.name 
      : String(exerciseNameOrObj);
    
    setExercises(prev => {
      if (prev[exerciseName]) {
        return prev;
      }
      
      return {
        ...prev,
        [exerciseName]: [
          { weight: 0, reps: 0, restTime: 60, completed: false, isEditing: true }
        ]
      };
    });
    
    setActiveExercise(exerciseName);
    setShowAddExerciseSheet(false);

    setTimeout(() => {
      const element = document.getElementById(`exercise-${exerciseName}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const handleOpenAddExercise = () => setShowAddExerciseSheet(true);
  const handleCloseAddExercise = () => setShowAddExerciseSheet(false);

  const handleAddSet = (exerciseName: string) => {
    setExercises(prev => {
      const exerciseSets = [...(prev[exerciseName] || [])];
      const lastSet = exerciseSets[exerciseSets.length - 1];
      
      const newSet = lastSet ? {
        weight: lastSet.weight,
        reps: lastSet.reps,
        restTime: lastSet.restTime,
        completed: false,
        isEditing: false
      } : {
        weight: 0,
        reps: 0,
        restTime: 60,
        completed: false,
        isEditing: true
      };
      
      return {
        ...prev,
        [exerciseName]: [...exerciseSets, newSet]
      };
    });
  };
  
  const handleCompleteSet = (exerciseName: string, setIndex: number) => {
    setExercises(prev => {
      const exerciseSets = [...(prev[exerciseName] || [])];
      exerciseSets[setIndex] = { 
        ...exerciseSets[setIndex], 
        completed: true,
        isEditing: false 
      };
      
      return {
        ...prev,
        [exerciseName]: exerciseSets
      };
    });
  };
  
  const handleRemoveSet = (exerciseName: string, setIndex: number) => {
    setExercises(prev => {
      const exerciseSets = [...(prev[exerciseName] || [])];
      exerciseSets.splice(setIndex, 1);
      
      if (exerciseSets.length === 0) {
        const newExercises = { ...prev };
        delete newExercises[exerciseName];
        return newExercises;
      }
      
      return {
        ...prev,
        [exerciseName]: exerciseSets
      };
    });
  };
  
  const handleEditSet = (exerciseName: string, setIndex: number) => {
    setExercises(prev => {
      const exerciseSets = [...(prev[exerciseName] || [])];
      exerciseSets[setIndex] = { 
        ...exerciseSets[setIndex], 
        isEditing: true 
      };
      
      return {
        ...prev,
        [exerciseName]: exerciseSets
      };
    });
  };
  
  const handleSaveSet = (exerciseName: string, setIndex: number) => {
    setExercises(prev => {
      const exerciseSets = [...(prev[exerciseName] || [])];
      exerciseSets[setIndex] = { 
        ...exerciseSets[setIndex], 
        isEditing: false 
      };
      
      return {
        ...prev,
        [exerciseName]: exerciseSets
      };
    });
  };
  
  const handleWeightChange = (exerciseName: string, setIndex: number, value: string) => {
    setExercises(prev => {
      const exerciseSets = [...(prev[exerciseName] || [])];
      exerciseSets[setIndex] = { 
        ...exerciseSets[setIndex], 
        weight: parseFloat(value) || 0
      };
      
      return {
        ...prev,
        [exerciseName]: exerciseSets
      };
    });
  };
  
  const handleRepsChange = (exerciseName: string, setIndex: number, value: string) => {
    setExercises(prev => {
      const exerciseSets = [...(prev[exerciseName] || [])];
      exerciseSets[setIndex] = { 
        ...exerciseSets[setIndex], 
        reps: parseInt(value) || 0
      };
      
      return {
        ...prev,
        [exerciseName]: exerciseSets
      };
    });
  };
  
  const handleRestTimeChange = (exerciseName: string, setIndex: number, value: string) => {
    setExercises(prev => {
      const exerciseSets = [...(prev[exerciseName] || [])];
      exerciseSets[setIndex] = { 
        ...exerciseSets[setIndex], 
        restTime: parseInt(value) || 0
      };
      
      return {
        ...prev,
        [exerciseName]: exerciseSets
      };
    });
  };
  
  const handleWeightIncrement = (exerciseName: string, setIndex: number, increment: number) => {
    setExercises(prev => {
      const exerciseSets = [...(prev[exerciseName] || [])];
      const currentWeight = exerciseSets[setIndex].weight || 0;
      exerciseSets[setIndex] = { 
        ...exerciseSets[setIndex], 
        weight: Math.max(0, currentWeight + increment)
      };
      
      return {
        ...prev,
        [exerciseName]: exerciseSets
      };
    });
  };
  
  const handleRepsIncrement = (exerciseName: string, setIndex: number, increment: number) => {
    setExercises(prev => {
      const exerciseSets = [...(prev[exerciseName] || [])];
      const currentReps = exerciseSets[setIndex].reps || 0;
      exerciseSets[setIndex] = { 
        ...exerciseSets[setIndex], 
        reps: Math.max(0, currentReps + increment)
      };
      
      return {
        ...prev,
        [exerciseName]: exerciseSets
      };
    });
  };
  
  const handleRestTimeIncrement = (exerciseName: string, setIndex: number, increment: number) => {
    setExercises(prev => {
      const exerciseSets = [...(prev[exerciseName] || [])];
      const currentRestTime = exerciseSets[setIndex].restTime || 0;
      exerciseSets[setIndex] = { 
        ...exerciseSets[setIndex], 
        restTime: Math.max(0, currentRestTime + increment)
      };
      
      return {
        ...prev,
        [exerciseName]: exerciseSets
      };
    });
  };
  
  const handleCompleteWorkout = async () => {
    if (user) {
      try {
        const now = new Date();
        const workoutData = {
          user_id: user.id,
          name: `Workout ${now.toLocaleDateString()}`,
          start_time: new Date(now.getTime() - elapsedTime * 1000).toISOString(),
          end_time: now.toISOString(),
          training_type: trainingType,
          duration: elapsedTime,
          notes: null,
          exercises: Object.entries(exercises).map(([name, sets]) => ({
            name,
            sets: sets.map(set => ({
              weight: set.weight,
              reps: set.reps,
              rest_time: set.restTime,
              completed: set.completed
            }))
          }))
        };
        
        const { data, error } = await supabase
          .from('workout_sessions')
          .insert(workoutData)
          .select();
          
        if (error) {
          throw error;
        }
        
        navigate('/workout-complete', {
          state: {
            workoutId: data[0].id,
            duration: elapsedTime,
            training_type: trainingType,
            intensity,
            volume,
            calories: projectedCalories,
            completed_sets: completedSets,
            total_sets: totalSets
          }
        });
      } catch (error) {
        console.error('Error saving workout:', error);
        toast({
          title: 'Failed to save your workout. Please try again.',
          variant: "destructive",
        });
      }
    } else {
      navigate('/workout-complete', {
        state: {
          duration: elapsedTime,
          training_type: trainingType,
          intensity,
          volume,
          calories: projectedCalories,
          completed_sets: completedSets,
          total_sets: totalSets
        }
      });
    }
  };
  
  const handleShowRestTimer = () => {
    setShowRestTimer(true);
  };
  
  const handleResetRestTimer = () => {
    setShowRestTimer(false);
  };
  
  const handleRestTimerComplete = () => {
    setShowRestTimer(false);
  };
  
  const totalExercises = Object.keys(exercises).length;
  
  return (
    <div className="pb-20">
      <Sheet open={showAddExerciseSheet} onOpenChange={setShowAddExerciseSheet}>
        <SheetContent side={isMobile ? "bottom" : "right"} className="overflow-y-scroll max-h-[90vh]">
          <SheetHeader>
            <SheetTitle>
              Add an Exercise
            </SheetTitle>
          </SheetHeader>
          {/* Use the actual AllExercisesPage for selection */}
          <AllExercisesPage
            {...{
            }}
            onSelectExercise={handleAddExercise}
          />
        </SheetContent>
      </Sheet>
      {trainingTypeObj && (
        <div className="px-4 py-2 mb-2">
          <TrainingTypeTag
            type={trainingTypeObj.name as any}
            className="mb-2"
          />
        </div>
      )}
      
      <div className="sticky top-16 z-10 bg-gray-900/80 backdrop-blur-lg" ref={metricsRef}>
        <WorkoutMetrics
          time={elapsedTime}
          exerciseCount={totalExercises}
          completedSets={completedSets}
          totalSets={totalSets}
          showRestTimer={showRestTimer}
          onRestTimerComplete={handleRestTimerComplete}
          onManualRestStart={handleShowRestTimer}
        />
      </div>
      
      <div className="px-4 py-2">
        {totalExercises > 0 ? (
          <>
            <div className="mb-4">
              {Object.entries(exercises).map(([exerciseName, sets]) => (
                <div 
                  key={exerciseName} 
                  id={`exercise-${exerciseName}`}
                  className="mb-4"
                >
                  <ExerciseCard
                    exercise={exerciseName}
                    sets={sets}
                    onAddSet={handleAddSet}
                    onCompleteSet={handleCompleteSet}
                    onRemoveSet={handleRemoveSet}
                    onEditSet={handleEditSet}
                    onSaveSet={handleSaveSet}
                    onWeightChange={handleWeightChange}
                    onRepsChange={handleRepsChange}
                    onRestTimeChange={handleRestTimeChange}
                    onWeightIncrement={handleWeightIncrement}
                    onRepsIncrement={handleRepsIncrement}
                    onRestTimeIncrement={handleRestTimeIncrement}
                    isActive={activeExercise === exerciseName}
                    onShowRestTimer={handleShowRestTimer}
                    onResetRestTimer={handleResetRestTimer}
                  />
                </div>
              ))}
            </div>
            
            <div className="mt-8 flex flex-col items-center">
              <div className="flex w-full">
                <Button
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-500 
                    hover:from-green-700 hover:to-emerald-600 text-white font-medium 
                    rounded-full shadow-lg hover:shadow-xl mb-4"
                  onClick={handleCompleteWorkout}
                >
                  Complete Workout
                </Button>
              </div>
              
              <IntelligentMetricsDisplay 
                exercises={exercises as unknown as Record<string, ExerciseSet[]>} 
                intensity={intensity}
                efficiency={efficiency}
              />
              
              <div className="mt-4 bg-gray-900/50 p-4 rounded-xl border border-gray-800 w-full">
                <ExerciseVolumeChart 
                  exercises={exercises as unknown as Record<string, ExerciseSet[]>}
                  weightUnit={weightUnit}
                />
              </div>
            </div>
          </>
        ) : (
          <EmptyWorkoutState 
            onTemplateSelect={handleAddExercise} 
          />
        )}
      </div>
      
      <div className="sticky bottom-16 right-0 p-4 flex justify-end">
        <Button
          onClick={handleOpenAddExercise}
          className="rounded-full w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg hover:from-purple-700 hover:to-pink-600 flex items-center justify-center text-white"
          aria-label="Add Exercise"
        >
          <Plus size={28} />
        </Button>
      </div>
    </div>
  );
};

export default TrainingSession;
