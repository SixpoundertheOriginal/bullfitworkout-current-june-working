import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExerciseSet } from "@/types/exercise";
import { EnhancedExerciseTracker } from './EnhancedExerciseTracker';
import { useEnhancedExerciseTracker } from '@/hooks/useEnhancedExerciseTracker';

interface ExerciseListProps {
  exercises: Record<string, ExerciseSet[]>;
  onCompleteSet: (exerciseName: string, setIndex: number) => void;
  onDeleteExercise: (exerciseName: string) => void;
}

// Individual exercise tracker component with timer integration
const ExerciseTrackerWrapper: React.FC<{ 
  exerciseName: string; 
  onDeleteExercise: (name: string) => void;
  onCompleteSet: (exerciseName: string, setIndex: number) => void;
}> = ({ 
  exerciseName, 
  onDeleteExercise,
  onCompleteSet
}) => {
  const {
    exercise,
    isActive,
    onUpdateSet,
    onToggleCompletion,
    onAddSet,
    onDeleteSet,
    onSetActive
  } = useEnhancedExerciseTracker(exerciseName);

  // Enhanced completion handler that triggers rest timer
  // This now correctly receives a string `setId` and finds the `setIndex` for the store.
  const handleToggleCompletion = (setId: string) => {
    const setIndex = exercise.sets.findIndex(s => s.id === setId);
    if (setIndex === -1) return;

    const wasCompleted = exercise.sets[setIndex]?.completed;
    onToggleCompletion(setId);
    
    // Auto-start rest timer when set is completed (not uncompleted)
    if (!wasCompleted) {
      console.log(`Set ${setIndex + 1} completed for ${exerciseName}, starting rest timer`);
      onCompleteSet(exerciseName, setIndex);
    }
  };

  return (
    <div onClick={onSetActive}>
      <EnhancedExerciseTracker
        exercise={exercise}
        isActive={isActive}
        onUpdateSet={onUpdateSet}
        onToggleCompletion={handleToggleCompletion}
        onAddSet={onAddSet}
        onDeleteSet={onDeleteSet}
        onDeleteExercise={onDeleteExercise}
      />
    </div>
  );
};

export const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  onDeleteExercise,
  onCompleteSet,
}) => {
  const exerciseList = Object.keys(exercises);
  
  if (exerciseList.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center py-16 px-6"
      >
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-slate-800/50 to-purple-900/50 flex items-center justify-center mb-6 backdrop-blur-sm border border-slate-700/50">
            <svg 
              className="w-8 h-8 text-slate-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M12 6v6m0 0v6m0-6h6m-6 0H6" 
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Ready to start training?
          </h3>
          <p className="text-slate-400 text-sm leading-relaxed">
            Add your first exercise to begin your workout session
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Enhanced Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Active Exercises
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Double-click sets to complete • Click values to edit • Hover to delete exercise
          </p>
        </div>
      </div>

      {/* Enhanced Exercise Cards */}
      <div className="space-y-4 mt-6">
        <AnimatePresence mode="popLayout">
          {exerciseList.map((exerciseName, index) => (
            <motion.div
              key={exerciseName}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ 
                duration: 0.4,
                delay: index * 0.1,
                ease: [0.25, 0.46, 0.45, 0.94],
                layout: { duration: 0.3 }
              }}
              className="transform-gpu will-change-transform"
            >
              <ExerciseTrackerWrapper
                exerciseName={exerciseName}
                onDeleteExercise={onDeleteExercise}
                onCompleteSet={onCompleteSet}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
