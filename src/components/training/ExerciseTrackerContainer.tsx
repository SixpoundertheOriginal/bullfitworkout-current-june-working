
import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useExerciseTrackerState } from '@/hooks/useExerciseTrackerState';
import { useExerciseTrackerActions } from '@/hooks/useExerciseTrackerActions';
import { useExerciseValidation } from '@/hooks/useExerciseValidation';
import { ExerciseTrackerHeader } from './ExerciseTrackerHeader';
import { ExerciseTrackerProgress } from './ExerciseTrackerProgress';
import { ExerciseTrackerSetsList } from './ExerciseTrackerSetsList';
import { ExerciseTrackerActions } from './ExerciseTrackerActions';

interface ExerciseSet {
  id: number;
  weight: number;
  reps: number;
  duration: string;
  completed: boolean;
  volume: number;
}

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
  onUpdateSet: (setId: number, updates: Partial<ExerciseSet>) => void;
  onToggleCompletion: (setId: number) => void;
  onAddSet: () => void;
  onDeleteSet: (setId: number) => void;
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
  const trackerActions = useExerciseTrackerActions({
    onUpdateSet,
    onToggleCompletion,
    onAddSet,
    onDeleteSet,
    onDeleteExercise,
    exerciseName: exercise.name,
    sets: exercise.sets
  });

  const handleStopEditing = useCallback((save: boolean = true) => {
    const result = actions.stopEditing(save);
    if (result && save) {
      trackerActions.handleSetUpdate(result.setId, result.field, result.value);
    }
  }, [actions, trackerActions]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStopEditing(true);
    } else if (e.key === 'Escape') {
      handleStopEditing(false);
    }
  }, [handleStopEditing]);

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
        onDeleteExercise={trackerActions.handleDeleteExercise}
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
              onSetDoubleClick={trackerActions.handleSetDoubleClick}
              onStartEditing={actions.startEditing}
              onStopEditing={handleStopEditing}
              onEditValueChange={actions.setEditValue}
              onKeyPress={handleKeyPress}
              onDeleteSet={trackerActions.handleDeleteSet}
            />

            <ExerciseTrackerActions onAddSet={trackerActions.handleAddSet} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

ExerciseTrackerContainer.displayName = 'ExerciseTrackerContainer';
