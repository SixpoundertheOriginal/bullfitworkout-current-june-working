
import React from "react";
import { SaveProgress, WorkoutStatus } from "@/types/workout";
import { SaveProgressIndicator } from "./training/SaveProgressIndicator";

interface WorkoutSaveStatusProps {
  status: WorkoutStatus;
  saveProgress?: SaveProgress;
  retryCount?: number;
  maxRetries?: number;
  canRetry?: boolean;
  onRetry?: () => void;
  onSaveLater?: () => void;
  className?: string;
}

export const WorkoutSaveStatus = ({ 
  status, 
  saveProgress, 
  retryCount = 0,
  maxRetries = 3,
  canRetry = false,
  onRetry,
  onSaveLater,
  className 
}: WorkoutSaveStatusProps) => {
  // Map WorkoutStatus to SaveProgressIndicator status
  const getProgressStatus = () => {
    switch (status) {
      case 'saving':
        return 'saving';
      case 'saved':
        return 'complete';
      case 'failed':
        return 'failed';
      case 'partial':
        return 'failed';
      case 'recovering':
        return 'retrying';
      default:
        return 'idle';
    }
  };

  return (
    <SaveProgressIndicator
      status={getProgressStatus()}
      progress={saveProgress}
      retryCount={retryCount}
      maxRetries={maxRetries}
      canRetry={canRetry}
      onRetry={onRetry}
      onSaveLater={onSaveLater}
      className={className}
    />
  );
};
