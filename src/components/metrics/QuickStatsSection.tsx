
import React from 'react';
import { Calendar, BarChart3, Target } from 'lucide-react';
import { MetricCard } from "@/components/metrics/MetricCard";
import { useWorkoutStats } from "@/hooks/useWorkoutStats";
import { cn } from "@/lib/utils";

export const QuickStatsSection = () => {
  const { stats, loading } = useWorkoutStats(7); // Fetch last 7 days of workouts

  // Calculate weekly metrics
  const weeklyWorkouts = stats.totalWorkouts || 0;
  const weeklyVolume = stats.progressMetrics?.volumeChangePercentage || 0;
  const consistencyScore = stats.progressMetrics?.consistencyScore || 0;

  return (
    <div className="relative">
      {/* Background glow effects */}
      <div className="absolute -top-10 -left-20 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute -top-10 -right-20 w-60 h-60 bg-pink-600/10 rounded-full blur-3xl" />
      
      <div className={cn(
        "grid grid-cols-3 gap-3 sm:gap-5 mb-6 p-1",
        "relative z-10"
      )}>
        <MetricCard
          icon={Calendar}
          value={weeklyWorkouts}
          label="Workouts This Week"
          tooltip="Total workouts completed in the last 7 days"
          gradientClass="from-violet-600/20 via-black/5 to-violet-900/20 hover:from-violet-600/30 hover:to-violet-900/30"
          valueClass="text-violet-300 font-semibold bg-gradient-to-br from-violet-200 to-violet-400 bg-clip-text text-transparent"
        />
        
        <MetricCard
          icon={BarChart3}
          value={`${Math.abs(weeklyVolume).toFixed(0)}%`}
          label={weeklyVolume >= 0 ? "Volume Increase" : "Volume Decrease"}
          tooltip="Change in total volume compared to last week"
          gradientClass="from-blue-600/20 via-black/5 to-blue-900/20 hover:from-blue-600/30 hover:to-blue-900/30"
          valueClass="text-blue-300 font-semibold bg-gradient-to-br from-blue-200 to-blue-400 bg-clip-text text-transparent"
        />
        
        <MetricCard
          icon={Target}
          value={`${Math.round(consistencyScore)}%`}
          label="Goal Progress"
          tooltip="Overall progress towards your fitness goals"
          progressValue={consistencyScore}
          gradientClass="from-emerald-600/20 via-black/5 to-emerald-900/20 hover:from-emerald-600/30 hover:to-emerald-900/30"
          valueClass="text-emerald-300 font-semibold bg-gradient-to-br from-emerald-200 to-emerald-400 bg-clip-text text-transparent"
        />
      </div>
    </div>
  );
};
