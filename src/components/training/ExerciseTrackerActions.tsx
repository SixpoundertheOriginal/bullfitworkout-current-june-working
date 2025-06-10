
import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ExerciseTrackerActionsProps {
  onAddSet: () => void;
}

export const ExerciseTrackerActions: React.FC<ExerciseTrackerActionsProps> = React.memo(({
  onAddSet
}) => {
  return (
    <div className="px-4 pb-4">
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
  );
});

ExerciseTrackerActions.displayName = 'ExerciseTrackerActions';
