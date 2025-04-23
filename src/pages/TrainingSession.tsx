import React, { useRef } from "react";
import { useElementVisibility } from "@/hooks/useElementVisibility";
import { useIsMobile } from "@/hooks/use-mobile";
import { EmptyWorkoutState } from "@/components/EmptyWorkoutState";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate, useLocation, useSearchParams, useBeforeUnload } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { WorkoutMetrics } from "@/components/WorkoutMetrics";
import { WorkoutCompletion } from "@/components/training/WorkoutCompletion";
import { useWorkoutState } from "@/hooks/useWorkoutState";
import { trainingTypes } from "@/constants/trainingTypes";
import { ExerciseList } from "@/components/training/ExerciseList";
import { WorkoutHeader } from "@/components/training/WorkoutHeader";
import { AddExerciseSheet } from "@/components/training/AddExerciseSheet";
import { ExerciseSet } from "@/types/exercise";
import { saveWorkout, processRetryQueue, recoverPartiallyCompletedWorkout } from "@/services/workoutSaveService";
import { WorkoutSaveStatus } from "@/components/WorkoutSaveStatus";
import { SaveProgress } from "@/types/workout";

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
    resetSession,
    restTimerActive,
    setRestTimerActive,
    restTimerResetSignal,
    triggerRestTimerReset,
    currentRestTime,
    
    workoutStatus,
    isRecoveryMode,
    saveProgress,
    workoutId,
    markAsSaving,
    markAsPartialSave,
    markAsSaved,
    markAsFailed,
    updateSaveProgress,
    attemptRecovery
  } = useWorkoutState();
  
  const [showAddExerciseSheet, setShowAddExerciseSheet] = React.useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
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
      const currentSet = exerciseSets[setIndex];
      exerciseSets[setIndex] = { 
        ...currentSet, 
        completed: true,
        isEditing: false 
      };
      
      if (setIndex < exerciseSets.length - 1) {
        exerciseSets[setIndex + 1] = {
          ...exerciseSets[setIndex + 1],
          restTime: currentSet.restTime || 60
        };
      }
      
      const currentRestTime = currentSet.restTime;
      console.log(`Set ${setIndex + 1} completed with rest time: ${currentRestTime}s`);
      
      triggerRestTimerReset(currentRestTime);
      
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
      toast("No exercises added", {
        description: "Please add at least one exercise before completing your workout",
      });
      return;
    }
    
    if (!user) {
      toast("Authentication required", {
        description: "You need to be logged in to save workouts",
      });
      return;
    }
    
    try {
      markAsSaving();
      
      const now = new Date();
      const startTime = new Date(now.getTime() - elapsedTime * 1000);
      
      const workoutData = {
        name: `Workout ${now.toLocaleDateString()}`,
        training_type: trainingType || 'strength',
        start_time: startTime.toISOString(),
        end_time: now.toISOString(),
        duration: elapsedTime || 0,
        notes: null
      };
      
      const saveResult = await saveWorkout({
        userData: user,
        workoutData,
        exercises,
        onProgressUpdate: (progress) => {
          updateSaveProgress(progress.step, progress.completed);
        }
      });
      
      if (saveResult.success) {
        if (saveResult.partialSave) {
          markAsPartialSave(saveResult.error ? [saveResult.error] : []);
          navigateToComplete(saveResult.workoutId || null);
        } else {
          markAsSaved(saveResult.workoutId || '');
          resetSession();
          navigateToComplete(saveResult.workoutId || null);
        }
      } else {
        markAsFailed(saveResult.error || {
          type: 'unknown',
          message: 'Unknown error during save',
          timestamp: new Date().toISOString(),
          recoverable: false
        });
      }
    } catch (error) {
      console.error('Error in workout completion process:', error);
      markAsFailed({
        type: 'unknown',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString(),
        recoverable: true
      });
      
      toast("Error", {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    }
  };

  const handleRetrySave = async () => {
    if (!user || !workoutId) return;
    
    if (workoutId) {
      toast("Attempting recovery", {
        description: "Trying to recover your workout data..."
      });
      
      await attemptRecovery();
      
      if (user.id) {
        await processRetryQueue(user.id);
      }
      
    } else {
      handleCompleteWorkout();
    }
  };

  const handleWorkoutError = async (error: any) => {
    console.error("Error in workout process:", error);
    const errorMessage = error?.message || "Unknown error";
    
    if (errorMessage.includes("materialized view")) {
      toast("Partial save", {
        description: "Your workout data was saved but some analytics couldn't be processed.",
      });
      navigateToComplete(null);
    } else {
      toast("Error", {
        description: errorMessage,
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
            completed: set.completed || false,
            rest_time: set.restTime || 60
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
          exercises: Object.fromEntries(
            Object.entries(exercises).map(([name, sets]) => [
              name,
              sets.map((set, index) => ({
                id: `temp-${name}-${index}`,
                exercise_name: name,
                workout_id: workoutId || 'temp',
                set_number: index + 1,
                weight: set.weight,
                reps: set.reps,
                completed: set.completed,
                rest_time: set.restTime
              }))
            ])
          ) as unknown as Record<string, ExerciseSet[]>,
          duration: elapsedTime,
          startTime: new Date(now.getTime() - elapsedTime * 1000),
          endTime: now,
          trainingType: trainingType || 'strength',
          name: `Workout ${now.toLocaleDateString()}`
        }
      }
    });
  };
  
  const handleRestTimerComplete = () => setRestTimerActive(false);
  const handleShowRestTimer = () => setRestTimerActive(true);
  const handleResetRestTimer = () => triggerRestTimerReset();
  
  const handleEditSet = (exercise: string, index: number) => setExercises(prev => {
    const exerciseSets = [...(prev[exercise] || [])];
    exerciseSets[index] = { 
      ...exerciseSets[index], 
      isEditing: true 
    };
    return {
      ...prev,
      [exercise]: exerciseSets
    };
  });

  const handleSaveSet = (exercise: string, index: number) => setExercises(prev => {
    const exerciseSets = [...(prev[exercise] || [])];
    exerciseSets[index] = { 
      ...exerciseSets[index], 
      isEditing: false 
    };
    return {
      ...prev,
      [exercise]: exerciseSets
    };
  });

  const handleWeightChange = (exercise: string, index: number, value: string) => setExercises(prev => {
    const exerciseSets = [...(prev[exercise] || [])];
    exerciseSets[index] = { 
      ...exerciseSets[index], 
      weight: parseFloat(value) || 0
    };
    return {
      ...prev,
      [exercise]: exerciseSets
    };
  });

  const handleRepsChange = (exercise: string, index: number, value: string) => setExercises(prev => {
    const exerciseSets = [...(prev[exercise] || [])];
    exerciseSets[index] = { 
      ...exerciseSets[index], 
      reps: parseInt(value) || 0
    };
    return {
      ...prev,
      [exercise]: exerciseSets
    };
  });

  const handleRestTimeChange = (exercise: string, index: number, value: string) => setExercises(prev => {
    const exerciseSets = [...(prev[exercise] || [])];
    exerciseSets[index] = { 
      ...exerciseSets[index], 
      restTime: parseInt(value) || 0
    };
    return {
      ...prev,
      [exercise]: exerciseSets
    };
  });

  const handleWeightIncrement = (exercise: string, index: number, increment: number) => setExercises(prev => {
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
  });

  const handleRepsIncrement = (exercise: string, index: number, increment: number) => setExercises(prev => {
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
  });

  const handleRestTimeIncrement = (exercise: string, index: number, increment: number) => setExercises(prev => {
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
  });

  return (
    <div className="pb-20">
      <AddExerciseSheet
        open={showAddExerciseSheet}
        onOpenChange={setShowAddExerciseSheet}
        onSelectExercise={handleAddExercise}
      />

      <WorkoutHeader trainingType={trainingTypeObj} />
      
      <div className="sticky top-16 z-10 bg-gray-900/80 backdrop-blur-lg" ref={metricsRef}>
        <WorkoutMetrics
          time={elapsedTime}
          exerciseCount={Object.keys(exercises).length}
          completedSets={completedSets}
          totalSets={totalSets}
          showRestTimer={restTimerActive}
          onRestTimerComplete={handleRestTimerComplete}
          onManualRestStart={handleShowRestTimer}
          onRestTimerReset={handleResetRestTimer}
          restTimerResetSignal={restTimerResetSignal}
          currentRestTime={activeExercise && exercises[activeExercise]?.length > 0 ? 
            exercises[activeExercise].find(set => !set.completed)?.restTime || 60 : 60}
        />
      </div>
      
      {workoutStatus !== 'idle' && workoutStatus !== 'active' && (
        <div className="px-4 mt-2">
          <WorkoutSaveStatus 
            status={workoutStatus}
            saveProgress={saveProgress}
            onRetry={handleRetrySave}
          />
        </div>
      )}
      
      <div className="px-4 py-2">
        {Object.keys(exercises).length > 0 ? (
          <>
            <ExerciseList
              exercises={exercises}
              activeExercise={activeExercise}
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
              onShowRestTimer={handleShowRestTimer}
              onResetRestTimer={handleResetRestTimer}
            />
            
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
      
      {workoutStatus === 'partial' && (
        <div className="fixed bottom-20 left-0 right-0 flex justify-center px-4">
          <Button
            variant="default"
            onClick={handleRetrySave}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            Retry Saving Workout Data
          </Button>
        </div>
      )}
    </div>
  );
};

export default TrainingSession;
