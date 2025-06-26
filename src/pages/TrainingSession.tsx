
import React from 'react';
import { TrainingSession as TrainingSessionComponent } from '@/components/training/TrainingSession';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useWorkoutStore } from '@/store/workoutStore';
import { useNavigate } from 'react-router-dom';

const TrainingSessionPage: React.FC = () => {
  const { isActive, exercises } = useWorkoutStore();
  const navigate = useNavigate();
  
  // Show message if no active workout
  if (!isActive && Object.keys(exercises).length === 0) {
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
    // Navigate to home or workout complete page
    navigate('/');
  };

  const handleCancel = () => {
    // Navigate back to home
    navigate('/');
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-900">
        <TrainingSessionComponent 
          trainingConfig={null}
          onComplete={handleComplete}
          onCancel={handleCancel}
        />
      </div>
    </ErrorBoundary>
  );
};

export default TrainingSessionPage;
