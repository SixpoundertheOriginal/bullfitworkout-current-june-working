
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWorkoutStats } from "@/hooks/useWorkoutStats";
import { CalendarDays, TrendingUp, Calendar } from "lucide-react";
import { 
  format,
  eachDayOfInterval,
  isSameDay,
  isWithinInterval
} from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useDateRange, TimeRange } from "@/context/DateRangeContext";
import { DateRangePicker } from "@/components/ui/date-range-picker";

interface WeeklyTrainingPatternsProps {
  className?: string;
}

export const WeeklyTrainingPatterns = ({ className }: WeeklyTrainingPatternsProps) => {
  const { timeRange, setTimeRange, customDateRange, setCustomDateRange, dateRange, getFormattedDateRangeText } = useDateRange();
  const { stats, loading, refetch } = useWorkoutStats();
  
  // Filter workouts based on date range
  const filterWorkoutsByDateRange = (workouts: any[] = []) => {
    return workouts.filter(workout => {
      const workoutDate = new Date(workout.start_time);
      return isWithinInterval(workoutDate, { start: dateRange.start, end: dateRange.end });
    });
  };
  
  // Prepare data for Weekly Frequency chart using date range
  const prepareWeeklyFrequencyData = () => {
    // Use Monday as first day of week to align with the date range context
    // Order days from Monday to Sunday
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    
    // Initialize counts for each day of week
    const dayCounts = daysOfWeek.map(day => ({
      name: day.substring(0, 3), // Abbreviate the day names
      count: 0
    }));
    
    // Get raw workout data
    const rawWorkouts = stats?.workouts || [];
    const filteredWorkouts = filterWorkoutsByDateRange(rawWorkouts);
    
    // Count workouts for each day of the week in the range
    filteredWorkouts.forEach(workout => {
      const workoutDate = new Date(workout.start_time);
      let dayIndex = workoutDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Convert to Monday-based index (0 = Monday, 6 = Sunday)
      dayIndex = dayIndex === 0 ? 6 : dayIndex - 1;
      
      if (dayIndex >= 0 && dayIndex < 7) {
        dayCounts[dayIndex].count += 1;
      }
    });
    
    return dayCounts;
  };
  
  // Prepare data for trend chart based on selected timeframe
  const prepareTrendData = () => {
    // Get raw workout data
    const rawWorkouts = stats?.workouts || [];
    const filteredWorkouts = filterWorkoutsByDateRange(rawWorkouts);
    
    // For daily view, show a data point for each day in the range
    const days = eachDayOfInterval({ start: dateRange.start, end: dateRange.end });
    
    return days.map(day => {
      // Count workouts for this specific day
      const workoutsOnDay = filteredWorkouts.filter(workout => 
        isSameDay(new Date(workout.start_time), day)
      ).length;
      
      return {
        date: format(day, 'EEE'),
        fullDate: format(day, 'MMM dd'),
        workouts: workoutsOnDay
      };
    });
  };

  const frequencyData = prepareWeeklyFrequencyData();
  const trendData = prepareTrendData();
  
  const calculateConsistencyScore = () => {
    // Get the total number of days in the range
    const daysInRange = eachDayOfInterval({ start: dateRange.start, end: dateRange.end }).length;
    
    // Get unique workout days in the range
    const rawWorkouts = stats?.workouts || [];
    const filteredWorkouts = filterWorkoutsByDateRange(rawWorkouts);
    
    // Get unique workout dates
    const uniqueWorkoutDays = new Set(
      filteredWorkouts.map(workout => 
        format(new Date(workout.start_time), 'yyyy-MM-dd')
      )
    );
    
    // Calculate consistency score
    const uniqueWorkoutDaysCount = uniqueWorkoutDays.size;
    return daysInRange > 0 ? (uniqueWorkoutDaysCount / daysInRange) * 100 : 0;
  };
  
  const consistencyScore = calculateConsistencyScore();
  
  // Handle timeframe change
  const handleTimeframeChange = (value: string) => {
    setTimeRange(value as TimeRange);
    // If switching from custom to another timeframe, refresh stats
    if (timeRange === 'custom' && value !== 'custom') {
      refetch();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <CalendarDays className="mr-2 h-5 w-5 text-purple-400" />
          Training Patterns
        </h3>
        <div className="flex items-center space-x-2">
          <Select
            value={timeRange}
            onValueChange={handleTimeframeChange}
          >
            <SelectTrigger className="w-[160px] bg-gray-900 border-gray-800">
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
                  <Calendar className="mr-2 h-4 w-4" />
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
      
      <div className="text-sm text-gray-400">
        {getFormattedDateRangeText()}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Weekly Frequency</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={frequencyData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151" }}
                    itemStyle={{ color: "#e5e7eb" }}
                    formatter={(value) => [`${value} workouts`, "Count"]}
                    labelStyle={{ color: "#e5e7eb" }}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">
              <div className="flex items-center">
                <TrendingUp className="mr-2 h-4 w-4 text-purple-400" />
                Training Trend (Daily)
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <XAxis 
                    dataKey="date" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    domain={[0, 'auto']} 
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151" }}
                    itemStyle={{ color: "#e5e7eb" }}
                    formatter={(value) => [`${value} workouts`, "Count"]}
                    labelFormatter={(label, payload) => {
                      if (payload && payload.length > 0 && payload[0].payload) {
                        return payload[0].payload.fullDate;
                      }
                      return label;
                    }}
                    labelStyle={{ color: "#e5e7eb" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="workouts" 
                    stroke="#8b5cf6" 
                    strokeWidth={2} 
                    dot={{ r: 4, strokeWidth: 2 }} 
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-400">Workout Consistency</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Consistency Score</span>
                <span className="text-sm font-medium">{Math.round(consistencyScore)}%</span>
              </div>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-600 to-pink-600" 
                  style={{ width: `${Math.max(1, Math.min(100, consistencyScore))}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
