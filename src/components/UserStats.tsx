
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { 
  Dumbbell, 
  Calendar, 
  Timer, 
  TrendingUp,
  Award,
  Target,
  Flame
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface WorkoutSummary {
  totalWorkouts: number;
  totalDuration: number;
  averageDuration: number;
  workoutsByType: { name: string; value: number; }[];
  recentWorkouts: any[];
  totalSets: number;
}

const WORKOUT_TYPE_COLORS = [
  "#9B87F5",
  "#D946EF",
  "#8B5CF6",
  "#6366F1",
  "#4F46E5",
  "#7E69AB"
];

export function UserStats() {
  const { user } = useAuth();
  
  const { data: stats, isLoading } = useQuery({
    queryKey: ["user-stats", user?.id],
    queryFn: async (): Promise<WorkoutSummary> => {
      if (!user) throw new Error("User not authenticated");
      
      // Fetch workout sessions
      const { data: workoutSessions, error } = await supabase
        .from("workout_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
        
      if (error) throw error;
      
      // Group by training type
      const typeCount: Record<string, number> = {};
      workoutSessions?.forEach(session => {
        typeCount[session.training_type] = (typeCount[session.training_type] || 0) + 1;
      });
      
      const workoutsByType = Object.entries(typeCount).map(([name, value]) => ({
        name,
        value
      }));
      
      // Get total sets
      const { data: totalSetsData, error: setsError } = await supabase
        .from("exercise_sets")
        .select("id")
        .in("workout_id", workoutSessions?.map(w => w.id) || []);
        
      if (setsError) throw setsError;
      
      // Calculate stats
      const totalWorkouts = workoutSessions?.length || 0;
      const totalDuration = workoutSessions?.reduce((sum, w) => sum + (w.duration || 0), 0) || 0;
      const averageDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;
      
      return {
        totalWorkouts,
        totalDuration,
        averageDuration,
        workoutsByType,
        recentWorkouts: workoutSessions?.slice(0, 5) || [],
        totalSets: totalSetsData?.length || 0
      };
    },
    enabled: !!user
  });
  
  // Format time (seconds) to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return <StatsLoadingSkeleton />;
  }

  const emptyStats = !stats || stats.totalWorkouts === 0;

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
              value={formatTime(stats.averageDuration)}
            />
            <StatCard 
              icon={<Flame className="h-5 w-5 text-purple-400" />}
              label="Total Time"
              value={`${Math.floor(stats.totalDuration / 60)} min`}
            />
          </div>
          
          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Workout types distribution */}
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Workout Type Distribution</h3>
                <div className="h-[200px]">
                  {stats.workoutsByType.length > 0 ? (
                    <ChartContainer
                      config={stats.workoutsByType.reduce((config, _, i) => ({
                        ...config,
                        [`color${i}`]: { theme: { dark: WORKOUT_TYPE_COLORS[i % WORKOUT_TYPE_COLORS.length] } }
                      }), {})}
                    >
                      <PieChart>
                        <Pie
                          data={stats.workoutsByType}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => 
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {stats.workoutsByType.map((_, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={`var(--color-color${index})`} 
                            />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ChartContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No workout type data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Recent workouts */}
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-gray-400 mb-4">Recent Workouts</h3>
                <div className="space-y-3">
                  {stats.recentWorkouts.map((workout) => (
                    <div key={workout.id} className="flex items-center justify-between p-2 rounded bg-gray-800">
                      <div>
                        <div className="font-medium text-white">{workout.name}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(workout.start_time).toLocaleDateString()}
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
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardContent className="p-4">
        <div className="flex flex-col items-center text-center">
          <div className="mb-2">{icon}</div>
          <div className="text-xl font-semibold text-white">{value}</div>
          <div className="text-xs text-gray-400">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatsLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-white">Your Fitness Stats</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="bg-gray-900 border-gray-800">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <Skeleton className="h-5 w-5 rounded-full bg-gray-800 mb-2" />
                <Skeleton className="h-7 w-14 bg-gray-800 mb-1" />
                <Skeleton className="h-4 w-16 bg-gray-800" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <Skeleton className="h-5 w-40 bg-gray-800 mb-4" />
            <Skeleton className="h-[200px] w-full bg-gray-800 rounded-lg" />
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <Skeleton className="h-5 w-40 bg-gray-800 mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full bg-gray-800 rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
