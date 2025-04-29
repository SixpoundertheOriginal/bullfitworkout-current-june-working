
import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrainingConfig } from '@/hooks/useTrainingSetupPersistence';
import { useWorkoutState } from '@/hooks/useWorkoutState';
import { toast } from "@/components/ui/sonner";

interface TrainingSessionProps {
  trainingConfig: TrainingConfig | null;
  onComplete: () => void;
  onCancel: () => void;
}

export const TrainingSession: React.FC<TrainingSessionProps> = ({ 
  trainingConfig,
  onComplete,
  onCancel
}) => {
  const navigate = useNavigate();
  const { 
    resetSession, 
    setTrainingConfig, 
    startWorkout, 
    updateLastActiveRoute, 
    isActive, 
    exercises, 
    elapsedTime,
    sessionId,
    persistWorkoutState
  } = useWorkoutState();

  // Debug logging for component state
  useEffect(() => {
    console.log('TrainingSession rendered with:', { 
      trainingConfig, 
      isActive, 
      exerciseCount: Object.keys(exercises).length,
      elapsedTime,
      sessionId
    });
  }, [trainingConfig, isActive, exercises, elapsedTime, sessionId]);

  // Session initialization logic - using useCallback to prevent multiple executions
  const initializeSession = useCallback(() => {
    if (trainingConfig && !isActive) {
      console.log('Starting new workout session with config:', trainingConfig);
      
      // Reset any existing session first to ensure clean slate
      resetSession();
      
      // Set up the new training session
      setTrainingConfig(trainingConfig);
      
      // Start workout and update route - order matters here
      updateLastActiveRoute('/training-session');
      startWorkout();
      
      // Explicitly persist state after initialization
      setTimeout(() => {
        persistWorkoutState?.();
      }, 100);
      
      // Navigate to the training session page
      navigate('/training-session');
      
      // Show toast to confirm workout started
      toast.success("Workout started - You can return to it anytime from the banner", {
        duration: 4000
      });
    } 
    // Case 2: Active session exists - Just navigate to it
    else if (isActive) {
      console.log('Navigating to existing active workout session');
      
      // If there's an active workout, just navigate to the training session page
      navigate('/training-session');
      
      // Only show toast if we have exercises (not just a new session)
      if (Object.keys(exercises).length > 0) {
        toast.info("Resuming your active workout");
      }
    }
    // Case 3: No config, no active session - Do nothing, component will unmount
  }, [
    trainingConfig, 
    isActive, 
    resetSession, 
    setTrainingConfig, 
    startWorkout, 
    updateLastActiveRoute, 
    navigate, 
    exercises,
    persistWorkoutState
  ]);

  // Run initialization once on mount
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);
  
  // Make sure the page visibility API is used to refresh data
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isActive) {
        console.log('Tab became visible, refreshing training session status');
        
        // Refresh state if needed by forcing navigation
        if (window.location.pathname !== '/training-session') {
          navigate('/training-session');
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isActive, navigate]);

  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-white">Loading training session...</p>
    </div>
  );
};
