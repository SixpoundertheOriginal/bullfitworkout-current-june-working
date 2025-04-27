
import React from 'react';
import { Calendar, BarChart3, Target } from 'lucide-react';
import { MetricCard } from "@/components/metrics/MetricCard";
import { useBasicWorkoutStats } from "@/hooks/useBasicWorkoutStats";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDateRange, TimeRange } from '@/context/DateRangeContext';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRangePicker } from "@/components/ui/date-range-picker";

export const QuickStatsSection = () => {
  const { timeRange, setTimeRange, customDateRange, setCustomDateRange, getFormattedDateRangeText } = useDateRange();
  const { data: stats, isLoading } = useBasicWorkoutStats();

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
  const dateRangeText = getFormattedDateRangeText();

  return (
    <div className="relative">
      {/* Background glow effects */}
      <div className="absolute -top-10 -left-20 w-60 h-60 bg-purple-600/10 rounded-full blur-3xl" />
      <div className="absolute -top-10 -right-20 w-60 h-60 bg-pink-600/10 rounded-full blur-3xl" />
      
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Quick Stats</h3>
        <div className="flex items-center space-x-2">
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
              <SelectItem value="last-90-days">Last 90 Days</SelectItem>
              <SelectItem value="custom">Custom Range</SelectItem>
            </SelectContent>
          </Select>
          
          {timeRange === 'custom' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="bg-gray-900 border-gray-800">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  Select Dates
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <DateRangePicker
                  value={customDateRange}
                  onChange={setCustomDateRange}
                />
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
      
      <div className="text-sm text-gray-400 mb-3">
        {dateRangeText}
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
          label="Workouts"
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
          label="Period Volume"
          tooltip="Total weight lifted (reps × weight) in this period"
          progressValue={stats?.weeklyVolume ? Math.min(100, stats.weeklyVolume / 1000) : 0}
          gradientClass="from-emerald-600/20 via-black/5 to-emerald-900/20 hover:from-emerald-600/30 hover:to-emerald-900/30"
          valueClass="text-emerald-300 font-semibold bg-gradient-to-br from-emerald-200 to-emerald-400 bg-clip-text text-transparent"
        />
      </div>
    </div>
  );
};
