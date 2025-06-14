
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Target, TrendingUp, Clock, BarChart3, Calendar, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWorkouts } from '@/hooks/useWorkouts';
import { Progress } from '@/components/ui/progress';
import { QuickStatsSection } from '@/components/metrics/QuickStatsSection';
import WorkoutErrorBoundary from '@/components/ui/WorkoutErrorBoundary';
import { DashboardGrid, DashboardSection } from '@/components/layouts/DashboardGrid';
import { ChartPlaceholder } from '@/components/layouts/ChartPlaceholder';
import { SkeletonScreen } from '@/components/performance/SkeletonScreen';

interface WorkoutSet {
  weight: number;
  reps: number;
}

interface Workout {
  id: string;
  name: string;
  created_at: string;
  duration?: number;
  exercises?: Record<string, WorkoutSet[]>;
}

export const OverviewPage: React.FC = () => {
  const { user } = useAuth();
  const { workouts, isLoading } = useWorkouts();

  const stats = useMemo(() => {
    if (!workouts || workouts.length === 0) {
      return {
        totalWorkouts: 0,
        totalDuration: 0,
        avgDuration: 0,
        totalVolume: 0,
        thisWeekWorkouts: 0,
        weeklyGoal: 3
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

    return {
      totalWorkouts,
      totalDuration,
      avgDuration,
      totalVolume,
      thisWeekWorkouts,
      weeklyGoal: 3
    };
  }, [workouts]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Overview</h1>
            <p className="text-muted-foreground">
              Track your fitness journey and progress
            </p>
          </div>
        </div>
        
        <SkeletonScreen variant="workout-session" count={1} />
        
        <DashboardGrid>
          <DashboardSection span="full">
            <ChartPlaceholder type="metric" height="sm" />
          </DashboardSection>
          <DashboardSection>
            <ChartPlaceholder type="bar" />
          </DashboardSection>
          <DashboardSection>
            <ChartPlaceholder type="pie" />
          </DashboardSection>
          <DashboardSection>
            <ChartPlaceholder type="line" />
          </DashboardSection>
          <DashboardSection>
            <ChartPlaceholder type="area" />
          </DashboardSection>
        </DashboardGrid>
      </div>
    );
  }

  const weeklyProgress = stats.weeklyGoal > 0 ? (stats.thisWeekWorkouts / stats.weeklyGoal) * 100 : 0;

  return (
    <WorkoutErrorBoundary>
      <div className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Overview</h1>
            <p className="text-muted-foreground">
              Track your fitness journey and progress
            </p>
          </div>
        </div>

        {/* Quick Stats Section */}
        <DashboardSection span="full">
          <QuickStatsSection />
        </DashboardSection>

        {/* Main Dashboard Grid */}
        <DashboardGrid>
          {/* Core KPI Cards */}
          <DashboardSection>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Workouts</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalWorkouts}</div>
                <p className="text-xs text-muted-foreground">All time</p>
              </CardContent>
            </Card>
          </DashboardSection>

          <DashboardSection>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Weekly Goal</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.thisWeekWorkouts}/{stats.weeklyGoal}</div>
                <Progress value={weeklyProgress} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round(weeklyProgress)}% complete
                </p>
              </CardContent>
            </Card>
          </DashboardSection>

          <DashboardSection>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.avgDuration > 0 ? `${Math.round(stats.avgDuration / 60)}m` : '0m'}
                </div>
                <p className="text-xs text-muted-foreground">Per workout</p>
              </CardContent>
            </Card>
          </DashboardSection>

          <DashboardSection>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(stats.totalVolume / 1000).toFixed(1)}k
                </div>
                <p className="text-xs text-muted-foreground">lbs lifted</p>
              </CardContent>
            </Card>
          </DashboardSection>

          {/* Chart Placeholders - Ready for Phase 2 Integration */}
          <DashboardSection span="half" title="Workout Volume Trend">
            <ChartPlaceholder 
              type="area" 
              height="lg" 
              className="h-64"
            />
          </DashboardSection>

          <DashboardSection span="half" title="Muscle Focus Distribution">
            <ChartPlaceholder 
              type="pie" 
              height="lg" 
              className="h-64"
            />
          </DashboardSection>

          <DashboardSection span="third" title="Workout Types">
            <ChartPlaceholder 
              type="bar" 
              height="md"
            />
          </DashboardSection>

          <DashboardSection span="third" title="Training Consistency">
            <ChartPlaceholder 
              type="line" 
              height="md"
            />
          </DashboardSection>

          <DashboardSection span="third" title="Performance Score">
            <ChartPlaceholder 
              type="metric" 
              height="md"
            />
          </DashboardSection>

          {/* Weekly Calendar Overview */}
          <DashboardSection span="full" title="This Week's Training">
            <Card className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <Calendar className="h-5 w-5 text-purple-400" />
                <span className="text-sm text-gray-400">Ready for calendar integration</span>
              </div>
              <ChartPlaceholder type="bar" height="sm" />
            </Card>
          </DashboardSection>

          {/* Top Exercises Preview */}
          <DashboardSection span="half" title="Top Exercises">
            <Card className="p-4">
              <div className="flex items-center gap-4 mb-4">
                <BarChart3 className="h-5 w-5 text-purple-400" />
                <span className="text-sm text-gray-400">Ready for exercise ranking</span>
              </div>
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex justify-between items-center p-2 bg-gray-800/50 rounded">
                    <span className="text-sm text-gray-400">Exercise {i + 1}</span>
                    <span className="text-xs text-gray-500">Volume data</span>
                  </div>
                ))}
              </div>
            </Card>
          </DashboardSection>

          {/* Performance Insights */}
          <DashboardSection span="half" title="Performance Insights">
            <Card className="p-4">
              <div className="flex items-center gap-4 mb-4">
                <Zap className="h-5 w-5 text-purple-400" />
                <span className="text-sm text-gray-400">Ready for AI insights</span>
              </div>
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
            </Card>
          </DashboardSection>
        </DashboardGrid>
      </div>
    </WorkoutErrorBoundary>
  );
};

export default OverviewPage;
