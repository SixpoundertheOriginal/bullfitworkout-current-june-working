
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface WorkoutProgressTrackerProps {
  currentExerciseIndex: number;
  totalExercises: number;
  completedSets: number;
  totalSets: number;
  exercises: string[];
  activeExercise: string | null;
}

export const WorkoutProgressTracker: React.FC<WorkoutProgressTrackerProps> = ({
  currentExerciseIndex,
  totalExercises,
  completedSets,
  totalSets,
  exercises,
  activeExercise
}) => {
  const overallProgress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;
  
  return (
    <Card className="bg-gray-900/60 border-white/10 p-4 mb-4">
      <div className="space-y-3">
        {/* Overall Progress Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-400" />
            <span className="text-white font-medium text-sm">Workout Progress</span>
          </div>
          <span className="text-white/70 text-xs">
            {Math.round(overallProgress)}% complete
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-800 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {/* Exercise Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto py-2">
          {exercises.map((exercise, index) => {
            const isActive = exercise === activeExercise;
            const isCompleted = index < currentExerciseIndex;
            
            return (
              <motion.div
                key={exercise}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-full text-xs whitespace-nowrap
                  ${isActive 
                    ? 'bg-purple-600/20 border border-purple-500/30 text-purple-300' 
                    : isCompleted 
                      ? 'bg-green-600/20 border border-green-500/30 text-green-300'
                      : 'bg-gray-800/50 border border-gray-600/30 text-gray-400'
                  }
                `}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                {isCompleted ? (
                  <CheckCircle className="h-3 w-3" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
                <span className="truncate max-w-20">{exercise}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Sets Progress */}
        <div className="text-center">
          <span className="text-white/60 text-xs">
            {completedSets} of {totalSets} sets completed
          </span>
        </div>
      </div>
    </Card>
  );
};
