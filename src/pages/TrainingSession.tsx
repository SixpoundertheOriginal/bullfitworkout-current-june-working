
import React, { useState, useEffect, useCallback } from "react";
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

const TrainingSessionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { exercises: allExercises, isLoading: loadingExercises } = useExercises();
  
  // Use the Zustand store
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
    markAsSaved,
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
  
  // Adapt the store exercises to the expected format for exercise components
  const exercises = adaptExerciseSets(storeExercises);
  
  // Calculate completedSets and totalSets
  const [completedSets, totalSets] = Object.entries(exercises).reduce(
    ([completed, total], [_, sets]) => [
      completed + sets.filter(set => set.completed).length,
      total + sets.length
    ],
    [0, 0]
  );
  
  // Use workout timer hook for elapsed time tracking
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
  
  // Mark page as loaded after initial render
  useEffect(() => {
    setPageLoaded(true);
  }, []);

  // Reset saving state when returning to this page
  // This is crucial for fixing the bug when returning from Workout Complete page
  useEffect(() => {
    // Only execute this if there are exercises (meaning workout is still valid)
    if (Object.keys(exercises).length > 0 && workoutStatus === 'saving') {
      console.log('Resetting saving state after returning to training session');
      setIsSaving(false);
      
      // If we're coming from the workout complete page but still have exercises,
      // we need to ensure the workout is marked as active again
      if (isActive) {
        setWorkoutStatus('active');
      }
    }
  }, [exercises, workoutStatus, isActive, setWorkoutStatus]);

  // Update last active route whenever we load this page
  // THIS IS THE MAIN ISSUE - Need to add dependencies to prevent infinite loop
  useEffect(() => {
    // Only update route when actually needed - once on mount
    if (location.pathname === '/training-session') {
      updateLastActiveRoute('/training-session');
    }
    
    // Debug logging
    console.log('TrainingSession page loaded with state:', { 
      isActive, 
      exerciseCount: Object.keys(exercises).length,
      elapsedTime,
      workoutStatus,
      isSaving
    });
    // Only run this effect once when component mounts
  }, []);

  // Start a workout if not already started but we have exercises
  useEffect(() => {
    if (pageLoaded && workoutStatus === 'idle' && Object.keys(exercises).length > 0) {
      console.log('Auto-starting workout due to existing exercises');
      startWorkout();
    }
  }, [pageLoaded, workoutStatus, exercises, startWorkout]);

  // Handle training config from navigation state
  useEffect(() => {
    if (location.state?.trainingConfig && !isActive) {
      console.log('Setting training config from navigation state');
      setTrainingConfig(location.state.trainingConfig);
    }
    
    // Check if we're returning from discarding
    if (location.state?.fromDiscard) {
      console.log('Returning from discard action, ensuring workout is active');
      setIsSaving(false); // Ensure saving state is reset
    }
  }, [location.state, isActive, setTrainingConfig]);

  // Handle reset parameter in URL
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const shouldReset = searchParams.get('reset') === 'true';
    
    if (shouldReset) {
      resetSession();
      toast.info("Workout session reset");
      
      // Clean up URL parameter
      navigate('/training-session', { replace: true });
    }
  }, [location.search, resetSession, navigate]);

  // Effect to handle workout completion status
  useEffect(() => {
    if (workoutStatus === 'saved') {
      console.log('Workout saved successfully, cleaning up state');
    }
  }, [workoutStatus]);

  const triggerRestTimerReset = () => {
    setRestTimerResetSignal(prev => prev + 1);
  };

  const handleAddExercise = (exercise: Exercise | string) => {
    const exerciseName = typeof exercise === 'string' ? exercise : exercise.name;
    
    // Only show warning toast if exercise exists
    if (storeExercises[exerciseName]) {
      toast({
        title: "Exercise already added",
        description: `${exerciseName} is already in your workout`
      });
      return;
    }

    setStoreExercises(prev => ({
      ...prev,
      [exerciseName]: [
        { weight: 0, reps: 0, restTime: 60, completed: false, isEditing: false }
      ]
    }));
    
    setActiveExercise(exerciseName);
    
    // Toast notification is now handled in AddExerciseSheet
    
    // Ensure workout is active
    if (workoutStatus === 'idle') {
      startWorkout();
    }
    
    // Close the exercise sheet after adding
    setIsAddExerciseSheetOpen(false);
  };

  const handleShowRestTimer = () => {
    setRestTimerActive(true);
    setShowRestTimerModal(true);
    playBell();
  };

  const handleRestTimerComplete = () => {
    setRestTimerActive(false);
    setShowRestTimerModal(false);
    playBell();
  };

  const handleFinishWorkout = async () => {
    if (!hasExercises) {
      toast.error("No exercises added - Please add at least one exercise before finishing your workout");
      return;
    }

    try {
      setIsSaving(true);
      markAsSaving();
      
      const now = new Date();
      const workoutStartTime = new Date(now.getTime() - elapsedTime * 1000);

      const workoutMetadata = {
        trainingConfig: trainingConfig || null,
        performance: {
          completedSets,
          totalSets,
          restTimers: {
            defaultTime: currentRestTime,
            wasUsed: restTimerActive
          }
        },
        progression: {
          timeOfDay: workoutStartTime.getHours() < 12 ? 'morning' : 
                     workoutStartTime.getHours() < 17 ? 'afternoon' : 'evening',
          totalVolume: Object.entries(storeExercises).reduce((acc, [exerciseName, sets]) => {
            return acc + sets.reduce((setAcc, set) => {
              return setAcc + (set.completed ? (set.weight * set.reps) : 0);
            }, 0);
          }, 0)
        },
        sessionDetails: {
          exerciseCount: Object.keys(storeExercises).length,
          averageRestTime: currentRestTime,
          workoutDensity: completedSets / (elapsedTime / 60)
        }
      };

      const normalizedExercises = {};
      Object.entries(storeExercises).forEach(([exerciseName, sets]) => {
        normalizedExercises[exerciseName] = sets.map(set => ({
          ...set,
          isEditing: set.isEditing || false
        }));
      });

      // Note: We don't reset session here! We'll do it after the save is confirmed
      const workoutData = {
        exercises: normalizedExercises,
        duration: elapsedTime,
        startTime: workoutStartTime,
        endTime: now,
        trainingType: trainingConfig?.trainingType || "Strength",
        name: trainingConfig?.trainingType || "Workout",
        trainingConfig: trainingConfig || null,
        notes: "",
        metrics: workoutMetadata
      };

      // Navigate to workout complete with workout data
      navigate("/workout-complete", {
        state: {
          workoutData
        }
      });
      
    } catch (error) {
      console.error("Error preparing workout data:", error);
      markAsFailed({
        type: 'unknown',
        message: error instanceof Error ? error.message : 'Failed to prepare workout data',
        timestamp: new Date().toISOString(),
        recoverable: true
      });
      toast.error("Failed to complete workout");
      setIsSaving(false);
    }
  };

  const attemptRecovery = async () => {
    // This would be implemented to recover failed workout saves
    console.log("Recovery attempt for workout:", workoutId);
    toast.info("Attempting to recover workout data...");
  };

  if (loadingExercises) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading exercises...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white pt-16 pb-16">
      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-3xl px-4 py-6">
          <div className="mb-6 relative">
            <WorkoutSessionHeader
              elapsedTime={elapsedTime}
              exerciseCount={exerciseCount}
              completedSets={completedSets}
              totalSets={totalSets}
              workoutStatus={workoutStatus}
              isRecoveryMode={!!workoutId}
              saveProgress={0}
              onRetrySave={() => workoutId ? attemptRecovery() : null}
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
                  onClose={() => {
                    setShowRestTimerModal(false);
                    setRestTimerActive(false);
                  }}
                  onComplete={handleRestTimerComplete}
                  maxTime={currentRestTime || 60}
                />
              </div>
            )}
          </div>

          <ExerciseList
            exercises={exercises}
            activeExercise={activeExercise}
            onAddSet={(exerciseName) => {
              const newStoreExercises = {...storeExercises};
              newStoreExercises[exerciseName] = [
                ...storeExercises[exerciseName],
                { weight: 0, reps: 0, restTime: 60, completed: false, isEditing: false }
              ];
              setStoreExercises(newStoreExercises);
            }}
            onCompleteSet={handleCompleteSet}
            onDeleteExercise={(exerciseName) => {
              // Ensure the deleteExercise function is properly called
              deleteExercise(exerciseName);
            }}
            onRemoveSet={(exerciseName, setIndex) => {
              const newStoreExercises = {...storeExercises};
              newStoreExercises[exerciseName] = storeExercises[exerciseName].filter((_, i) => i !== setIndex);
              setStoreExercises(newStoreExercises);
            }}
            onEditSet={(exerciseName, setIndex) => {
              const newStoreExercises = {...storeExercises};
              newStoreExercises[exerciseName] = storeExercises[exerciseName].map((set, i) => 
                i === setIndex ? { ...set, isEditing: true } : set
              );
              setStoreExercises(newStoreExercises);
            }}
            onSaveSet={(exerciseName, setIndex) => {
              const newStoreExercises = {...storeExercises};
              newStoreExercises[exerciseName] = storeExercises[exerciseName].map((set, i) => 
                i === setIndex ? { ...set, isEditing: false } : set
              );
              setStoreExercises(newStoreExercises);
            }}
            onWeightChange={(exerciseName, setIndex, value) => {
              const newStoreExercises = {...storeExercises};
              newStoreExercises[exerciseName] = storeExercises[exerciseName].map((set, i) => 
                i === setIndex ? { ...set, weight: parseFloat(value) || 0 } : set
              );
              setStoreExercises(newStoreExercises);
            }}
            onRepsChange={(exerciseName, setIndex, value) => {
              const newStoreExercises = {...storeExercises};
              newStoreExercises[exerciseName] = storeExercises[exerciseName].map((set, i) => 
                i === setIndex ? { ...set, reps: parseInt(value) || 0 } : set
              );
              setStoreExercises(newStoreExercises);
            }}
            onRestTimeChange={(exerciseName, setIndex, value) => {
              const newStoreExercises = {...storeExercises};
              newStoreExercises[exerciseName] = storeExercises[exerciseName].map((set, i) => 
                i === setIndex ? { ...set, restTime: parseInt(value) || 60 } : set
              );
              setStoreExercises(newStoreExercises);
            }}
            onWeightIncrement={(exerciseName, setIndex, increment) => {
              const newStoreExercises = {...storeExercises};
              const set = storeExercises[exerciseName][setIndex];
              newStoreExercises[exerciseName][setIndex] = { 
                ...set, 
                weight: Math.max(0, (set.weight || 0) + increment)
              };
              setStoreExercises(newStoreExercises);
            }}
            onRepsIncrement={(exerciseName, setIndex, increment) => {
              const newStoreExercises = {...storeExercises};
              const set = storeExercises[exerciseName][setIndex];
              newStoreExercises[exerciseName][setIndex] = { 
                ...set, 
                reps: Math.max(0, (set.reps || 0) + increment)
              };
              setStoreExercises(newStoreExercises);
            }}
            onRestTimeIncrement={(exerciseName, setIndex, increment) => {
              const newStoreExercises = {...storeExercises};
              const set = storeExercises[exerciseName][setIndex];
              newStoreExercises[exerciseName][setIndex] = { 
                ...set, 
                restTime: Math.max(0, (set.restTime || 60) + increment)
              };
              setStoreExercises(newStoreExercises);
            }}
            onShowRestTimer={handleShowRestTimer}
            onResetRestTimer={triggerRestTimerReset}
            onOpenAddExercise={() => setIsAddExerciseSheetOpen(true)}
            setExercises={(newExercises) => {
              // Convert adapted exercises back to store format before setting
              if (typeof newExercises === 'function') {
                setStoreExercises((prev) => {
                  const adaptedPrev = adaptExerciseSets(prev);
                  const result = newExercises(adaptedPrev);
                  return adaptToStoreFormat(result);
                });
              } else {
                setStoreExercises(adaptToStoreFormat(newExercises));
              }
            }}
          />
        </div>
      </main>

      {/* New unified footer component */}
      <WorkoutSessionFooter
        onAddExercise={() => setIsAddExerciseSheetOpen(true)}
        onFinishWorkout={handleFinishWorkout}
        hasExercises={hasExercises}
        isSaving={isSaving}
      />

      <AddExerciseSheet
        open={isAddExerciseSheetOpen}
        onOpenChange={setIsAddExerciseSheetOpen}
        onSelectExercise={handleAddExercise}
        trainingType={trainingConfig?.trainingType}
      />
          </div>
  );
};

export default TrainingSessionPage;
