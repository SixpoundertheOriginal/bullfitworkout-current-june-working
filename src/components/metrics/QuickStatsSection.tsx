
import React from 'react';
import { Card } from "@/components/ui/card";
import { Calendar, BarChart3, Target } from 'lucide-react';
import { MetricCard } from "@/components/metrics/MetricCard";
import { useWorkoutStats } from "@/hooks/useWorkoutStats";

export const QuickStatsSection = () => {
  const { stats, loading } = useWorkoutStats(7); // Fetch last 7 days of workouts

  // Calculate weekly metrics
  const weeklyWorkouts = stats.totalWorkouts || 0;
  const weeklyVolume = stats.progressMetrics?.volumeChangePercentage || 0;
  const consistencyScore = stats.progressMetrics?.consistencyScore || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <MetricCard
        icon={Calendar}
        value={weeklyWorkouts}
        label="Workouts This Week"
        tooltip="Total workouts completed in the last 7 days"
        gradientClass="from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30"
        valueClass="text-purple-400"
      />
      
      <MetricCard
        icon={BarChart3}
        value={`${Math.abs(weeklyVolume).toFixed(0)}%`}
        label={weeklyVolume >= 0 ? "Volume Increase" : "Volume Decrease"}
        tooltip="Change in total volume compared to last week"
        gradientClass="from-blue-600/20 to-cyan-600/20 hover:from-blue-600/30 hover:to-cyan-600/30"
        valueClass="text-blue-400"
      />
      
      <MetricCard
        icon={Target}
        value={`${Math.round(consistencyScore)}%`}
        label="Goal Progress"
        tooltip="Overall progress towards your fitness goals"
        progressValue={consistencyScore}
        gradientClass="from-green-600/20 to-emerald-600/20 hover:from-green-600/30 hover:to-emerald-600/30"
        valueClass="text-green-400"
      />
    </div>
  );
};
