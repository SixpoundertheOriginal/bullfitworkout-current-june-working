import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useWorkoutStore } from '@/store/workoutStore';
import { useWorkoutTimer } from '@/hooks/useWorkoutTimer';
import { useExercises } from "@/hooks/useExercises";
import { WorkoutSessionHeader } from "@/components/training/WorkoutSessionHeader";
import { ExerciseList } from "@/components/training/ExerciseList";
import { AddExerciseSheet } from "@/components/training/AddExerciseSheet";
import { Loader2 } from "lucide-react";
import { Exercise } from "@/types/exercise";
import { useSound } from "@/hooks/useSound";
import { RestTimer } from "@/components/RestTimer";
import { WorkoutSessionFooter } from "@/components/training/WorkoutSessionFooter";
import { adaptExerciseSets, adaptToStoreFormat } from "@/utils/exerciseAdapter";
import { ReadyWorkoutState } from "@/components/training/ReadyWorkoutState";
import { WorkoutMotivation } from "@/components/training/WorkoutMotivation";
import { generateWorkoutTemplate, convertTemplateToStoreFormat } from "@/services/workoutTemplateService";
import { WorkoutProgressTracker } from "@/components/training/WorkoutProgressTracker";
import { InteractionFeedback, useFeedback } from "@/components/training/InteractionFeedback";

const TrainingSessionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { exercises: allExercises, isLoading: loadingExercises } = useExercises();
  
  const {
    exercises: storeExercises,
    setExercises: setStoreExercises,
    activeExercise,
    setActiveExercise,
    elapsedTime,
    resetSession,
    restTimerActive,
    setRestTimerActive,
    currentRestTime,
    setCurrentRestTime,
    handleCompleteSet,
    workoutStatus,
    markAsSaving,
    markAsFailed,
    workoutId,
    deleteExercise,
    startWorkout,
    updateLastActiveRoute,
    trainingConfig,
    isActive,
    setTrainingConfig,
    setWorkoutStatus
  } = useWorkoutStore();
  
  // Convert store exercises to the format expected by components
  const exercises = adaptExerciseSets(storeExercises);
  
  const [completedSets, totalSets] = Object.entries(exercises).reduce(
    ([completed, total], [_, sets]) => [
      completed + sets.filter(s => s.completed).length,
      total + sets.length
    ],
    [0, 0]
  );

  // Add feedback hook
  const { feedbackMessages, showFeedback } = useFeedback();

  useWorkoutTimer();
  const { play: playBell } = useSound('/sounds/bell.mp3');
  const { play: playTick } = useSound('/sounds/tick.mp3');
  const [isAddExerciseSheetOpen, setIsAddExerciseSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showRestTimerModal, setShowRestTimerModal] = useState(false);
  const [restTimerResetSignal, setRestTimerResetSignal] = useState(0);
  const [pageLoaded, setPageLoaded] = useState(false);

  const exerciseCount = Object.keys(exercises).length;
  const hasExercises = exerciseCount > 0;
  
  useEffect(() => { setPageLoaded(true); }, []);

  useEffect(() => {
    if (Object.keys(exercises).length > 0 && workoutStatus === 'saving') {
      setIsSaving(false);
      if (isActive) setWorkoutStatus('active');
    }
  }, [exercises, workoutStatus, isActive, setWorkoutStatus]);

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

  const triggerRestTimerReset = () => setRestTimerResetSignal(x => x + 1);

  // Define the onAddSet function to add a basic set to an exercise
  const handleAddSet = (exerciseName: string) => {
    setStoreExercises(prev => ({
      ...prev,
      [exerciseName]: [...prev[exerciseName], { weight: 0, reps: 0, restTime: 60, completed: false, isEditing: false }]
    }));
  };

  // Enhanced set completion with feedback
  const handleCompleteSetWithFeedback = (exerciseName: string, setIndex: number) => {
    handleCompleteSet(exerciseName, setIndex);
    showFeedback(
      `Set ${setIndex + 1} completed! Great work! 💪`,
      'success'
    );
  };

  // Enhanced exercise addition with feedback
  const handleAddExerciseWithFeedback = (exercise: Exercise | string) => {
    const name = typeof exercise === 'string' ? exercise : exercise.name;
    if (storeExercises[name]) {
      toast({ title: "Exercise already added", description: `${name} is already in your workout` });
      return;
    }
    setStoreExercises(prev => ({ ...prev, [name]: [{ weight: 0, reps: 0, restTime: 60, completed: false, isEditing: false }] }));
    setActiveExercise(name);
    if (workoutStatus === 'idle') startWorkout();
    setIsAddExerciseSheetOpen(false);
    
    showFeedback(
      `${name} added to workout`,
      'info'
    );
  };

  // Enhanced exercise deletion with feedback
  const handleDeleteExerciseWithFeedback = (exerciseName: string) => {
    deleteExercise(exerciseName);
    showFeedback(
      `${exerciseName} removed from workout`,
      'warning'
    );
  };

  const handleAutoPopulateWorkout = () => {
    if (!workoutTemplate) return;
    
    const autoExercises = convertTemplateToStoreFormat(workoutTemplate);
    setStoreExercises(autoExercises);
    
    // Set the first exercise as active
    const firstExercise = Object.keys(autoExercises)[0];
    if (firstExercise) {
      setActiveExercise(firstExercise);
    }
    
    // Start the workout
    startWorkout();
    setShowReadyState(false);
    
    toast({
      title: "Workout loaded!",
      description: `${Object.keys(autoExercises).length} exercises ready to go`
    });
  };

  const handleShowRestTimer = () => { setRestTimerActive(true); setShowRestTimerModal(true); playBell(); };
  const handleRestTimerComplete = () => { setRestTimerActive(false); setShowRestTimerModal(false); playBell(); };

  const handleFinishWorkout = async () => {
    if (!hasExercises) {
      toast.error("Add at least one exercise before finishing your workout");
      return;
    }
    try {
      setIsSaving(true);
      markAsSaving();
      const now = new Date();
      const startTime = new Date(now.getTime() - elapsedTime * 1000);
      const workoutData = {
        exercises: Object.fromEntries(
          Object.entries(storeExercises).map(([name, sets]) => [
            name,
            sets.map(s => ({ ...s, isEditing: s.isEditing || false }))
          ])
        ),
        duration: elapsedTime,
        startTime,
        endTime: now,
        trainingType: trainingConfig?.trainingType || "Strength",
        name: trainingConfig?.trainingType || "Workout",
        trainingConfig: trainingConfig || null,
        notes: "",
        metrics: {
          trainingConfig: trainingConfig || null,
          performance: { completedSets, totalSets, restTimers: { defaultTime: currentRestTime, wasUsed: restTimerActive } },
          progression: {
            timeOfDay: startTime.getHours() < 12 ? 'morning' :
                       startTime.getHours() < 17 ? 'afternoon' : 'evening',
            totalVolume: Object.values(storeExercises).flat().reduce((acc, s) => acc + (s.completed ? s.weight * s.reps : 0), 0)
          },
          sessionDetails: { exerciseCount, averageRestTime: currentRestTime, workoutDensity: completedSets / (elapsedTime / 60) }
        }
      };
      navigate("/workout-complete", { state: { workoutData } });
    } catch (err) {
      console.error("Error preparing workout data:", err);
      markAsFailed({ type: 'unknown', message: err instanceof Error ? err.message : 'Save failed', timestamp: new Date().toISOString(), recoverable: true });
      toast.error("Failed to complete workout");
      setIsSaving(false);
    }
  };

  const attemptRecovery = () => {
    console.log("Recovery attempt for workout:", workoutId);
    toast.info("Attempting to recover workout data...");
  };

  // Auto-populate workout logic
  const [workoutTemplate, setWorkoutTemplate] = useState(null);
  const [showReadyState, setShowReadyState] = useState(false);
  
  useEffect(() => {
    // Show ready state if we have training config but no exercises
    if (trainingConfig && !hasExercises && workoutStatus === 'idle') {
      const template = generateWorkoutTemplate(trainingConfig);
      setWorkoutTemplate(template);
      setShowReadyState(true);
    } else {
      setShowReadyState(false);
    }
  }, [trainingConfig, hasExercises, workoutStatus]);
  
  if (loadingExercises) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading exercises...
      </div>
    );
  }

  // Calculate navigation state
  const exerciseNames = Object.keys(exercises);
  const currentExerciseIndex = activeExercise ? exerciseNames.indexOf(activeExercise) : 0;
  
  // Set up the adapter function to convert between the different exercise formats
  const handleSetExercises = (updatedExercises) => {
    if (typeof updatedExercises === 'function') {
      setStoreExercises(prev => adaptToStoreFormat(updatedExercises(adaptExerciseSets(prev))));
    } else {
      setStoreExercises(adaptToStoreFormat(updatedExercises));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white pt-16 pb-16">
      {/* Feedback Toast Container */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        {feedbackMessages.map((feedback) => (
          <motion.div
            key={feedback.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm
              ${feedback.type === 'success' 
                ? 'bg-green-600/90 text-green-100' 
                : feedback.type === 'warning'
                  ? 'bg-orange-600/90 text-orange-100'
                  : 'bg-blue-600/90 text-blue-100'
              }
            `}
          >
            {feedback.icon}
            <span className="text-sm font-medium">{feedback.message}</span>
          </motion.div>
        ))}
      </div>

      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-3xl px-4 py-6 pb-40">
          
          {/* Show Ready State for Auto-Populated Workouts */}
          {showReadyState && workoutTemplate && (
            <div className="space-y-6">
              <ReadyWorkoutState
                template={workoutTemplate}
                onStartWorkout={handleAutoPopulateWorkout}
                trainingType={trainingConfig?.trainingType || "Strength"}
              />
              
              <WorkoutMotivation
                xpReward={workoutTemplate.xpReward}
                trainingType={trainingConfig?.trainingType || "Strength"}
              />
              
              {/* Manual option */}
              <div className="text-center pt-4">
                <button
                  onClick={() => setShowReadyState(false)}
                  className="text-white/60 hover:text-white text-sm underline"
                >
                  Prefer to build your own workout?
                </button>
              </div>
            </div>
          )}

          {/* Standard workout session UI */}
          {!showReadyState && (
            <>
              <div className="mb-6 relative">
                <WorkoutSessionHeader
                  elapsedTime={elapsedTime}
                  exerciseCount={exerciseCount}
                  completedSets={completedSets}
                  totalSets={totalSets}
                  workoutStatus={workoutStatus}
                  isRecoveryMode={!!workoutId}
                  saveProgress={0}
                  onRetrySave={() => workoutId && attemptRecovery()}
                  onResetWorkout={resetSession}
                  restTimerActive={restTimerActive}
                  onRestTimerComplete={handleRestTimerComplete}
                  onShowRestTimer={handleShowRestTimer}
                  onRestTimerReset={triggerRestTimerReset}
                  restTimerResetSignal={restTimerResetSignal}
                  currentRestTime={currentRestTime}
                />
                {showRestTimerModal && (
                  <div className="absolute right-4 top-full z-50 mt-2 w-72">
                    <RestTimer
                      isVisible={showRestTimerModal}
                      onClose={() => { setShowRestTimerModal(false); setRestTimerActive(false); }}
                      onComplete={handleRestTimerComplete}
                      maxTime={currentRestTime || 60}
                    />
                  </div>
                )}
              </div>

              {/* Add Progress Tracker for Navigation Clarity */}
              {hasExercises && (
                <WorkoutProgressTracker
                  currentExerciseIndex={currentExerciseIndex}
                  totalExercises={exerciseNames.length}
                  completedSets={completedSets}
                  totalSets={totalSets}
                  exercises={exerciseNames}
                  activeExercise={activeExercise}
                />
              )}

              <ExerciseList
                exercises={exercises}
                activeExercise={activeExercise}
                onAddSet={handleAddSet}
                onCompleteSet={handleCompleteSetWithFeedback}
                onDeleteExercise={handleDeleteExerciseWithFeedback}
                onRemoveSet={(name, i) => {
                  setStoreExercises(prev => ({ ...prev, [name]: prev[name].filter((_, idx) => idx !== i) }));
                  showFeedback(`Set removed from ${name}`, 'info');
                }}
                onEditSet={(name, i) => {
                  setStoreExercises(prev => ({ ...prev, [name]: prev[name].map((s, idx) => idx === i ? { ...s, isEditing: true } : s) }));
                }}
                onSaveSet={(name, i) => {
                  setStoreExercises(prev => ({ ...prev, [name]: prev[name].map((s, idx) => idx === i ? { ...s, isEditing: false } : s) }));
                  showFeedback(`${name} set updated`, 'success');
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
                onShowRestTimer={handleShowRestTimer}
                onResetRestTimer={triggerRestTimerReset}
                onOpenAddExercise={() => setIsAddExerciseSheetOpen(true)}
                setExercises={handleSetExercises}
              />
            </>
          )}
        </div>
      </main>

      {/* Bottom drawer for Add & Finish - only show when not in ready state */}
      {!showReadyState && (
        <WorkoutSessionFooter
          onAddExercise={() => setIsAddExerciseSheetOpen(true)}
          onFinishWorkout={handleFinishWorkout}
          hasExercises={hasExercises}
          isSaving={isSaving}
        />
      )}

      <AddExerciseSheet
        open={isAddExerciseSheetOpen}
        onOpenChange={setIsAddExerciseSheetOpen}
        onSelectExercise={handleAddExerciseWithFeedback}
        trainingType={trainingConfig?.trainingType}
      />
    </div>
  );
};

export default TrainingSessionPage;
