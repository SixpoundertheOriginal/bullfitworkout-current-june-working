
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Exercise {
  id: string;
  name: string;
  lastWorkout?: {
    weight: number;
    reps: number;
    daysAgo: number;
  };
}

interface ExerciseTrackerHeaderProps {
  exercise: Exercise;
  isCollapsed: boolean;
  showDeleteConfirm: boolean;
  completedSets: number;
  totalSets: number;
  totalVolume: number;
  onToggleCollapsed: () => void;
  onDeleteExercise: () => void;
  onToggleDeleteConfirm: () => void;
}

export const ExerciseTrackerHeader: React.FC<ExerciseTrackerHeaderProps> = React.memo(({
  exercise,
  isCollapsed,
  showDeleteConfirm,
  completedSets,
  totalSets,
  totalVolume,
  onToggleCollapsed,
  onDeleteExercise,
  onToggleDeleteConfirm
}) => {
  return (
    <motion.div
      className="p-4 cursor-pointer select-none relative"
      onClick={onToggleCollapsed}
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
                  onToggleDeleteConfirm();
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
                  onClick={onDeleteExercise}
                  className="h-7 px-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded"
                >
                  Delete
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleDeleteConfirm}
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
    </motion.div>
  );
});

ExerciseTrackerHeader.displayName = 'ExerciseTrackerHeader';
