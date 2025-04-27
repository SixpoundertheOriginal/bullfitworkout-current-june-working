
import React, { useState, useEffect } from 'react';
import { Calendar, BarChart3, Target } from 'lucide-react';
import { MetricCard } from "@/components/metrics/MetricCard";
import { useBasicWorkoutStats } from "@/hooks/useBasicWorkoutStats";
import { cn } from "@/lib/utils";
import { format, startOfWeek, endOfWeek, subWeeks, subDays, addDays } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRange } from 'react-day-picker';
import { useDateRange } from '@/context/DateRangeContext';

type TimeRange = 'this-week' | 'previous-week' | 'last-30-days' | 'all-time';

interface QuickStatsSectionProps {
  showDateRange?: boolean;
}

export const QuickStatsSection = ({ showDateRange = false }: QuickStatsSectionProps) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('this-week');
  const [calculatedDateRange, setCalculatedDateRange] = useState<DateRange | undefined>();
  
  // Only use the DateRange context when showDateRange is true
  const dateRangeContext = showDateRange ? useDateRange() : null;
  
  // Update date range when time range changes
  useEffect(() => {
    const now = new Date();
    let newDateRange: DateRange | undefined;
    
    switch (timeRange) {
      case 'this-week': {
        const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday as start of week
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Sunday as end of week
        newDateRange = { from: weekStart, to: weekEnd };
        break;
      }
      case 'previous-week': {
        const previousWeekStart = subWeeks(startOfWeek(now, { weekStartsOn: 1 }), 1);
        const previousWeekEnd = subWeeks(endOfWeek(now, { weekStartsOn: 1 }), 1);
        newDateRange = { from: previousWeekStart, to: previousWeekEnd };
        break;
      }
      case 'last-30-days': {
        newDateRange = { from: subDays(now, 30), to: now };
        break;
      }
      case 'all-time': {
        newDateRange = undefined; // No date range filter for all-time
        break;
      }
    }
    
    setCalculatedDateRange(newDateRange);
    if (dateRangeContext?.setDateRange && showDateRange) {
      dateRangeContext.setDateRange(newDateRange);
    }
  }, [timeRange, dateRangeContext, showDateRange]);

  const { data: stats, isLoading } = useBasicWorkoutStats(calculatedDateRange);

  // Calculate date range text based on selected time range
  const getDateRangeText = () => {
    const now = new Date();
    
    switch (timeRange) {
      case 'this-week': {
        const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday as start of week
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
        return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
      }
      case 'previous-week': {
        const previousWeekStart = subWeeks(startOfWeek(now, { weekStartsOn: 1 }), 1);
        const previousWeekEnd = subWeeks(endOfWeek(now, { weekStartsOn: 1 }), 1);
        return `${format(previousWeekStart, "MMM d")} - ${format(previousWeekEnd, "MMM d, yyyy")}`;
      }
      case 'last-30-days':
        return `${format(subDays(now, 30), "MMM d")} - ${format(now, "MMM d, yyyy")}`;
      case 'all-time':
        return "All time";
    }
  };

  // Get the most active day of the week
  const getMostActiveDay = () => {
    if (!stats?.dailyWorkouts) return null;
    
    let maxCount = 0;
    let mostActiveDay = '';
    
    Object.entries(stats.dailyWorkouts).forEach(([day, count]) => {
      if (count > maxCount) {
        maxCount = count;
        mostActiveDay = day;
      }
    });
    
    return mostActiveDay ? `${mostActiveDay.charAt(0).toUpperCase() + mostActiveDay.slice(1)} (${maxCount})` : null;
  };

  const mostActiveDay = getMostActiveDay();
  const dateRangeText = getDateRangeText();

  return (
    <div className="relative">
      {/* Background glow effects */}
      <div className="absolute -top-10 -left-20 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute -top-10 -right-20 w-60 h-60 bg-pink-600/10 rounded-full blur-3xl" />
      
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Quick Stats</h3>
        <Select
          value={timeRange}
          onValueChange={(value) => setTimeRange(value as TimeRange)}
        >
          <SelectTrigger className="w-[140px] bg-gray-900 border-gray-800">
            <SelectValue placeholder="Time period" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-800">
            <SelectItem value="this-week">This Week</SelectItem>
            <SelectItem value="previous-week">Previous Week</SelectItem>
            <SelectItem value="last-30-days">Last 30 Days</SelectItem>
            <SelectItem value="all-time">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Use glass/card-gradient for light/dark */}
      <div className={cn(
        "grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5 mb-6 p-1",
        "relative z-10",
        "card-gradient"
      )}>
        <MetricCard
          icon={Calendar}
          value={isLoading ? "..." : stats?.weeklyWorkouts?.toString() || "0"}
          label={timeRange === 'all-time' ? 'Total Workouts' : 'Workouts'}
          description={dateRangeText}
          tooltip={`Workouts completed in the selected time period`}
          gradientClass="from-violet-600/20 via-black/5 to-violet-900/20 hover:from-violet-600/30 hover:to-violet-900/30"
          valueClass="text-violet-300 font-semibold bg-gradient-to-br from-violet-200 to-violet-400 bg-clip-text text-transparent"
        />
        
        <MetricCard
          icon={BarChart3}
          value={isLoading ? "..." : mostActiveDay || "None"}
          label="Most Active Day"
          tooltip="Day with the most workouts in this period"
          gradientClass="from-blue-600/20 via-black/5 to-blue-900/20 hover:from-blue-600/30 hover:to-blue-900/30"
          valueClass="text-blue-300 font-semibold bg-gradient-to-br from-blue-200 to-blue-400 bg-clip-text text-transparent"
        />
        
        <MetricCard
          icon={Target}
          value={isLoading ? "..." : `${Math.round(stats?.weeklyVolume || 0).toLocaleString()}`}
          label={timeRange === 'all-time' ? 'Total Volume' : 'Period Volume'}
          tooltip="Total weight lifted (reps × weight) in this period"
          progressValue={stats?.weeklyVolume ? Math.min(100, stats.weeklyVolume / 1000) : 0}
          gradientClass="from-emerald-600/20 via-black/5 to-emerald-900/20 hover:from-emerald-600/30 hover:to-emerald-900/30"
          valueClass="text-emerald-300 font-semibold bg-gradient-to-br from-emerald-200 to-emerald-400 bg-clip-text text-transparent"
        />
      </div>
    </div>
  );
};
