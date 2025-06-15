import React from 'react';
import { motion } from "framer-motion";
import { WorkoutMetrics } from "@/components/WorkoutMetrics";
import { WorkoutProgressTracker } from "@/components/training/WorkoutProgressTracker";
import { ExerciseList } from "@/components/training/ExerciseList";

interface ActiveWorkoutSectionProps {
  // Metrics
  exerciseCount: number;
  completedSets: number;
  totalSets: number;
  totalVolume: number;
  totalReps: number;
  
  // Progress
  currentExerciseIndex: number;
  exerciseNames: string[];
  activeExercise: string | null;
  
  // Exercise data
  convertedExercises: Record<string, any[]>;
  
  // Handlers
  onAddSet: (exerciseName: string) => void;
  onCompleteSet: (exerciseName: string, setIndex: number) => void;
  onDeleteExercise: (exerciseName: string) => void;
  onRemoveSet: (exerciseName: string, setIndex: number) => void;
  onEditSet: (exerciseName: string) => void;
  onSaveSet: (exerciseName: string) => void;
  onWeightChange: (exerciseName: string, setIndex: number, value: string) => void;
  onRepsChange: (exerciseName: string, setIndex: number, value: string) => void;
  onRestTimeChange: (exerciseName: string, setIndex: number, value: string) => void;
  onWeightIncrement: (exerciseName: string, setIndex: number, increment: number) => void;
  onRepsIncrement: (exerciseName: string, setIndex: number, increment: number) => void;
  onRestTimeIncrement: (exerciseName: string, setIndex: number, increment: number) => void;
  onOpenAddExercise: () => void;
  setExercises: (exercises: any) => void;
  showFeedback: (message: string, type: string) => void;
}

export const ActiveWorkoutSection: React.FC<ActiveWorkoutSectionProps> = React.memo(({
  exerciseCount,
  completedSets,
  totalSets,
  totalVolume,
  totalReps,
  currentExerciseIndex,
  exerciseNames,
  activeExercise,
  convertedExercises,
  onAddSet,
  onCompleteSet,
  onDeleteExercise,
  onRemoveSet,
  onEditSet,
  onSaveSet,
  onWeightChange,
  onRepsChange,
  onRestTimeChange,
  onWeightIncrement,
  onRepsIncrement,
  onRestTimeIncrement,
  onOpenAddExercise,
  setExercises,
  showFeedback
}) => {
  const hasExercises = exerciseCount > 0;

  return (
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
          exercises={convertedExercises}
          onCompleteSet={onCompleteSet}
          onDeleteExercise={onDeleteExercise}
          onAddExercise={onOpenAddExercise}
        />
      </motion.div>
    </motion.div>
  );
});

ActiveWorkoutSection.displayName = 'ActiveWorkoutSection';
