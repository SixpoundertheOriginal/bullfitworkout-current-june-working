
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dumbbell, 
  Calendar, 
  Timer, 
  Flame
} from "lucide-react";
import { useWorkoutStatsContext } from "@/context/WorkoutStatsProvider";
import { WorkoutTypeChart } from "@/components/metrics/WorkoutTypeChart";
import { StatCard } from "@/components/metrics/StatCard";
import StatsLoadingSkeleton from "@/components/metrics/StatsLoadingSkeleton";
import { usePerformanceTracking } from "@/hooks/usePerformanceTracking";

const UserStatsComponent = () => {
  const { stats, loading, error } = useWorkoutStatsContext();
  
  // Track component performance
  usePerformanceTracking({ 
    componentName: 'UserStats',
    trackRenders: true,
    trackMemory: true 
  });
  
  // Format time (seconds) to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Show loading state
  if (loading) {
    return <StatsLoadingSkeleton />;
  }

  // Show error state
  if (error) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6 text-center">
          <div className="text-red-400 mb-2">Error loading stats</div>
          <p className="text-gray-400 text-sm">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  const emptyStats = !stats || stats.totalWorkouts === 0;

  // Prepare data for WorkoutTypeChart with better error handling
  const workoutTypeData = React.useMemo(() => {
    return stats?.workoutTypes?.map(type => ({
      type: type.type,
      count: type.count,
      totalDuration: 0,
      percentage: type.percentage,
      timeOfDay: {
        morning: 0,
        afternoon: 0,
        evening: 0,
        night: 0
      },
      averageDuration: 0
    })) || [];
  }, [stats?.workoutTypes]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Your Fitness Stats</h2>
      
      {emptyStats ? (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-6 text-center">
            <Dumbbell className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No Workout Data Yet</h3>
            <p className="text-gray-400">
              Complete your first workout to see your fitness statistics here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Key metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard 
              icon={<Calendar className="h-5 w-5 text-purple-400" />}
              label="Total Workouts"
              value={stats.totalWorkouts.toString()}
            />
            <StatCard 
              icon={<Dumbbell className="h-5 w-5 text-purple-400" />}
              label="Total Sets"
              value={stats.totalSets.toString()}
            />
            <StatCard 
              icon={<Timer className="h-5 w-5 text-purple-400" />}
              label="Avg. Duration"
              value={formatTime(stats.avgDuration)}
            />
            <StatCard 
              icon={<Flame className="h-5 w-5 text-purple-400" />}
              label="Total Volume"
              value={`${Math.round(stats.totalVolume || 0).toLocaleString()}`}
            />
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Workout types distribution */}
            <WorkoutTypeChart workoutTypes={workoutTypeData} />
            
            {/* Recent workouts */}
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Recent Workouts</h3>
                <div className="space-y-3">
                  {stats.workouts.slice(0, 5).map((workout) => (
                    <div key={workout.id} className="flex items-center justify-between p-2 rounded bg-gray-800">
                      <div>
                        <div className="font-medium text-white">{workout.name}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-2">
                          <span>{new Date(workout.start_time).toLocaleDateString()}</span>
                          {workout.training_type && (
                            <span className="px-2 py-0.5 bg-gray-700 rounded-full text-xs">
                              {workout.training_type}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-300">
                          {formatTime(workout.duration)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export const UserStats = React.memo(UserStatsComponent);
