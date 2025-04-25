
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrainingConfig } from '@/hooks/useTrainingSetupPersistence';
import { useWorkoutState } from '@/hooks/useWorkoutState';
import { toast } from '@/hooks/use-toast';

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
  // This component is just a bridge to the TrainingSession page
  // We'll redirect to the dedicated page

  const navigate = useNavigate();
  const { setTrainingConfig } = useWorkoutState();

  React.useEffect(() => {
    if (trainingConfig) {
      // Set the training config in the workout state
      setTrainingConfig(trainingConfig);
      
      // Navigate to the dedicated training session page
      navigate('/training-session');
    }
  }, [trainingConfig, navigate, setTrainingConfig]);

  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-white">Loading training session...</p>
    </div>
  );
};
