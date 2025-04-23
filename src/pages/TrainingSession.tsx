import React, { useRef } from "react";
import { Plus } from "lucide-react";
import { TrainingTypeTag } from "@/components/TrainingTypeTag";
import { useElementVisibility } from "@/hooks/useElementVisibility";
import { useIsMobile } from "@/hooks/use-mobile";
import { EmptyWorkoutState } from "@/components/EmptyWorkoutState";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import { useNavigate, useLocation, useSearchParams, useBeforeUnload } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { WorkoutMetrics } from "@/components/WorkoutMetrics";
import { ExerciseCard } from "@/components/training/ExerciseCard";
import { WorkoutCompletion } from "@/components/training/WorkoutCompletion";
import { useWorkoutState } from "@/hooks/useWorkoutState";
import AllExercisesPage from "@/pages/AllExercisesPage";
import { trainingTypes } from "@/constants/trainingTypes";
import { ExerciseSet } from "@/types/exercise";

interface LocationState {
  trainingType?: string;
  [key: string]: any;
}

const TrainingSession: React.FC = () => {
  const { 
    exercises, 
    setExercises, 
    activeExercise, 
    setActiveExercise, 
    elapsedTime, 
    setElapsedTime,
    resetSession
  } = useWorkoutState();
  
  const [showRestTimer, setShowRestTimer] = React.useState(false);
  const [showAddExerciseSheet, setShowAddExerciseSheet] = React.useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
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
  
  useBeforeUnload(event => {
    if (Object.keys(exercises).length > 0) {
      event.preventDefault();
      return "You have an unsaved workout in progress. Are you sure you want to leave?";
    }
  });
  
  React.useEffect(() => {
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [setElapsedTime]);
  
  const handleAddExercise = (exerciseNameOrObj: string | any) => {
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

  const handleCompleteWorkout = async () => {
    if (!Object.keys(exercises).length) {
      toast({
        description: "No exercises added. Please add at least one exercise before completing your workout",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const now = new Date();
      const startTime = new Date(now.getTime() - elapsedTime * 1000);
      
      const workoutData = {
        user_id: user?.id,
        name: `Workout ${now.toLocaleDateString()}`,
        training_type: trainingType || 'strength',
        start_time: startTime.toISOString(),
        end_time: now.toISOString(),
        duration: elapsedTime || 0,
        notes: null
      };
      
      if (!user) {
        navigateToComplete(null);
        return;
      }
      
      try {
        const { data: workoutSession, error: workoutError } = await supabase
          .from('workout_sessions')
          .insert(workoutData)
          .select()
          .single();
            
        if (workoutError) {
          handleWorkoutError(workoutError);
          return;
        }
        
        if (workoutSession) {
          await saveExerciseSets(workoutSession.id);
          resetSession();
          navigateToComplete(workoutSession.id);
        }
      } catch (error) {
        handleWorkoutError(error);
      }
    } catch (error) {
      console.error('Error in workout completion process:', error);
      toast({
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    }
  };

  const handleWorkoutError = async (error: any) => {
    console.error("Error in workout process:", error);
    const errorMessage = error?.message || "Unknown error";
    
    if (errorMessage.includes("materialized view")) {
      toast({
        description: "Your workout data was saved but some analytics couldn't be processed.",
        variant: "default",
      });
      navigateToComplete(null);
    } else {
      toast({
        description: errorMessage,
        variant: "destructive",
      });
    }
  };
  
  const saveExerciseSets = async (workoutId: string) => {
    try {
      const exerciseSets = [];
      
      for (const [exerciseName, sets] of Object.entries(exercises)) {
        sets.forEach((set, index) => {
          exerciseSets.push({
            workout_id: workoutId,
            exercise_name: exerciseName,
            weight: set.weight || 0,
            reps: set.reps || 0,
            set_number: index + 1,
            completed: set.completed || false
          });
        });
      }
      
      const batchSize = 25;
      for (let i = 0; i < exerciseSets.length; i += batchSize) {
        const batch = exerciseSets.slice(i, i + batchSize);
        const { error: batchError } = await supabase
          .from('exercise_sets')
          .insert(batch);
          
        if (batchError) {
          console.error("Error saving exercise set batch:", batchError);
        }
      }
      
      return true;
    } catch (error) {
      console.error("Exception saving exercise sets:", error);
      throw error;
    }
  };
  
  const navigateToComplete = (workoutId: string | null) => {
    const now = new Date();
    navigate('/workout-complete', {
      state: {
        workoutId,
        workoutData: {
          exercises: exercises as unknown as Record<string, ExerciseSet[]>,
          duration: elapsedTime,
          startTime: new Date(now.getTime() - elapsedTime * 1000),
          endTime: now,
          trainingType: trainingType || 'strength',
          name: `Workout ${now.toLocaleDateString()}`
        }
      }
    });
  };
  
  const handleShowRestTimer = () => setShowRestTimer(true);
  const handleResetRestTimer = () => setShowRestTimer(false);
  const handleRestTimerComplete = () => setShowRestTimer(false);
  
  const totalExercises = Object.keys(exercises).length;

  return (
    <div className="pb-20">
      <Sheet open={showAddExerciseSheet} onOpenChange={setShowAddExerciseSheet}>
        <SheetContent side={isMobile ? "bottom" : "right"} className="overflow-y-scroll max-h-[90vh]">
          <SheetHeader>
            <SheetTitle>Add an Exercise</SheetTitle>
          </SheetHeader>
          <AllExercisesPage onSelectExercise={handleAddExercise} />
        </SheetContent>
      </Sheet>

      {trainingTypeObj && (
        <div className="px-4 py-2 mb-2">
          <TrainingTypeTag type={trainingTypeObj.name as any} className="mb-2" />
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
                    onEditSet={(exercise, index) => setExercises(prev => {
                      const exerciseSets = [...(prev[exercise] || [])];
                      exerciseSets[index] = { 
                        ...exerciseSets[index], 
                        isEditing: true 
                      };
                      return {
                        ...prev,
                        [exercise]: exerciseSets
                      };
                    })}
                    onSaveSet={(exercise, index) => setExercises(prev => {
                      const exerciseSets = [...(prev[exercise] || [])];
                      exerciseSets[index] = { 
                        ...exerciseSets[index], 
                        isEditing: false 
                      };
                      return {
                        ...prev,
                        [exercise]: exerciseSets
                      };
                    })}
                    onWeightChange={(exercise, index, value) => setExercises(prev => {
                      const exerciseSets = [...(prev[exercise] || [])];
                      exerciseSets[index] = { 
                        ...exerciseSets[index], 
                        weight: parseFloat(value) || 0
                      };
                      return {
                        ...prev,
                        [exercise]: exerciseSets
                      };
                    })}
                    onRepsChange={(exercise, index, value) => setExercises(prev => {
                      const exerciseSets = [...(prev[exercise] || [])];
                      exerciseSets[index] = { 
                        ...exerciseSets[index], 
                        reps: parseInt(value) || 0
                      };
                      return {
                        ...prev,
                        [exercise]: exerciseSets
                      };
                    })}
                    onRestTimeChange={(exercise, index, value) => setExercises(prev => {
                      const exerciseSets = [...(prev[exercise] || [])];
                      exerciseSets[index] = { 
                        ...exerciseSets[index], 
                        restTime: parseInt(value) || 0
                      };
                      return {
                        ...prev,
                        [exercise]: exerciseSets
                      };
                    })}
                    onWeightIncrement={(exercise, index, increment) => setExercises(prev => {
                      const exerciseSets = [...(prev[exercise] || [])];
                      const currentWeight = exerciseSets[index].weight || 0;
                      exerciseSets[index] = { 
                        ...exerciseSets[index], 
                        weight: Math.max(0, currentWeight + increment)
                      };
                      return {
                        ...prev,
                        [exercise]: exerciseSets
                      };
                    })}
                    onRepsIncrement={(exercise, index, increment) => setExercises(prev => {
                      const exerciseSets = [...(prev[exercise] || [])];
                      const currentReps = exerciseSets[index].reps || 0;
                      exerciseSets[index] = { 
                        ...exerciseSets[index], 
                        reps: Math.max(0, currentReps + increment)
                      };
                      return {
                        ...prev,
                        [exercise]: exerciseSets
                      };
                    })}
                    onRestTimeIncrement={(exercise, index, increment) => setExercises(prev => {
                      const exerciseSets = [...(prev[exercise] || [])];
                      const currentRestTime = exerciseSets[index].restTime || 0;
                      exerciseSets[index] = { 
                        ...exerciseSets[index], 
                        restTime: Math.max(0, currentRestTime + increment)
                      };
                      return {
                        ...prev,
                        [exercise]: exerciseSets
                      };
                    })}
                    isActive={activeExercise === exerciseName}
                    onShowRestTimer={handleShowRestTimer}
                    onResetRestTimer={handleResetRestTimer}
                  />
                </div>
              ))}
            </div>
            
            <WorkoutCompletion
              exercises={exercises}
              intensity={intensity}
              efficiency={efficiency}
              onComplete={handleCompleteWorkout}
            />
          </>
        ) : (
          <EmptyWorkoutState onTemplateSelect={handleAddExercise} />
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
