
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

  useEffect(() => {
    if (trainingConfig) {
      // Reset any existing session first
      resetSession();
      
      // Set up the new training session
      setTrainingConfig(trainingConfig);
      
      // Start workout and update route - order matters here
      updateLastActiveRoute('/training-session');
      startWorkout();
      
      // Navigate to the training session page
      navigate('/training-session');
      
      // Show toast to confirm workout started
      toast.success("Workout started - You can return to it anytime from the banner");
    }
  }, [trainingConfig, navigate, resetSession, setTrainingConfig, startWorkout, updateLastActiveRoute]);

  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-white">Loading training session...</p>
    </div>
  );
};
