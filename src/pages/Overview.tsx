
import React from 'react';
import WorkoutErrorBoundary from '@/components/ui/WorkoutErrorBoundary';
import { OptimizedWorkoutStatsProvider } from '@/context/OptimizedWorkoutStatsProvider';
import { OverviewContent } from '@/components/overview/OverviewContent';

const OverviewPageComponent: React.FC = () => {
  return (
    <WorkoutErrorBoundary>
      <OptimizedWorkoutStatsProvider>
        <OverviewContent />
      </OptimizedWorkoutStatsProvider>
    </WorkoutErrorBoundary>
  );
};

export const OverviewPage = React.memo(OverviewPageComponent);
export default OverviewPage;
