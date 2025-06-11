
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useWorkoutStore } from '@/store/workoutStore';
import { useWorkoutTimer } from '@/hooks/useWorkoutTimer';
import { useExercises } from "@/hooks/useExercises";
import { AddExerciseSheet } from "@/components/training/AddExerciseSheet";
import { Loader2 } from "lucide-react";
import { WorkoutSessionFooter } from "@/components/training/WorkoutSessionFooter";
import { InteractionFeedback } from "@/components/training/InteractionFeedback";
import { useWorkoutActions } from "@/hooks/useWorkoutActions";
import { WorkoutFeedbackSystem } from "@/components/training/WorkoutFeedbackSystem";
import { ReadyWorkoutSection } from "@/components/training/ReadyWorkoutSection";
import { ActiveWorkoutSection } from "@/components/training/ActiveWorkoutSection";

const TrainingSessionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { exercises: allExercises, isLoading: loadingExercises } = useExercises();
  
  const {
    exercises: storeExercises,
    setExercises: setStoreExercises,
    activeExercise,
    elapsedTime,
    resetSession,
    workoutStatus,
    workoutId,
    startWorkout,
    updateLastActiveRoute,
    trainingConfig,
    isActive,
    setTrainingConfig,
    setWorkoutStatus
  } = useWorkoutStore();
  
  // Use the extracted actions hook
  const {
    isAddExerciseSheetOpen,
    setIsAddExerciseSheetOpen,
    isSaving,
    setIsSaving,
    handleAddSet,
    handleCompleteSetWithFeedback,
    handleAddExerciseWithFeedback,
    handleDeleteExerciseWithFeedback,
    handleAutoPopulateWorkout,
    handleFinishWorkout,
    handleSetExercises,
    showFeedback,
    hasExercises,
    exerciseCount
  } = useWorkoutActions();
  
  // Convert store exercises format to the format expected by ExerciseList
  const convertedExercises = Object.entries(storeExercises).reduce((acc, [exerciseName, sets]) => {
    acc[exerciseName] = sets.map((set, index) => ({
      id: `temp-${exerciseName}-${index}`,
      weight: set.weight,
      reps: set.reps,
      restTime: set.restTime,
      completed: set.completed,
      isEditing: set.isEditing,
      set_number: index + 1,
      exercise_name: exerciseName,
      workout_id: workoutId || 'temp'
    }));
    return acc;
  }, {} as Record<string, any[]>);
  
  const [completedSets, totalSets] = Object.entries(storeExercises).reduce(
    ([completed, total], [_, sets]) => [
      completed + sets.filter(s => s.completed).length,
      total + sets.length
    ],
    [0, 0]
  );

  // Calculate total volume (tonnage) and total reps
  const [totalVolume, totalReps] = Object.entries(storeExercises).reduce(
    ([volume, reps], [_, sets]) => {
      const completedSets = sets.filter(s => s.completed);
      const exerciseVolume = completedSets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
      const exerciseReps = completedSets.reduce((sum, set) => sum + set.reps, 0);
      return [volume + exerciseVolume, reps + exerciseReps];
    },
    [0, 0]
  );

  useWorkoutTimer();
  const [pageLoaded, setPageLoaded] = useState(false);
  
  useEffect(() => { setPageLoaded(true); }, []);

  useEffect(() => {
    if (Object.keys(storeExercises).length > 0 && workoutStatus === 'saving') {
      setIsSaving(false);
      if (isActive) setWorkoutStatus('active');
    }
  }, [storeExercises, workoutStatus, isActive, setWorkoutStatus]);

  useEffect(() => {
    if (location.pathname === '/training-session') {
      updateLastActiveRoute('/training-session');
    }
    console.log('TrainingSession page state:', { isActive, exerciseCount, elapsedTime, workoutStatus, isSaving });
  }, []);

  useEffect(() => {
    if (pageLoaded && workoutStatus === 'idle' && hasExercises) {
      startWorkout();
    }
  }, [pageLoaded, workoutStatus, hasExercises, startWorkout]);

  useEffect(() => {
    if (location.state?.trainingConfig && !isActive) {
      setTrainingConfig(location.state.trainingConfig);
    }
    if (location.state?.fromDiscard) {
      setIsSaving(false);
    }
  }, [location.state, isActive, setTrainingConfig]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('reset') === 'true') {
      resetSession();
      toast.info("Workout session reset");
      navigate('/training-session', { replace: true });
    }
  }, [location.search, resetSession, navigate]);

  useEffect(() => {
    if (workoutStatus === 'saved') {
      console.log('Workout saved successfully');
    }
  }, [workoutStatus]);

  // Auto-populate workout logic
  const [showReadyState, setShowReadyState] = useState(false);
  
  useEffect(() => {
    // Show ready state if we have training config but no exercises
    if (trainingConfig && !hasExercises && workoutStatus === 'idle') {
      setShowReadyState(true);
    } else {
      setShowReadyState(false);
    }
  }, [trainingConfig, hasExercises, workoutStatus]);
  
  if (loadingExercises) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-4 text-white"
        >
          <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          <p className="text-white/80 font-medium">Loading exercises...</p>
        </motion.div>
      </div>
    );
  }

  // Calculate navigation state
  const exerciseNames = Object.keys(storeExercises);
  const currentExerciseIndex = activeExercise ? exerciseNames.indexOf(activeExercise) : 0;

  return (
    <div className="flex flex-col min-h-screen bg-black text-white relative">
      {/* Enhanced Feedback Toast Container */}
      <WorkoutFeedbackSystem />

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16 pb-20">
        <div className="mx-auto max-w-4xl px-4 py-6">
          
          {/* Ready State Section */}
          {showReadyState && (
            <ReadyWorkoutSection
              trainingConfig={trainingConfig}
              onAutoPopulateWorkout={handleAutoPopulateWorkout}
              onManualWorkout={() => setShowReadyState(false)}
            />
          )}

          {/* Active Workout Session */}
          {!showReadyState && (
            <ActiveWorkoutSection
              exerciseCount={exerciseCount}
              completedSets={completedSets}
              totalSets={totalSets}
              totalVolume={totalVolume}
              totalReps={totalReps}
              currentExerciseIndex={currentExerciseIndex}
              exerciseNames={exerciseNames}
              activeExercise={activeExercise}
              convertedExercises={convertedExercises}
              onAddSet={handleAddSet}
              onCompleteSet={handleCompleteSetWithFeedback}
              onDeleteExercise={handleDeleteExerciseWithFeedback}
              onRemoveSet={(name, i) => {
                setStoreExercises(prev => ({ ...prev, [name]: prev[name].filter((_, idx) => idx !== i) }));
              }}
              onEditSet={(name, i) => {
                setStoreExercises(prev => ({ ...prev, [name]: prev[name].map((s, idx) => idx === i ? { ...s, isEditing: true } : s) }));
              }}
              onSaveSet={(name, i) => {
                setStoreExercises(prev => ({ ...prev, [name]: prev[name].map((s, idx) => idx === i ? { ...s, isEditing: false } : s) }));
              }}
              onWeightChange={(name, i, v) => {
                setStoreExercises(prev => ({ ...prev, [name]: prev[name].map((s, idx) => idx === i ? { ...s, weight: +v || 0 } : s) }));
              }}
              onRepsChange={(name, i, v) => {
                setStoreExercises(prev => ({ ...prev, [name]: prev[name].map((s, idx) => idx === i ? { ...s, reps: parseInt(v) || 0 } : s) }));
              }}
              onRestTimeChange={(name, i, v) => {
                setStoreExercises(prev => ({ ...prev, [name]: prev[name].map((s, idx) => idx === i ? { ...s, restTime: parseInt(v) || 60 } : s) }));
              }}
              onWeightIncrement={(name, i, inc) => {
                setStoreExercises(prev => {
                  const set = prev[name][i];
                  return { ...prev, [name]: prev[name].map((s, idx) => idx === i ? { ...s, weight: Math.max(0, (set.weight || 0) + inc) } : s) };
                });
              }}
              onRepsIncrement={(name, i, inc) => {
                setStoreExercises(prev => {
                  const set = prev[name][i];
                  return { ...prev, [name]: prev[name].map((s, idx) => idx === i ? { ...s, reps: Math.max(0, (set.reps || 0) + inc) } : s) };
                });
              }}
              onRestTimeIncrement={(name, i, inc) => {
                setStoreExercises(prev => {
                  const set = prev[name][i];
                  return { ...prev, [name]: prev[name].map((s, idx) => idx === i ? { ...s, restTime: Math.max(0, (set.restTime || 60) + inc) } : s) };
                });
              }}
              onOpenAddExercise={() => setIsAddExerciseSheetOpen(true)}
              setExercises={handleSetExercises}
              showFeedback={showFeedback}
            />
          )}
        </div>
      </main>

      {/* Enhanced Footer */}
      {!showReadyState && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <WorkoutSessionFooter
            onAddExercise={() => setIsAddExerciseSheetOpen(true)}
            onFinishWorkout={handleFinishWorkout}
            hasExercises={hasExercises}
            isSaving={isSaving}
          />
        </motion.div>
      )}

      {/* Enhanced Add Exercise Sheet */}
      <AddExerciseSheet
        open={isAddExerciseSheetOpen}
        onOpenChange={setIsAddExerciseSheetOpen}
        onSelectExercise={handleAddExerciseWithFeedback}
        trainingType={trainingConfig?.trainingType}
      />
      
      {/* Interaction Feedback Provider */}
      <InteractionFeedback />
    </div>
  );
};

export default TrainingSessionPage;
