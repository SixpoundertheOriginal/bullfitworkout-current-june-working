

import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, Plus, Trash2, Clock, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// TypeScript Interfaces
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

interface EnhancedExerciseTrackerProps {
  exercise: Exercise;
  onUpdateSet: (setId: number, updates: Partial<ExerciseSet>) => void;
  onToggleCompletion: (setId: number) => void;
  onAddSet: () => void;
  onDeleteSet: (setId: number) => void;
  onDeleteExercise?: (exerciseName: string) => void;
  isActive?: boolean;
}

// Format duration helper
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Parse duration helper
const parseDuration = (duration: string): number => {
  const [mins, secs] = duration.split(':').map(Number);
  return (mins || 0) * 60 + (secs || 0);
};

export const EnhancedExerciseTracker: React.FC<EnhancedExerciseTrackerProps> = React.memo(({
  exercise,
  onUpdateSet,
  onToggleCompletion,
  onAddSet,
  onDeleteSet,
  onDeleteExercise,
  isActive = false
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [editingField, setEditingField] = useState<{ setId: number; field: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Calculate progress metrics
  const { completedSets, totalSets, progressPercentage, totalVolume } = useMemo(() => {
    const completed = exercise.sets.filter(set => set.completed).length;
    const total = exercise.sets.length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    const volume = exercise.sets
      .filter(set => set.completed)
      .reduce((sum, set) => sum + set.volume, 0);
    
    return {
      completedSets: completed,
      totalSets: total,
      progressPercentage: percentage,
      totalVolume: volume
    };
  }, [exercise.sets]);

  // Start editing a field
  const startEditing = useCallback((setId: number, field: string, currentValue: string | number) => {
    setEditingField({ setId, field });
    setEditValue(currentValue.toString());
  }, []);

  // Stop editing and save
  const stopEditing = useCallback((save: boolean = true) => {
    if (editingField && save) {
      const numValue = parseFloat(editValue);
      if (!isNaN(numValue) && numValue >= 0) {
        const updates: Partial<ExerciseSet> = {};
        if (editingField.field === 'weight') {
          updates.weight = numValue;
        } else if (editingField.field === 'reps') {
          updates.reps = Math.floor(numValue);
        }
        
        // Recalculate volume
        const set = exercise.sets.find(s => s.id === editingField.setId);
        if (set) {
          const newWeight = updates.weight ?? set.weight;
          const newReps = updates.reps ?? set.reps;
          updates.volume = newWeight * newReps;
        }
        
        onUpdateSet(editingField.setId, updates);
      }
    }
    setEditingField(null);
    setEditValue('');
  }, [editingField, editValue, exercise.sets, onUpdateSet]);

  // Handle key press in edit mode
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      stopEditing(true);
    } else if (e.key === 'Escape') {
      stopEditing(false);
    }
  }, [stopEditing]);

  // Toggle set completion
  const handleSetDoubleClick = useCallback((setId: number, e: React.MouseEvent) => {
    // Prevent double-click if clicking on input or button
    if ((e.target as HTMLElement).tagName === 'INPUT' || 
        (e.target as HTMLElement).tagName === 'BUTTON' ||
        (e.target as HTMLElement).closest('button')) {
      return;
    }
    onToggleCompletion(setId);
  }, [onToggleCompletion]);

  // Handle exercise deletion
  const handleDeleteExercise = useCallback(() => {
    if (onDeleteExercise) {
      onDeleteExercise(exercise.name);
    }
    setShowDeleteConfirm(false);
  }, [exercise.name, onDeleteExercise]);

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
      {/* Header Section */}
      <motion.div
        className="p-4 cursor-pointer select-none relative"
        onClick={() => setIsCollapsed(!isCollapsed)}
        whileHover={{ backgroundColor: 'rgba(100, 116, 139, 0.1)' }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {exercise.name}
            </h3>
            {exercise.lastWorkout && (
              <p className="text-sm text-slate-400 mt-1">
                Last: {exercise.lastWorkout.weight}kg × {exercise.lastWorkout.reps} 
                <span className="text-slate-500"> ({exercise.lastWorkout.daysAgo} days ago)</span>
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* Delete Exercise Button */}
            <div className="relative">
              {!showDeleteConfirm ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-all duration-200 h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              ) : (
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteExercise}
                    className="h-7 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                  >
                    Delete
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="h-7 w-7 p-0 text-slate-400 hover:text-white hover:bg-slate-700/50 rounded"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
            
            <div className="text-right">
              <div className="text-sm font-medium text-white">
                {completedSets}/{totalSets} sets
              </div>
              <div className="text-xs text-slate-400">
                {totalVolume}kg volume
              </div>
            </div>
            
            <motion.div
              animate={{ rotate: isCollapsed ? -90 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-slate-400"
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-3 w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      {/* Sets Grid */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              {/* Grid Header */}
              <div className="grid grid-cols-12 gap-2 text-xs font-medium text-slate-400 mb-3 px-2">
                <div className="col-span-1">Set</div>
                <div className="col-span-2">Weight</div>
                <div className="col-span-2">Reps</div>
                <div className="col-span-2">Time</div>
                <div className="col-span-3">Volume</div>
                <div className="col-span-2">Actions</div>
              </div>

              {/* Sets List */}
              <div className="space-y-2">
                {exercise.sets.map((set, index) => (
                  <motion.div
                    key={set.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`
                      grid grid-cols-12 gap-2 items-center p-3 rounded-lg transition-all duration-200
                      cursor-pointer group hover:bg-slate-800/30
                      ${set.completed 
                        ? 'bg-green-500/10 border border-green-500/30' 
                        : 'bg-slate-800/20 border border-slate-700/30'
                      }
                    `}
                    onDoubleClick={(e) => handleSetDoubleClick(set.id, e)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    {/* Set Number */}
                    <div className="col-span-1 flex items-center justify-center">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200
                        ${set.completed 
                          ? 'bg-green-500 text-white' 
                          : 'bg-slate-700 text-slate-300'
                        }
                      `}>
                        {set.completed ? <Check className="w-4 h-4" /> : index + 1}
                      </div>
                    </div>

                    {/* Weight */}
                    <div className="col-span-2">
                      {editingField?.setId === set.id && editingField.field === 'weight' ? (
                        <Input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => stopEditing(true)}
                          onKeyDown={handleKeyPress}
                          className="h-8 text-sm bg-slate-800 border-slate-600"
                          autoFocus
                        />
                      ) : (
                        <div
                          className="text-sm text-white hover:bg-slate-700/30 px-2 py-1 rounded cursor-text"
                          onClick={() => startEditing(set.id, 'weight', set.weight)}
                        >
                          {set.weight}kg
                        </div>
                      )}
                    </div>

                    {/* Reps */}
                    <div className="col-span-2">
                      {editingField?.setId === set.id && editingField.field === 'reps' ? (
                        <Input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onBlur={() => stopEditing(true)}
                          onKeyDown={handleKeyPress}
                          className="h-8 text-sm bg-slate-800 border-slate-600"
                          autoFocus
                        />
                      ) : (
                        <div
                          className="text-sm text-white hover:bg-slate-700/30 px-2 py-1 rounded cursor-text"
                          onClick={() => startEditing(set.id, 'reps', set.reps)}
                        >
                          {set.reps}
                        </div>
                      )}
                    </div>

                    {/* Time */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-1 text-sm text-slate-400">
                        <Clock className="w-3 h-3" />
                        {set.duration}
                      </div>
                    </div>

                    {/* Volume */}
                    <div className="col-span-3">
                      <div className="text-sm text-slate-300 font-medium">
                        {set.volume.toFixed(1)}kg
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="col-span-2 flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSet(set.id);
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Add Set Button */}
              <motion.div 
                className="mt-4"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={onAddSet}
                  variant="outline"
                  className="w-full border-dashed border-slate-600 text-slate-400 hover:text-white hover:border-purple-500 transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Set
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

EnhancedExerciseTracker.displayName = 'EnhancedExerciseTracker';

