
import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, AlertCircle, RefreshCw, Clock } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { SaveProgress } from '@/types/workout';

interface SaveProgressIndicatorProps {
  status: 'idle' | 'saving' | 'validating' | 'complete' | 'failed' | 'retrying';
  progress?: SaveProgress | null;
  retryCount?: number;
  maxRetries?: number;
  canRetry?: boolean;
  onRetry?: () => void;
  onSaveLater?: () => void;
  className?: string;
}

export const SaveProgressIndicator: React.FC<SaveProgressIndicatorProps> = ({
  status,
  progress,
  retryCount = 0,
  maxRetries = 3,
  canRetry = false,
  onRetry,
  onSaveLater,
  className = ''
}) => {
  if (status === 'idle') return null;

  const getStatusDisplay = () => {
    switch (status) {
      case 'saving':
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-200">
                  {progress?.step === 'workout' && "Creating workout record..."}
                  {progress?.step === 'exercise-sets' && "Saving exercise sets..."}
                  {progress?.step === 'analytics' && "Updating analytics..."}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Step {Math.floor((progress?.completed || 0) * 3) + 1} of {progress?.total || 3}
                </div>
              </div>
            </div>
            <Progress 
              value={(progress?.completed || 0) * 100} 
              className="h-2 bg-gray-700"
            />
          </div>
        );

      case 'validating':
        return (
          <div className="flex items-center space-x-3">
            <Loader2 className="h-5 w-5 animate-spin text-purple-400" />
            <span className="text-sm font-medium text-gray-200">
              Validating workout data...
            </span>
          </div>
        );

      case 'complete':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center space-x-3 text-green-400"
          >
            <CheckCircle className="h-5 w-5" />
            <div>
              <div className="text-sm font-medium">Workout saved successfully!</div>
              <div className="text-xs text-green-300">Your progress has been recorded</div>
            </div>
          </motion.div>
        );

      case 'failed':
        return (
          <div className="space-y-3">
            <div className="flex items-center space-x-3 text-red-400">
              <AlertCircle className="h-5 w-5" />
              <div className="flex-1">
                <div className="text-sm font-medium">Save failed</div>
                <div className="text-xs text-red-300">
                  {progress?.errors[0]?.message || 'Unknown error occurred'}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-2">
              {canRetry && onRetry && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRetry}
                  className="bg-red-900/30 border-red-700 text-red-300 hover:bg-red-900/50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry ({retryCount}/{maxRetries})
                </Button>
              )}
              
              {onSaveLater && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onSaveLater}
                  className="bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Save Later
                </Button>
              )}
            </div>
          </div>
        );

      case 'retrying':
        return (
          <div className="flex items-center space-x-3">
            <Loader2 className="h-5 w-5 animate-spin text-yellow-400" />
            <div>
              <div className="text-sm font-medium text-gray-200">
                Retrying save... (Attempt {retryCount}/{maxRetries})
              </div>
              <div className="text-xs text-yellow-300">
                Please wait while we retry the operation
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`
        p-4 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg
        shadow-lg ${className}
      `}
    >
      {getStatusDisplay()}
    </motion.div>
  );
};
