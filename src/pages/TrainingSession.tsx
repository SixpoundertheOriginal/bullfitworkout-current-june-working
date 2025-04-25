import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useWorkoutState } from "@/hooks/useWorkoutState";
import { useExercises } from "@/hooks/useExercises";
import { Timer } from "@/components/Timer";
import { ExerciseCard } from "@/components/workouts/ExerciseCard";
import { SetInput } from "@/components/workouts/SetInput";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Loader2, SkipForward, Check } from "lucide-react";
import { WeightUnitToggle } from "@/components/WeightUnitToggle";
import { VolumeByExerciseChart } from "@/components/workouts/VolumeByExerciseChart";
import { convertWeight, formatWeightWithUnit } from "@/utils/unitConversion";
import { useWeightUnit } from "@/context/WeightUnitContext";
import { useStopwatch } from "@/hooks/useStopwatch";
import { useSound } from "@/hooks/useSound";
import { cn } from "@/lib/utils";

const ANIMATION_DURATION = 250;

interface TrainingSessionPageProps {}

const TrainingSessionPage: React.FC<TrainingSessionPageProps> = () => {
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
    workoutStatus,
    handleCompleteSet
  } = workoutState;
  const { weightUnit } = useWeightUnit();
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [isWorkoutComplete, setIsWorkoutComplete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exerciseOrder, setExerciseOrder] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionDirection, setTransitionDirection] = useState<'forward' | 'backward' | null>(null);
  const [isResting, setIsResting] = useState(false);
  const [showChart, setShowChart] = useState(false);
  const [completedSets, setCompletedSets] = useState(0);
  const [totalSets, setTotalSets] = useState(0);
  const [totalVolume, setTotalVolume] = useState(0);
  const [workoutDuration, setWorkoutDuration] = useState(0);
  const [workoutStartTime, setWorkoutStartTime] = useState(new Date());
  const [workoutEndTime, setWorkoutEndTime] = useState<Date | null>(null);
  const [isFirstSet, setIsFirstSet] = useState(true);
  const [isLastSet, setIsLastSet] = useState(false);
  const [isFirstExercise, setIsFirstExercise] = useState(true);
  const [isLastExercise, setIsLastExercise] = useState(false);
  const [isExerciseComplete, setIsExerciseComplete] = useState(false);
  const [isWorkoutStarted, setIsWorkoutStarted] = useState(false);
  const [isWorkoutPaused, setIsWorkoutPaused] = useState(false);
  const [isWorkoutFinished, setIsWorkoutFinished] = useState(false);
  const [isWorkoutCancelled, setIsWorkoutCancelled] = useState(false);
  const [isWorkoutResumed, setIsWorkoutResumed] = useState(false);
  const [isWorkoutSaved, setIsWorkoutSaved] = useState(false);

  const { start, pause, reset, isRunning } = useStopwatch();
  const { play: playBell } = useSound('/sounds/bell.mp3');
  const { play: playTick } = useSound('/sounds/tick.mp3');

  const timerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (allExercises && !activeExercise) {
      const exerciseNames = Object.keys(exercises);
      if (exerciseNames.length > 0) {
        setActiveExercise(exerciseNames[0]);
        setExerciseOrder(exerciseNames);
      }
    }
  }, [allExercises, exercises, activeExercise, setActiveExercise]);

  useEffect(() => {
    if (activeExercise) {
      const sets = exercises[activeExercise] || [];
      setIsFirstSet(currentSetIndex === 0);
      setIsLastSet(currentSetIndex === sets.length - 1);
      setIsExerciseComplete(sets.every(set => set.completed));
    }
  }, [activeExercise, currentSetIndex, exercises]);

  useEffect(() => {
    if (exerciseOrder.length > 0) {
      setIsFirstExercise(activeExercise === exerciseOrder[0]);
      setIsLastExercise(activeExercise === exerciseOrder[exerciseOrder.length - 1]);
    }
  }, [activeExercise, exerciseOrder]);

  useEffect(() => {
    if (isResting && !restTimerActive) {
      setIsResting(false);
    }
  }, [isResting, restTimerActive]);

  useEffect(() => {
    if (isRunning) {
      setElapsedTime(prevTime => prevTime + 1);
    }
  }, [isRunning, setElapsedTime]);

  useEffect(() => {
    let completed = 0;
    let total = 0;
    let volume = 0;

    Object.keys(exercises).forEach(exercise => {
      const sets = exercises[exercise];
      total += sets.length;
      completed += sets.filter(set => set.completed).length;
      sets.forEach(set => {
        if (set.completed) {
          const convertedWeight = convertWeight(set.weight, "lb", weightUnit);
          volume += convertedWeight * set.reps;
        }
      });
    });

    setCompletedSets(completed);
    setTotalSets(total);
    setTotalVolume(volume);
  }, [exercises, weightUnit]);

  useEffect(() => {
    if (workoutStatus === 'idle' && !isWorkoutStarted) {
      setWorkoutStartTime(new Date());
      setIsWorkoutStarted(true);
      start();
    }
  }, [workoutStatus, isWorkoutStarted, start]);

  const handleCompleteWorkout = () => {
    pause();
    setWorkoutEndTime(new Date());
    setIsWorkoutComplete(true);

    const workoutData = {
      exercises: exercises,
      duration: elapsedTime,
      startTime: workoutStartTime,
      endTime: new Date(),
      trainingType: "Strength", // Replace with actual training type
      name: "Workout"
    };

    navigate('/workout-complete', { state: { workoutData } });
  };

  const handleSetComplete = (exercise: string, index: number) => {
    handleCompleteSet(exercise, index);
  };

  const handleNextSet = () => {
    if (isLastSet) {
      handleNextExercise();
    } else {
      setCurrentSetIndex(prevIndex => prevIndex + 1);
    }
  };

  const handlePreviousSet = () => {
    if (isFirstSet) {
      handlePreviousExercise();
    } else {
      setCurrentSetIndex(prevIndex => prevIndex - 1);
    }
  };

  const handleNextExercise = () => {
    setIsTransitioning(true);
    setTransitionDirection('forward');

    setTimeout(() => {
      const currentIndex = exerciseOrder.indexOf(activeExercise || '');
      const nextIndex = (currentIndex + 1) % exerciseOrder.length;
      setActiveExercise(exerciseOrder[nextIndex]);
      setCurrentSetIndex(0);
      setIsTransitioning(false);
      setTransitionDirection(null);
    }, ANIMATION_DURATION);
  };

  const handlePreviousExercise = () => {
    setIsTransitioning(true);
    setTransitionDirection('backward');

    setTimeout(() => {
      const currentIndex = exerciseOrder.indexOf(activeExercise || '');
      const previousIndex = (currentIndex - 1 + exerciseOrder.length) % exerciseOrder.length;
      setActiveExercise(exerciseOrder[previousIndex]);
      setCurrentSetIndex(0);
      setIsTransitioning(false);
      setTransitionDirection(null);
    }, ANIMATION_DURATION);
  };

  const handleStartRest = () => {
    setIsResting(true);
    setRestTimerActive(true);
    playBell();
  };

  const handleSkipRest = () => {
    setRestTimerActive(false);
    setIsResting(false);
  };

  const handlePauseWorkout = () => {
    pause();
    setIsWorkoutPaused(true);
  };

  const handleResumeWorkout = () => {
    start();
    setIsWorkoutPaused(false);
  };

  const handleCancelWorkout = () => {
    pause();
    setIsWorkoutCancelled(true);
  };

  const handleConfirmCancel = () => {
    resetSession();
    navigate('/');
  };

  const handleToggleChart = () => {
    setShowChart(!showChart);
  };

  if (loadingExercises || !activeExercise) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading exercises...
      </div>
    );
  }

  const currentExercise = allExercises.find(ex => ex.name === activeExercise);
  const sets = exercises[activeExercise] || [];
  const currentSet = sets[currentSetIndex];

  if (!currentExercise || !currentSet) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p>Error: Could not find exercise or set data.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="flex justify-between items-center p-4 border-b border-gray-800">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-full hover:bg-gray-900"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="title-large">Training Session</h1>
        <WeightUnitToggle variant="badge" />
      </header>

      <main className="flex-1 overflow-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="title-medium">{currentExercise.name}</h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreviousExercise}
                disabled={isFirstExercise || isTransitioning}
                className={cn(
                  "btn btn-icon btn-outline border-gray-700 text-white",
                  (isFirstExercise || isTransitioning) && "opacity-50 cursor-not-allowed"
                )}
              >
                <ArrowLeft size={20} />
              </button>
              <button
                onClick={handleNextExercise}
                disabled={isLastExercise || isTransitioning}
                className={cn(
                  "btn btn-icon btn-outline border-gray-700 text-white",
                  (isLastExercise || isTransitioning) && "opacity-50 cursor-not-allowed"
                )}
              >
                <SkipForward size={20} />
              </button>
            </div>
          </div>
          <ExerciseCard exercise={currentExercise} />
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="title-small">Set {currentSetIndex + 1} / {sets.length}</h3>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreviousSet}
                disabled={isFirstSet || isTransitioning}
                className={cn(
                  "btn btn-icon btn-outline border-gray-700 text-white",
                  (isFirstSet || isTransitioning) && "opacity-50 cursor-not-allowed"
                )}
              >
                <ArrowLeft size={20} />
              </button>
              <button
                onClick={handleNextSet}
                disabled={isLastSet || isTransitioning}
                className={cn(
                  "btn btn-icon btn-outline border-gray-700 text-white",
                  (isLastSet || isTransitioning) && "opacity-50 cursor-not-allowed"
                )}
              >
                <SkipForward size={20} />
              </button>
            </div>
          </div>
          <SetInput
            set={currentSet}
            exerciseName={currentExercise.name}
            index={currentSetIndex}
            onComplete={() => handleSetComplete(currentExercise.name, currentSetIndex)}
          />
        </div>

        <div className="mb-6">
          {isResting ? (
            <div className="flex flex-col items-center">
              <h4 className="title-small mb-2">Resting</h4>
              <div ref={timerRef}>
                <Timer
                  duration={currentRestTime}
                  key={restTimerResetSignal}
                  onComplete={handleSkipRest}
                  isRunning={restTimerActive}
                  onTick={playTick}
                />
              </div>
              <Button
                onClick={handleSkipRest}
                variant="secondary"
                className="mt-4"
              >
                Skip Rest
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleStartRest}
              variant="secondary"
              disabled={currentSet.completed}
              className={cn(
                "w-full",
                currentSet.completed ? "opacity-50 cursor-not-allowed" : ""
              )}
            >
              Start Rest
            </Button>
          )}
        </div>

        <div className="mb-6">
          <h4 className="title-small mb-2">Workout Progress</h4>
          <div className="flex justify-between items-center">
            <p>Time: {elapsedTime} seconds</p>
            <p>Sets: {completedSets} / {totalSets}</p>
            <p>Volume: {formatWeightWithUnit(totalVolume, weightUnit)}</p>
          </div>
        </div>

        <div className="mb-6">
          <Button onClick={handleToggleChart} variant="secondary">
            {showChart ? "Hide Chart" : "Show Chart"}
          </Button>
          {showChart && (
            <VolumeByExerciseChart
              workoutData={{ exercises: exercises }}
              weightUnit={weightUnit}
            />
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            className="btn btn-outline border-gray-700 text-white"
            onClick={handleCancelWorkout}
          >
            Cancel Workout
          </button>
          <button
            className="bg-green-600 hover:bg-green-700 font-medium rounded-md px-4 py-3 transition disabled:opacity-70"
            onClick={handleCompleteWorkout}
            disabled={!isExerciseComplete}
          >
            {isExerciseComplete ? "Complete Workout" : "Finish Exercise"}
          </button>
        </div>
      </main>
    </div>
  );
};

export default TrainingSessionPage;
