
import React, { useEffect } from 'react';
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
  const { resetSession, setTrainingConfig, startWorkout, updateLastActiveRoute } = useWorkoutState();

  // Reset workout state on component mount
  useEffect(() => {
    resetSession();
  }, []); // Only run once on mount

  useEffect(() => {
    if (trainingConfig) {
      // Set the training config in the workout state after resetting
      setTrainingConfig(trainingConfig);
      
      // Mark workout as active
      startWorkout();
      
      // Set last active route
      updateLastActiveRoute('/training-session');
      
      // Navigate to the dedicated training session page
      navigate('/training-session');
    }
  }, [trainingConfig, navigate, setTrainingConfig, startWorkout, updateLastActiveRoute]);

  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-white">Loading training session...</p>
    </div>
  );
};
