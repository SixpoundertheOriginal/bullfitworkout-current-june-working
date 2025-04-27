
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkoutEfficiencyScore } from '@/components/metrics/WorkoutEfficiencyScore';
import { WorkoutIntensityGauge } from '@/components/metrics/WorkoutIntensityGauge';
import { WorkoutDensityChart } from '@/components/metrics/WorkoutDensityChart';
import { EnhancedStatsCard } from '@/components/metrics/EnhancedStatsCard';
import { Activity, BarChart3, Clock, Dumbbell } from 'lucide-react';
import { WorkoutStats } from '@/hooks/useWorkoutStats';
import { cn } from '@/lib/utils';

interface WorkoutOverviewSectionProps {
  stats: WorkoutStats;
  className?: string;
}

export const WorkoutOverviewSection = ({ stats, className }: WorkoutOverviewSectionProps) => {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Summary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <EnhancedStatsCard
          title="Total Workouts"
          value={stats.totalWorkouts}
          icon={<Dumbbell className="h-4 w-4" />}
        />
        <EnhancedStatsCard
          title="Total Duration"
          value={formatDuration(stats.totalDuration)}
          icon={<Clock className="h-4 w-4" />}
        />
        <EnhancedStatsCard
          title="Average Duration"
          value={formatDuration(stats.avgDuration)}
          icon={<Activity className="h-4 w-4" />}
        />
        <EnhancedStatsCard
          title="Completion Rate"
          value={`${Math.round(stats.completionRate)}%`}
          icon={<BarChart3 className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Performance Metrics */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <WorkoutEfficiencyScore score={stats.completionRate} />
              <WorkoutIntensityGauge 
                intensity={stats.progressMetrics?.volumeChangePercentage || 0} 
              />
            </div>
          </CardContent>
        </Card>

        {/* Workout Density */}
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-md">Workout Density</CardTitle>
          </CardHeader>
          <CardContent>
            <WorkoutDensityChart
              totalTime={stats.avgDuration}
              activeTime={stats.avgDuration * 0.7} // Assuming 70% active time
              restTime={stats.avgDuration * 0.3} // Assuming 30% rest time
              totalVolume={stats.progressMetrics?.volumeChangePercentage || 0}
              weightUnit="kg"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
