
import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { WorkoutErrorBoundary } from '@/components/ui/WorkoutErrorBoundary';
import { WorkoutDataProvider } from '@/context/WorkoutDataProvider';
import { OverviewContent } from '@/components/overview/OverviewContent';

const OverviewPageComponent: React.FC = () => {
  return (
    <ErrorBoundary>
      <WorkoutErrorBoundary>
        <WorkoutDataProvider>
          <OverviewContent />
        </WorkoutDataProvider>
      </WorkoutErrorBoundary>
    </ErrorBoundary>
  );
};

export const OverviewPage = React.memo(OverviewPageComponent);
export default OverviewPage;
