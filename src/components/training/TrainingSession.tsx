
import React, { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrainingConfig } from '@/hooks/useTrainingSetupPersistence';
import { useWorkoutStore } from '@/store/workoutStore';
import { toast } from "@/hooks/use-toast";
import { usePageVisibility } from '@/hooks/usePageVisibility';
import { ExerciseTrackerContainer } from '@/components/training/ExerciseTrackerContainer';
import { WorkoutSessionHeader } from '@/components/training/WorkoutSessionHeader';
import { WorkoutSessionFooter } from '@/components/training/WorkoutSessionFooter';

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
  const { isVisible } = usePageVisibility();
  const { 
    resetWorkout, 
    setTrainingConfig, 
    startWorkout, 
    updateLastActiveRoute, 
    isActive, 
    exercises, 
    elapsedTime,
    sessionId
  } = useWorkoutStore();
  
  // Debug logging for component state
  useEffect(() => {
    console.log('TrainingSession rendered with:', { 
      trainingConfig, 
      isActive, 
      exerciseCount: Object.keys(exercises).length,
      elapsedTime,
      sessionId,
      isVisible 
    });
  }, [trainingConfig, isActive, exercises, elapsedTime, sessionId, isVisible]);
  
  // Session initialization logic - using useCallback to prevent multiple executions
  const initializeSession = useCallback(() => {
    if (trainingConfig && !isActive) {
      console.log('Starting new workout session with config:', trainingConfig);
      
      // Reset any existing session first to ensure clean slate
      resetWorkout();
      
      // Set up the new training session
      setTrainingConfig(trainingConfig);
      
      // Start workout and update route - order matters here
      updateLastActiveRoute('/training-session');
      startWorkout();
      
      // Show toast to confirm workout started
      toast({
        title: "Workout started",
        description: "You can return to it anytime from the banner"
      });
    } 
    // Case 2: Active session exists - show training interface
    else if (isActive) {
      console.log('Continuing existing active workout session');
      
      // Only show toast if we have exercises (not just a new session)
      if (Object.keys(exercises).length > 0) {
        toast({
          title: "Resuming your active workout"
        });
      }
    }
    // Case 3: No config, no active session - This should be handled by parent component
  }, [
    trainingConfig, 
    isActive, 
    resetWorkout, 
    setTrainingConfig, 
    startWorkout, 
    updateLastActiveRoute, 
    exercises
  ]);

  // Run initialization once on mount
  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  // Show loading state only during initial setup
  if (trainingConfig && !isActive) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-white">Initializing workout...</p>
      </div>
    );
  }

  // If we have training config or active workout, show the full training interface
  if (trainingConfig || isActive) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <WorkoutSessionHeader />
        <div className="flex-1 overflow-y-auto">
          <ExerciseTrackerContainer />
        </div>
        <WorkoutSessionFooter 
          onComplete={onComplete}
          onCancel={onCancel}
        />
      </div>
    );
  }

  // This should not happen due to parent component logic, but just in case
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-white">No active workout session found</p>
    </div>
  );
};
