
import React from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { useFeedback } from "@/components/training/InteractionFeedback";

export const WorkoutFeedbackSystem: React.FC = React.memo(() => {
  const { feedbackMessages } = useFeedback();

  return (
    <AnimatePresence>
      <div className="fixed top-20 right-4 z-50 space-y-3 max-w-sm">
        {feedbackMessages.map((feedback) => (
          <motion.div
            key={feedback.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              mass: 0.8
            }}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl backdrop-blur-md border
              ${feedback.type === 'success' 
                ? 'bg-emerald-600/90 border-emerald-500/30 text-emerald-50' 
                : feedback.type === 'warning'
                  ? 'bg-amber-600/90 border-amber-500/30 text-amber-50'
                  : 'bg-blue-600/90 border-blue-500/30 text-blue-50'
              }
              transform-gpu will-change-transform
            `}
          >
            <div className="flex-shrink-0">
              {feedback.icon}
            </div>
            <span className="text-sm font-medium leading-5">{feedback.message}</span>
          </motion.div>
        ))}
      </div>
    </AnimatePresence>
  );
});

WorkoutFeedbackSystem.displayName = 'WorkoutFeedbackSystem';
