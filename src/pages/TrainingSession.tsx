
import React from 'react';
import { TrainingSession as TrainingSessionComponent } from '@/components/training/TrainingSession';
import { TrainingSessionErrorBoundary } from '@/components/training/TrainingSessionErrorBoundary';
import { useWorkoutExercises } from '@/hooks/useWorkoutStoreSelectors';
import { useNavigate, useLocation } from 'react-router-dom';
import { TrainingConfig } from '@/hooks/useTrainingSetupPersistence';

const TrainingSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use stable selectors instead of direct store access
  const { exercises, isActive } = useWorkoutExercises();
  
  // Extract training config from navigation state
  const trainingConfig = location.state?.trainingConfig as TrainingConfig | null;
  
  console.log('TrainingSessionPage state:', { 
    isActive, 
    exerciseCount: Object.keys(exercises).length,
    trainingConfig,
    locationState: location.state 
  });
  
  // Show message if no active workout AND no training config from setup
  if (!isActive && Object.keys(exercises).length === 0 && !trainingConfig) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">No Active Workout</h1>
          <p className="text-gray-400 mb-6">Start a workout from the home page to begin training.</p>
          <a 
            href="/" 
            className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  const handleComplete = () => {
    navigate('/');
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <TrainingSessionErrorBoundary>
      <div className="min-h-screen bg-gray-900">
        <TrainingSessionComponent 
          trainingConfig={trainingConfig}
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      </div>
    </TrainingSessionErrorBoundary>
  );
};

export default TrainingSessionPage;
