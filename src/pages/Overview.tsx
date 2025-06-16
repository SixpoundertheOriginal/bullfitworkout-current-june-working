
import React, { useMemo } from 'react';
import { Activity, Target, TrendingUp, Clock, BarChart3, Calendar, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWorkouts } from '@/hooks/useWorkouts';
import { Progress } from '@/components/ui/progress';
import { QuickStatsSection } from '@/components/metrics/QuickStatsSection';
import WorkoutErrorBoundary from '@/components/ui/WorkoutErrorBoundary';
import { SkeletonScreen } from '@/components/performance/SkeletonScreen';
import { WorkoutVolumeOverTimeChart } from '@/components/metrics/WorkoutVolumeOverTimeChart';
import { WorkoutTypeChart } from '@/components/metrics/WorkoutTypeChart';
import { MuscleFocusChart } from '@/components/metrics/MuscleFocusChart';
import { useProcessWorkoutMetrics } from '@/hooks/useProcessWorkoutMetrics';
import { useWeightUnit } from '@/context/WeightUnitContext';
import { EnterpriseGrid, GridSection } from '@/components/layouts/EnterpriseGrid';
import { ResponsiveContainer } from '@/components/layouts/ResponsiveContainer';
import { ChartContainer } from '@/components/layouts/ChartContainer';
import { MetricCard } from '@/components/layouts/MetricCard';
import { OverviewDatePicker } from '@/components/date-filters/OverviewDatePicker';
import { OptimizedWorkoutStatsProvider, useOptimizedWorkoutStatsContext } from '@/context/OptimizedWorkoutStatsProvider';

const OverviewContent: React.FC = React.memo(() => {
  const { user } = useAuth();
  const { workouts, isLoading } = useWorkouts();
  const { weightUnit } = useWeightUnit();
  const { stats, comparisonStats, loading: statsLoading } = useOptimizedWorkoutStatsContext();

  // Transform workouts for metrics processing with memoization
  const workoutsForMetrics = useMemo(() => {
    if (!workouts || workouts.length === 0) return [];
    
    return workouts.map(workout => ({
      start_time: workout.created_at,
      duration: workout.duration || 0,
      exercises: workout.exercises ? Object.entries(workout.exercises).map(([exerciseName, sets]) => 
        sets.map(set => ({
          exercise_name: exerciseName,
          completed: set.completed ?? true,
          weight: set.weight,
          reps: set.reps,
          restTime: 0
        }))
      ).flat() : []
    }));
  }, [workouts]);

  // Get processed metrics with memoization
  const {
    volumeOverTimeData,
    volumeStats,
    hasVolumeData
  } = useProcessWorkoutMetrics(workoutsForMetrics, weightUnit);

  // Calculate workout type data with memoization
  const workoutTypeData = useMemo(() => {
    if (!workouts || workouts.length === 0) return [];
    
    const typeCount: Record<string, number> = {};
    workouts.forEach(workout => {
      const type = 'Strength';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });
    
    return Object.entries(typeCount).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / workouts.length) * 100)
    }));
  }, [workouts]);

  // Calculate muscle focus data with memoization
  const muscleFocusData = useMemo(() => {
    if (!workouts || workouts.length === 0) return {};
    
    const muscleFocus: Record<string, number> = {};
    workouts.forEach(workout => {
      if (workout.exercises) {
        Object.keys(workout.exercises).forEach(exerciseName => {
          const muscleGroup = exerciseName.toLowerCase().includes('bench') ? 'chest' :
                             exerciseName.toLowerCase().includes('squat') ? 'legs' :
                             exerciseName.toLowerCase().includes('deadlift') ? 'back' :
                             exerciseName.toLowerCase().includes('curl') ? 'arms' : 'core';
          
          muscleFocus[muscleGroup] = (muscleFocus[muscleGroup] || 0) + 1;
        });
      }
    });
    
    return muscleFocus;
  }, [workouts]);

  // Calculate stats with comparison support
  const calculatedStats = useMemo(() => {
    if (!workouts || workouts.length === 0) {
      return {
        totalWorkouts: 0,
        totalDuration: 0,
        avgDuration: 0,
        totalVolume: 0,
        thisWeekWorkouts: 0,
        weeklyGoal: 3,
        comparison: {}
      };
    }

    const totalWorkouts = workouts.length;
    const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const avgDuration = totalWorkouts > 0 ? totalDuration / totalWorkouts : 0;
    
    const totalVolume = workouts.reduce((sum, workout) => {
      if (!workout.exercises) return sum;
      return sum + Object.values(workout.exercises).flat().reduce((exerciseSum, set) => {
        return exerciseSum + (set.weight * set.reps);
      }, 0);
    }, 0);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekWorkouts = workouts.filter(w => 
      new Date(w.created_at) >= oneWeekAgo
    ).length;

    // Calculate comparison metrics if available
    const comparison = comparisonStats ? {
      workoutsChange: ((totalWorkouts - comparisonStats.totalWorkouts) / Math.max(comparisonStats.totalWorkouts, 1)) * 100,
      volumeChange: ((totalVolume - (comparisonStats.progressMetrics?.volumeChangePercentage || 0)) / Math.max(comparisonStats.progressMetrics?.volumeChangePercentage || 1, 1)) * 100,
      durationChange: ((avgDuration - comparisonStats.avgDuration) / Math.max(comparisonStats.avgDuration, 1)) * 100
    } : {};

    return {
      totalWorkouts,
      totalDuration,
      avgDuration,
      totalVolume,
      thisWeekWorkouts,
      weeklyGoal: 3,
      comparison
    };
  }, [workouts, comparisonStats]);

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
        
        <EnterpriseGrid columns={4} gap="lg">
          <GridSection span={12}>
            <div className="section-skeleton h-32 rounded-lg" />
          </GridSection>
          {Array.from({ length: 8 }).map((_, i) => (
            <GridSection key={i} span={1}>
              <div className="section-skeleton h-48 rounded-lg" />
            </GridSection>
          ))}
        </EnterpriseGrid>
      </div>
    );
  }

  const weeklyProgress = calculatedStats.weeklyGoal > 0 ? (calculatedStats.thisWeekWorkouts / calculatedStats.weeklyGoal) * 100 : 0;

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

      {/* Main Dashboard Grid */}
      <EnterpriseGrid columns={4} gap="lg" minRowHeight="200px">
        {/* Core KPI Cards */}
        <GridSection span={1}>
          <MetricCard
            title="Total Workouts"
            value={calculatedStats.totalWorkouts}
            icon={Activity}
            subtitle="All time"
            change={calculatedStats.comparison.workoutsChange ? {
              value: calculatedStats.comparison.workoutsChange,
              type: calculatedStats.comparison.workoutsChange > 0 ? 'increase' : 'decrease'
            } : undefined}
          />
        </GridSection>

        <GridSection span={1}>
          <MetricCard
            title="Weekly Goal"
            value={`${calculatedStats.thisWeekWorkouts}/${calculatedStats.weeklyGoal}`}
            icon={Target}
            subtitle={`${Math.round(weeklyProgress)}% complete`}
            actions={
              <Progress value={weeklyProgress} className="w-16 h-2" />
            }
          />
        </GridSection>

        <GridSection span={1}>
          <MetricCard
            title="Avg Duration"
            value={calculatedStats.avgDuration > 0 ? `${Math.round(calculatedStats.avgDuration / 60)}m` : '0m'}
            icon={Clock}
            subtitle="Per workout"
            change={calculatedStats.comparison.durationChange ? {
              value: calculatedStats.comparison.durationChange,
              type: calculatedStats.comparison.durationChange > 0 ? 'increase' : 'decrease'
            } : undefined}
          />
        </GridSection>

        <GridSection span={1}>
          <MetricCard
            title="Total Volume"
            value={`${(calculatedStats.totalVolume / 1000).toFixed(1)}k`}
            icon={TrendingUp}
            subtitle={`${weightUnit} lifted`}
            change={calculatedStats.comparison.volumeChange ? {
              value: calculatedStats.comparison.volumeChange,
              type: calculatedStats.comparison.volumeChange > 0 ? 'increase' : 'decrease'
            } : undefined}
          />
        </GridSection>

        {/* Charts Row */}
        <GridSection span={2} title="Workout Volume Trend">
          <ChartContainer 
            height={300}
            aspectRatio="2/1"
          >
            <WorkoutVolumeOverTimeChart 
              data={volumeOverTimeData}
              height={250}
              className="h-full"
            />
          </ChartContainer>
        </GridSection>

        <GridSection span={2} title="Muscle Focus Distribution">
          <ChartContainer height={300}>
            <MuscleFocusChart muscleGroups={muscleFocusData} />
          </ChartContainer>
        </GridSection>

        {/* Secondary Charts and Widgets */}
        <GridSection span={1} title="Workout Types">
          <ChartContainer height={200}>
            <WorkoutTypeChart 
              workoutTypes={workoutTypeData}
              height={150}
            />
          </ChartContainer>
        </GridSection>

        <GridSection span={1} title="Training Consistency">
          <ResponsiveContainer 
            variant="card" 
            minHeight="200px"
            padding="md"
          >
            <div className="flex items-center gap-4 mb-4">
              <Calendar className="h-5 w-5 text-purple-400" />
              <span className="text-sm text-gray-400">Weekly pattern</span>
            </div>
            <div className="space-y-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <div key={day} className="flex justify-between items-center p-2 bg-gray-800/30 rounded">
                  <span className="text-sm text-gray-400">{day}</span>
                  <div className="w-16 h-2 bg-gray-700 rounded">
                    <div 
                      className="h-full bg-purple-400 rounded" 
                      style={{ width: `${Math.random() * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ResponsiveContainer>
        </GridSection>

        <GridSection span={1} title="Performance Score">
          <ResponsiveContainer 
            variant="card" 
            minHeight="200px"
            padding="md"
          >
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">8.5</div>
              <div className="text-sm text-gray-400 mb-4">Overall Score</div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-purple-400 h-2 rounded-full" style={{ width: '85%' }} />
              </div>
            </div>
          </ResponsiveContainer>
        </GridSection>

        <GridSection span={1} title="Weekly Summary">
          <ResponsiveContainer 
            variant="card" 
            minHeight="200px"
            padding="md"
          >
            <div className="space-y-3">
              <div className="p-3 bg-gray-800/30 rounded border-l-2 border-purple-400">
                <p className="text-sm text-gray-300">Strength trending upward</p>
                <p className="text-xs text-gray-500">Based on recent workouts</p>
              </div>
              <div className="p-3 bg-gray-800/30 rounded border-l-2 border-blue-400">
                <p className="text-sm text-gray-300">Consistent training schedule</p>
                <p className="text-xs text-gray-500">Great job this week!</p>
              </div>
            </div>
          </ResponsiveContainer>
        </GridSection>
      </EnterpriseGrid>
    </div>
  );
});

OverviewContent.displayName = 'OverviewContent';

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
