
import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface TrainingDialogActionsProps {
  onStart: () => void;
  disabled?: boolean;
}

export const TrainingDialogActions: React.FC<TrainingDialogActionsProps> = React.memo(({
  onStart,
  disabled = false
}) => {
  return (
    <motion.div
      className="flex justify-end"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Button 
        onClick={onStart}
        disabled={disabled}
        className="bg-purple-600 hover:bg-purple-700"
      >
        Start Training
      </Button>
    </motion.div>
  );
});

TrainingDialogActions.displayName = 'TrainingDialogActions';
