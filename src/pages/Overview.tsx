
import React from 'react';
import WorkoutErrorBoundary from '@/components/ui/WorkoutErrorBoundary';
import { WorkoutDataProvider } from '@/context/WorkoutDataProvider';
import { OverviewContent } from '@/components/overview/OverviewContent';

const OverviewPageComponent: React.FC = () => {
  return (
    <WorkoutErrorBoundary>
      <WorkoutDataProvider>
        <OverviewContent />
      </WorkoutDataProvider>
    </WorkoutErrorBoundary>
  );
};

export const OverviewPage = React.memo(OverviewPageComponent);
export default OverviewPage;
