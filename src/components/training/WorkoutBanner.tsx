
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Timer, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkoutState } from '@/hooks/useWorkoutState';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function WorkoutBanner() {
  const navigate = useNavigate();
  const { 
    isActive, 
    elapsedTime, 
    trainingConfig,
    workoutStatus,
    lastActiveRoute
  } = useWorkoutState();
  
  // Simplified visibility check - show when workout is active and not saved
  const shouldShowBanner = isActive && workoutStatus !== 'saved';
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleReturnToWorkout = () => {
    navigate(lastActiveRoute || '/training-session');
  };

  return (
    <AnimatePresence>
      {shouldShowBanner && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-purple-600/90 to-pink-500/90",
            "backdrop-blur-sm border-b border-white/10 shadow-lg"
          )}
        >
          <div className="max-w-screen-xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Timer className="h-4 w-4 text-white animate-pulse" />
              <span className="text-sm font-medium text-white">
                {formatTime(elapsedTime)}
              </span>
              <span className="text-sm text-white/80">
                {trainingConfig?.trainingType || "Workout"}
              </span>
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:text-white hover:bg-white/20"
              onClick={handleReturnToWorkout}
            >
              <Play className="h-4 w-4 mr-2" />
              Return to Workout
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
