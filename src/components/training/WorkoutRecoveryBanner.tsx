
import React from 'react';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface WorkoutRecoveryBannerProps {
  onRecover: () => void;
  onDismiss: () => void;
  exerciseCount: number;
  completedSetsCount: number;
}

export const WorkoutRecoveryBanner: React.FC<WorkoutRecoveryBannerProps> = ({
  onRecover,
  onDismiss,
  exerciseCount,
  completedSetsCount
}) => {
  return (
    <Card className="border-yellow-500/50 bg-yellow-500/10 mb-4">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-yellow-100 mb-1">
              Incomplete Workout Detected
            </h3>
            <p className="text-xs text-yellow-200/80 mb-3">
              Found {exerciseCount} exercises with {completedSetsCount} completed sets. 
              You can resume and finish this workout.
            </p>
            
            <div className="flex gap-2">
              <Button
                onClick={onRecover}
                size="sm"
                variant="outline"
                className="h-8 text-xs border-yellow-500/50 text-yellow-100 hover:bg-yellow-500/20"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Resume Workout
              </Button>
              
              <Button
                onClick={onDismiss}
                size="sm"
                variant="ghost"
                className="h-8 text-xs text-yellow-200/60 hover:text-yellow-100 hover:bg-yellow-500/10"
              >
                <X className="h-3 w-3 mr-1" />
                Start Fresh
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
