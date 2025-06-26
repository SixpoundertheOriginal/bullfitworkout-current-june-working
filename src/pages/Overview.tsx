
import React from 'react';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { WorkoutErrorBoundary } from '@/components/ui/WorkoutErrorBoundary';
import { OverviewContent } from '@/components/overview/OverviewContent';

const OverviewPageComponent: React.FC = () => {
  return (
    <ErrorBoundary>
      <WorkoutErrorBoundary>
        <OverviewContent />
      </WorkoutErrorBoundary>
    </ErrorBoundary>
  );
};

export const OverviewPage = React.memo(OverviewPageComponent);
export default OverviewPage;
