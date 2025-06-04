
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Plus, Trash2, Edit3 } from 'lucide-react';

interface FeedbackMessage {
  id: string;
  type: 'success' | 'info' | 'warning';
  message: string;
  icon?: React.ReactNode;
}

interface InteractionFeedbackProps {
  onSetCompleted?: (exerciseName: string, setIndex: number) => void;
  onExerciseAdded?: (exerciseName: string) => void;
  onExerciseRemoved?: (exerciseName: string) => void;
}

export const InteractionFeedback: React.FC<InteractionFeedbackProps> = ({
  onSetCompleted,
  onExerciseAdded,
  onExerciseRemoved
}) => {
  const [feedbackMessages, setFeedbackMessages] = useState<FeedbackMessage[]>([]);

  const showFeedback = (message: string, type: FeedbackMessage['type'], icon?: React.ReactNode) => {
    const id = `feedback-${Date.now()}`;
    const newMessage: FeedbackMessage = { id, type, message, icon };
    
    setFeedbackMessages(prev => [...prev, newMessage]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setFeedbackMessages(prev => prev.filter(msg => msg.id !== id));
    }, 3000);
  };

  // Enhanced feedback wrapper functions
  const handleSetCompleted = (exerciseName: string, setIndex: number) => {
    onSetCompleted?.(exerciseName, setIndex);
    showFeedback(
      `Set ${setIndex + 1} completed! Great work! 💪`,
      'success',
      <CheckCircle className="h-4 w-4" />
    );
  };

  const handleExerciseAdded = (exerciseName: string) => {
    onExerciseAdded?.(exerciseName);
    showFeedback(
      `${exerciseName} added to workout`,
      'info',
      <Plus className="h-4 w-4" />
    );
  };

  const handleExerciseRemoved = (exerciseName: string) => {
    onExerciseRemoved?.(exerciseName);
    showFeedback(
      `${exerciseName} removed from workout`,
      'warning',
      <Trash2 className="h-4 w-4" />
    );
  };

  return (
    <>
      {/* Feedback Toast Container */}
      <div className="fixed top-20 right-4 z-50 space-y-2">
        <AnimatePresence>
          {feedbackMessages.map((feedback) => (
            <motion.div
              key={feedback.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm
                ${feedback.type === 'success' 
                  ? 'bg-green-600/90 text-green-100' 
                  : feedback.type === 'warning'
                    ? 'bg-orange-600/90 text-orange-100'
                    : 'bg-blue-600/90 text-blue-100'
                }
              `}
            >
              {feedback.icon}
              <span className="text-sm font-medium">{feedback.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Return wrapper functions for components to use */}
      <div style={{ display: 'none' }}>
        {/* This component provides feedback functions via props/context */}
      </div>
    </>
  );
};

// Export feedback functions for use in other components
export const useFeedback = () => {
  const [feedbackMessages, setFeedbackMessages] = useState<FeedbackMessage[]>([]);

  const showFeedback = (message: string, type: FeedbackMessage['type'], icon?: React.ReactNode) => {
    const id = `feedback-${Date.now()}`;
    const newMessage: FeedbackMessage = { id, type, message, icon };
    
    setFeedbackMessages(prev => [...prev, newMessage]);
    
    setTimeout(() => {
      setFeedbackMessages(prev => prev.filter(msg => msg.id !== id));
    }, 3000);
  };

  return { feedbackMessages, showFeedback };
};
