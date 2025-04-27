import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";
import { useWorkoutState } from "@/hooks/useWorkoutState";
import { useExercises } from "@/hooks/useExercises";
import { WorkoutSessionHeader } from "@/components/training/WorkoutSessionHeader";
import { ExerciseList } from "@/components/training/ExerciseList";
import { AddExerciseSheet } from "@/components/training/AddExerciseSheet";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { WeightUnitToggle } from "@/components/WeightUnitToggle";
import { Exercise } from "@/types/exercise";
import { useSound } from "@/hooks/useSound";
import { RestTimer } from "@/components/RestTimer";

const TrainingSessionPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { exercises: allExercises, isLoading: loadingExercises } = useExercises();
  const workoutState = useWorkoutState();
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
    setCurrentRestTime,
    handleCompleteSet,
    workoutStatus,
    saveProgress,
    attemptRecovery,
    markAsSaving,
    markAsSaved,
    markAsFailed,
    workoutId,
    deleteExercise
  } = workoutState;

  const { play: playBell } = useSound('/sounds/bell.mp3');
  const { play: playTick } = useSound('/sounds/tick.mp3');
  const [isAddExerciseSheetOpen, setIsAddExerciseSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showRestTimerModal, setShowRestTimerModal] = useState(false);

  const exerciseCount = Object.keys(exercises).length;
  const [completedSets, totalSets] = Object.values(exercises).reduce(
    ([completed, total], sets) => [
      completed + sets.filter(set => set.completed).length,
      total + sets.length
    ],
    [0, 0]
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [setElapsedTime]);

  const handleAddExercise = (exercise: Exercise | string) => {
    const exerciseName = typeof exercise === 'string' ? exercise : exercise.name;
    
    if (exercises[exerciseName]) {
      toast(`${exerciseName} is already in your workout`);
      return;
    }

    setExercises(prev => ({
      ...prev,
      [exerciseName]: [
        { weight: 0, reps: 0, restTime: 60, completed: false, isEditing: false }
      ]
    }));
    
    setActiveExercise(exerciseName);
    toast(`Added ${exerciseName} to workout`);
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
    if (Object.keys(exercises).length === 0) {
      toast.error("No exercises added - Please add at least one exercise before finishing your workout");
      return;
    }

    try {
      setIsSaving(true);
      markAsSaving();
      
      const now = new Date();
      const startTime = new Date(now.getTime() - elapsedTime * 1000);

      navigate("/workout-complete", {
        state: {
          workoutData: {
            exercises,
            duration: elapsedTime,
            startTime: startTime,
            endTime: now,
            trainingType: workoutState.trainingConfig?.trainingType || "Strength",
            name: workoutState.trainingConfig?.trainingType || "Workout",
            trainingConfig: workoutState.trainingConfig || null,
            notes: "" // Add empty notes field to ensure it's included
          }
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

  if (loadingExercises) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading exercises...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="flex justify-between items-center p-4 border-b border-gray-800 sticky top-0 z-30 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-full hover:bg-gray-900"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold">Training Session</h1>
        <WeightUnitToggle variant="badge" />
      </header>

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
              saveProgress={saveProgress}
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
              setExercises(prev => ({
                ...prev,
                [exerciseName]: [
                  ...prev[exerciseName],
                  { weight: 0, reps: 0, restTime: 60, completed: false, isEditing: false }
                ]
              }));
            }}
            onCompleteSet={handleCompleteSet}
            onDeleteExercise={deleteExercise}
            onRemoveSet={(exerciseName, setIndex) => {
              setExercises(prev => ({
                ...prev,
                [exerciseName]: prev[exerciseName].filter((_, i) => i !== setIndex)
              }));
            }}
            onEditSet={(exerciseName, setIndex) => {
              setExercises(prev => {
                const newExercises = { ...prev };
                newExercises[exerciseName] = prev[exerciseName].map((set, i) => 
                  i === setIndex ? { ...set, isEditing: true } : set
                );
                return newExercises;
              });
            }}
            onSaveSet={(exerciseName, setIndex) => {
              setExercises(prev => {
                const newExercises = { ...prev };
                newExercises[exerciseName] = prev[exerciseName].map((set, i) => 
                  i === setIndex ? { ...set, isEditing: false } : set
                );
                return newExercises;
              });
            }}
            onWeightChange={(exerciseName, setIndex, value) => {
              setExercises(prev => {
                const newExercises = { ...prev };
                newExercises[exerciseName] = prev[exerciseName].map((set, i) => 
                  i === setIndex ? { ...set, weight: parseFloat(value) || 0 } : set
                );
                return newExercises;
              });
            }}
            onRepsChange={(exerciseName, setIndex, value) => {
              setExercises(prev => {
                const newExercises = { ...prev };
                newExercises[exerciseName] = prev[exerciseName].map((set, i) => 
                  i === setIndex ? { ...set, reps: parseInt(value) || 0 } : set
                );
                return newExercises;
              });
            }}
            onRestTimeChange={(exerciseName, setIndex, value) => {
              setExercises(prev => {
                const newExercises = { ...prev };
                newExercises[exerciseName] = prev[exerciseName].map((set, i) => 
                  i === setIndex ? { ...set, restTime: parseInt(value) || 60 } : set
                );
                return newExercises;
              });
            }}
            onWeightIncrement={(exerciseName, setIndex, increment) => {
              setExercises(prev => {
                const newExercises = { ...prev };
                const set = prev[exerciseName][setIndex];
                newExercises[exerciseName][setIndex] = { 
                  ...set, 
                  weight: Math.max(0, (set.weight || 0) + increment)
                };
                return newExercises;
              });
            }}
            onRepsIncrement={(exerciseName, setIndex, increment) => {
              setExercises(prev => {
                const newExercises = { ...prev };
                const set = prev[exerciseName][setIndex];
                newExercises[exerciseName][setIndex] = { 
                  ...set, 
                  reps: Math.max(0, (set.reps || 0) + increment)
                };
                return newExercises;
              });
            }}
            onRestTimeIncrement={(exerciseName, setIndex, increment) => {
              setExercises(prev => {
                const newExercises = { ...prev };
                const set = prev[exerciseName][setIndex];
                newExercises[exerciseName][setIndex] = { 
                  ...set, 
                  restTime: Math.max(0, (set.restTime || 60) + increment)
                };
                return newExercises;
              });
            }}
            onShowRestTimer={handleShowRestTimer}
            onResetRestTimer={triggerRestTimerReset}
            onOpenAddExercise={() => setIsAddExerciseSheetOpen(true)}
            setExercises={setExercises}
          />

          <div className="fixed bottom-6 right-6 z-40">
            <button
              onClick={handleFinishWorkout}
              disabled={isSaving || workoutStatus === 'saving'}
              className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white font-semibold rounded-full px-6 py-3 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Finish Workout"}
            </button>
          </div>
        </div>
      </main>

      <AddExerciseSheet
        open={isAddExerciseSheetOpen}
        onOpenChange={setIsAddExerciseSheetOpen}
        onSelectExercise={handleAddExercise}
      />
    </div>
  );
};

export default TrainingSessionPage;
