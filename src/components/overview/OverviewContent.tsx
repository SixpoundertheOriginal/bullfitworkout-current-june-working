
import React from 'react';
import { GridSection } from '@/components/layouts/EnterpriseGrid';
import { QuickStatsSection } from '@/components/metrics/QuickStatsSection';
import { OverviewDatePicker } from '@/components/date-filters/OverviewDatePicker';
import { SkeletonScreen } from '@/components/performance/SkeletonScreen';
import { OverviewKPISection } from './OverviewKPISection';
import { OverviewChartsSection } from './OverviewChartsSection';
import { OverviewWidgetsSection } from './OverviewWidgetsSection';
import { useOverviewMetrics } from '@/hooks/useOverviewMetrics';
import { useWorkouts } from '@/hooks/useWorkouts';

export const OverviewContent: React.FC = React.memo(() => {
  const { isLoading } = useWorkouts();
  const { 
    overviewMetrics, 
    workoutTypeData, 
    muscleFocusData, 
    loading: statsLoading 
  } = useOverviewMetrics();

  if (isLoading || statsLoading) {
    return (
      <div className="container-app py-6 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Overview</h1>
            <p className="text-muted-foreground">
              Track your fitness journey and progress
            </p>
          </div>
          <OverviewDatePicker />
        </div>
        
        <SkeletonScreen variant="workout-session" count={1} />
        
        <div className="grid grid-cols-4 gap-8">
          <GridSection span={12}>
            <div className="section-skeleton h-32 rounded-lg" />
          </GridSection>
          {Array.from({ length: 8 }).map((_, i) => (
            <GridSection key={i} span={1}>
              <div className="section-skeleton h-48 rounded-lg" />
            </GridSection>
          ))}
        </div>
      </div>
    );
  }

  const { workouts } = useWorkouts();

  return (
    <div className="container-app py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Overview</h1>
          <p className="text-muted-foreground">
            Track your fitness journey and progress
          </p>
        </div>
        <OverviewDatePicker showComparison={true} />
      </div>

      {/* Quick Stats Section */}
      <GridSection span={12}>
        <QuickStatsSection />
      </GridSection>

      {/* Core KPI Cards */}
      <OverviewKPISection metrics={overviewMetrics} />

      {/* Charts Section */}
      <OverviewChartsSection 
        workouts={workouts || []}
        workoutTypeData={workoutTypeData}
        muscleFocusData={muscleFocusData}
      />

      {/* Widgets Section */}
      <OverviewWidgetsSection />
    </div>
  );
});

OverviewContent.displayName = 'OverviewContent';
