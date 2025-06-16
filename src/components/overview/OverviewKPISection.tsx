
import React from 'react';
import { Activity, Target, Clock, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useWeightUnit } from '@/context/WeightUnitContext';
import { EnterpriseGrid, GridSection } from '@/components/layouts/EnterpriseGrid';
import { MetricCard } from '@/components/layouts/MetricCard';
import { OverviewMetrics } from '@/services/overviewDataService';

interface OverviewKPISectionProps {
  metrics: OverviewMetrics;
}

export const OverviewKPISection: React.FC<OverviewKPISectionProps> = React.memo(({ metrics }) => {
  const { weightUnit } = useWeightUnit();

  return (
    <EnterpriseGrid columns={4} gap="lg" minRowHeight="200px">
      <GridSection span={1}>
        <MetricCard
          title="Total Workouts"
          value={metrics.totalWorkouts}
          icon={Activity}
          subtitle="All time"
          change={metrics.comparison?.workoutsChange ? {
            value: metrics.comparison.workoutsChange,
            type: metrics.comparison.workoutsChange > 0 ? 'increase' : 'decrease'
          } : undefined}
        />
      </GridSection>

      <GridSection span={1}>
        <MetricCard
          title="Weekly Goal"
          value={`${metrics.thisWeekWorkouts}/${metrics.weeklyGoal}`}
          icon={Target}
          subtitle={`${Math.round(metrics.weeklyProgress)}% complete`}
          actions={
            <Progress value={metrics.weeklyProgress} className="w-16 h-2" />
          }
        />
      </GridSection>

      <GridSection span={1}>
        <MetricCard
          title="Avg Duration"
          value={metrics.avgDuration > 0 ? `${Math.round(metrics.avgDuration / 60)}m` : '0m'}
          icon={Clock}
          subtitle="Per workout"
          change={metrics.comparison?.durationChange ? {
            value: metrics.comparison.durationChange,
            type: metrics.comparison.durationChange > 0 ? 'increase' : 'decrease'
          } : undefined}
        />
      </GridSection>

      <GridSection span={1}>
        <MetricCard
          title="Total Volume"
          value={`${(metrics.totalVolume / 1000).toFixed(1)}k`}
          icon={TrendingUp}
          subtitle={`${weightUnit} lifted`}
          change={metrics.comparison?.volumeChange ? {
            value: metrics.comparison.volumeChange,
            type: metrics.comparison.volumeChange > 0 ? 'increase' : 'decrease'
          } : undefined}
        />
      </GridSection>
    </EnterpriseGrid>
  );
});

OverviewKPISection.displayName = 'OverviewKPISection';
