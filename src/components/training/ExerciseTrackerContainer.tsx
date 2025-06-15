
import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useExerciseTrackerState } from '@/hooks/useExerciseTrackerState';
import { useExerciseSetOperations } from '@/hooks/useExerciseSetOperations';
import { useExerciseValidation } from '@/hooks/useExerciseValidation';
import { ExerciseTrackerHeader } from './ExerciseTrackerHeader';
import { ExerciseTrackerProgress } from './ExerciseTrackerProgress';
import { ExerciseTrackerSetsList } from './ExerciseTrackerSetsList';
import { ExerciseTrackerActions } from './ExerciseTrackerActions';
import { ExerciseSet } from '@/types/exercise';

interface Exercise {
  id: string;
  name: string;
  lastWorkout?: {
    weight: number;
    reps: number;
    daysAgo: number;
  };
  sets: ExerciseSet[];
}

interface ExerciseTrackerContainerProps {
  exercise: Exercise;
  onUpdateSet: (setId: string, updates: Partial<ExerciseSet>) => void;
  onToggleCompletion: (setId: string) => void;
  onAddSet: () => void;
  onDeleteSet: (setId: string) => void;
  onDeleteExercise?: (exerciseName: string) => void;
  isActive?: boolean;
}

export const ExerciseTrackerContainer: React.FC<ExerciseTrackerContainerProps> = React.memo(({
  exercise,
  onUpdateSet,
  onToggleCompletion,
  onAddSet,
  onDeleteSet,
  onDeleteExercise,
  isActive = false
}) => {
  const { state, actions } = useExerciseTrackerState();
  const { metrics } = useExerciseValidation(exercise);
  
  // Convert set ID to index for operations
  const handleSetUpdate = useCallback((setIndex: number, updates: Partial<ExerciseSet>) => {
    const set = exercise.sets[setIndex];
    if (set) {
      onUpdateSet(set.id, updates);
    }
  }, [exercise.sets, onUpdateSet]);

  const handleSetCompletion = useCallback((setIndex: number) => {
    const set = exercise.sets[setIndex];
    if (set) {
      onToggleCompletion(set.id);
    }
  }, [exercise.sets, onToggleCompletion]);

  const handleSetDelete = useCallback((setIndex: number) => {
    const set = exercise.sets[setIndex];
    if (set) {
      onDeleteSet(set.id);
    }
  }, [exercise.sets, onDeleteSet]);

  const setOperations = useExerciseSetOperations({
    exerciseName: exercise.name,
    sets: exercise.sets,
    onUpdateSet: handleSetUpdate,
    onToggleCompletion: handleSetCompletion,
    onDeleteSet: handleSetDelete
  });

  const handleStopEditing = useCallback((save: boolean = true) => {
    const result = actions.stopEditing(save);
    if (result && save) {
      setOperations.handleSetUpdate(result.setIndex, result.field, result.value);
    }
  }, [actions, setOperations]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStopEditing(true);
    } else if (e.key === 'Escape') {
      handleStopEditing(false);
    }
  }, [handleStopEditing]);

  const handleSetDoubleClick = useCallback((setIndex: number, e: React.MouseEvent) => {
    setOperations.handleSetCompletion(setIndex, e);
  }, [setOperations]);

  const handleDeleteExercise = useCallback(() => {
    if (onDeleteExercise) {
      onDeleteExercise(exercise.name);
    }
  }, [onDeleteExercise, exercise.name]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        relative overflow-hidden rounded-xl backdrop-blur-md group
        bg-gradient-to-br from-slate-900/80 via-purple-900/20 to-slate-900/80
        border border-slate-700/50 shadow-2xl
        ${isActive ? 'border-purple-500/50 shadow-purple-500/20' : ''}
      `}
    >
      <ExerciseTrackerHeader
        exercise={exercise}
        isCollapsed={state.isCollapsed}
        showDeleteConfirm={state.showDeleteConfirm}
        completedSets={metrics.completedSets}
        totalSets={metrics.totalSets}
        totalVolume={metrics.totalVolume}
        onToggleCollapsed={actions.toggleCollapsed}
        onDeleteExercise={handleDeleteExercise}
        onToggleDeleteConfirm={actions.toggleDeleteConfirm}
      />

      <ExerciseTrackerProgress progressPercentage={metrics.progressPercentage} />

      <AnimatePresence>
        {!state.isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <ExerciseTrackerSetsList
              sets={exercise.sets}
              editingField={state.editingField}
              editValue={state.editValue}
              onSetDoubleClick={handleSetDoubleClick}
              onStartEditing={actions.startEditing}
              onStopEditing={handleStopEditing}
              onEditValueChange={actions.setEditValue}
              onKeyPress={handleKeyPress}
              onDeleteSet={setOperations.handleSetDelete}
            />

            <ExerciseTrackerActions onAddSet={onAddSet} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

ExerciseTrackerContainer.displayName = 'ExerciseTrackerContainer';
