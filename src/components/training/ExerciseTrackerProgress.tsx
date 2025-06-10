
import React from 'react';
import { motion } from 'framer-motion';

interface ExerciseTrackerProgressProps {
  progressPercentage: number;
}

export const ExerciseTrackerProgress: React.FC<ExerciseTrackerProgressProps> = React.memo(({
  progressPercentage
}) => {
  return (
    <div className="mt-3 w-full bg-slate-800/50 rounded-full h-2 overflow-hidden">
      <motion.div
        className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progressPercentage}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  );
});

ExerciseTrackerProgress.displayName = 'ExerciseTrackerProgress';
