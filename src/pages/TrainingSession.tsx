
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useWorkoutStore } from '@/store/workoutStore';
import { useWorkoutTimer } from '@/hooks/useWorkoutTimer';
import { useExercises } from "@/hooks/useExercises";
import { WorkoutSessionHeader } from "@/components/training/WorkoutSessionHeader";
import { ExerciseList } from "@/components/training/ExerciseList";
import { AddExerciseSheet } from "@/components/training/AddExerciseSheet";
import { WorkoutMetrics } from "@/components/WorkoutMetrics";
import { Loader2 } from "lucide-react";
import { Exercise } from "@/types/exercise";
import { useSound } from "@/hooks/useSound";
import { RestTimer } from "@/components/RestTimer";
import { WorkoutSessionFooter } from "@/components/training/WorkoutSessionFooter";
import { ReadyWorkoutState } from "@/components/training/ReadyWorkoutState";
import { WorkoutMotivation } from "@/components/training/WorkoutMotivation";
import { generateWorkoutTemplate, convertTemplateToStoreFormat } from "@/services/workoutTemplateService";
import { WorkoutProgressTracker } from "@/components/training/WorkoutProgressTracker";
import { InteractionFeedback, useFeedback } from "@/components/training/InteractionFeedback";
import { useTrainingTimers } from "@/hooks/useTrainingTimers";

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
  
  // Use new unified timer system
  const { workoutTimer, restTimer, handleSetCompletion } = useTrainingTimers();
  
  // Work directly with store exercises format (no adapters needed)
  const exercises = storeExercises;
  
  const [completedSets, totalSets] = Object.entries(exercises).reduce(
    ([completed, total], [_, sets]) => [
      completed + sets.filter(s => s.completed).length,
      total + sets.length
    ],
    [0, 0]
  );

  // Calculate total volume (tonnage) and total reps
  const [totalVolume, totalReps] = Object.entries(exercises).reduce(
    ([volume, reps], [_, sets]) => {
      const completedSets = sets.filter(s => s.completed);
      const exerciseVolume = completedSets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
      const exerciseReps = completedSets.reduce((sum, set) => sum + set.reps, 0);
      return [volume + exerciseVolume, reps + exerciseReps];
    },
    [0, 0]
  );

  // Add feedback hook
  const { feedbackMessages, showFeedback } = useFeedback();

  useWorkoutTimer();
  const { play: playBell } = useSound('/sounds/bell.mp3');
  const [isAddExerciseSheetOpen, setIsAddExerciseSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  // Define the onAddSet function to add a basic set to an exercise
  const handleAddSet = (exerciseName: string) => {
    setStoreExercises(prev => ({
      ...prev,
      [exerciseName]: [...prev[exerciseName], { weight: 0, reps: 0, restTime: 60, completed: false, isEditing: false }]
    }));
  };

  // Enhanced set completion with unified timer system
  const handleCompleteSetWithFeedback = (exerciseName: string, setIndex: number) => {
    handleSetCompletion(exerciseName, setIndex);
    showFeedback(
      `Set ${setIndex + 1} completed! Rest timer started 💪`,
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
      
      // Use the store's exercise format directly - convert to the format expected by WorkoutCompletePage
      const workoutData = {
        exercises: exercises, // This is already in the correct store format
        duration: elapsedTime,
        startTime,
        endTime: now,
        trainingType: trainingConfig?.trainingType || "Strength",
        name: trainingConfig?.trainingType || "Workout",
        trainingConfig: trainingConfig || null,
        notes: "",
        metrics: {
          trainingConfig: trainingConfig || null,
          performance: { completedSets, totalSets, restTimers: { defaultTime: 60, wasUsed: false } },
          progression: {
            timeOfDay: startTime.getHours() < 12 ? 'morning' :
                       startTime.getHours() < 17 ? 'afternoon' : 'evening',
            totalVolume: Object.values(storeExercises).flat().reduce((acc, s) => acc + (s.completed ? s.weight * s.reps : 0), 0)
          },
          sessionDetails: { exerciseCount, averageRestTime: 60, workoutDensity: completedSets / (elapsedTime / 60) }
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
  const exerciseNames = Object.keys(exercises);
  const currentExerciseIndex = activeExercise ? exerciseNames.indexOf(activeExercise) : 0;
  
  // Work directly with store format (no adapter function needed)
  const handleSetExercises = (updatedExercises) => {
    if (typeof updatedExercises === 'function') {
      setStoreExercises(prev => updatedExercises(prev));
    } else {
      setStoreExercises(updatedExercises);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white relative">
      {/* Enhanced Feedback Toast Container */}
      <AnimatePresence>
        <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm">
          {feedbackMessages.map((feedback) => (
            <motion.div
              key={feedback.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 25,
                mass: 0.8
              }}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md border
                ${feedback.type === 'success' 
                  ? 'bg-emerald-600/90 border-emerald-500/30 text-emerald-50' 
                  : feedback.type === 'warning'
                    ? 'bg-amber-600/90 border-amber-500/30 text-amber-50'
                    : 'bg-blue-600/90 border-blue-500/30 text-blue-50'
                }
                transform-gpu will-change-transform
              `}
            >
              <div className="flex-shrink-0">
                {feedback.icon}
              </div>
              <span className="text-sm font-medium leading-5">{feedback.message}</span>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-16 pb-20">
        <div className="mx-auto max-w-4xl px-4 py-6">
          
          {/* Ready State Section */}
          {showReadyState && workoutTemplate && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="space-y-8"
            >
              <ReadyWorkoutState
                template={workoutTemplate}
                onStartWorkout={handleAutoPopulateWorkout}
                trainingType={trainingConfig?.trainingType || "Strength"}
              />
              
              <WorkoutMotivation
                xpReward={workoutTemplate.xpReward}
                trainingType={trainingConfig?.trainingType || "Strength"}
              />
              
              {/* Manual Option */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                className="text-center pt-6"
              >
                <button
                  onClick={() => setShowReadyState(false)}
                  className="text-white/60 hover:text-white text-sm underline underline-offset-4 
                           transition-colors duration-200 hover:underline-offset-2"
                >
                  Prefer to build your own workout?
                </button>
              </motion.div>
            </motion.div>
          )}

          {/* Active Workout Session */}
          {!showReadyState && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="space-y-6"
            >
              {/* Updated Workout Metrics with Unified Timer */}
              <div className="relative">
                <WorkoutMetrics
                  exerciseCount={exerciseCount}
                  completedSets={completedSets}
                  totalSets={totalSets}
                  totalVolume={totalVolume}
                  totalReps={totalReps}
                />
              </div>

              {/* Progress Tracker */}
              {hasExercises && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                >
                  <WorkoutProgressTracker
                    currentExerciseIndex={currentExerciseIndex}
                    totalExercises={exerciseNames.length}
                    completedSets={completedSets}
                    totalSets={totalSets}
                    exercises={exerciseNames}
                    activeExercise={activeExercise}
                  />
                </motion.div>
              )}

              {/* Exercise List */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
              >
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
                  onOpenAddExercise={() => setIsAddExerciseSheetOpen(true)}
                  onShowRestTimer={() => restTimer.start()}
                  onResetRestTimer={() => restTimer.reset()}
                  setExercises={handleSetExercises}
                />
              </motion.div>
            </motion.div>
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
    </div>
  );
};

export default TrainingSessionPage;
