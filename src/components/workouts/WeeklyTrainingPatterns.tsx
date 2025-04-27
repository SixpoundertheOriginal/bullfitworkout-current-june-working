
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useWorkoutStats } from "@/hooks/useWorkoutStats";
import { CalendarDays, TrendingUp } from "lucide-react";
import { format, subDays, subMonths, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";

interface WeeklyTrainingPatternsProps {
  className?: string;
}

export const WeeklyTrainingPatterns = ({ className }: WeeklyTrainingPatternsProps) => {
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');
  const { stats, loading } = useWorkoutStats();
  
  // Prepare data for Weekly Frequency chart
  const prepareWeeklyFrequencyData = () => {
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    
    // Initialize counts with all days at zero
    const dayCounts = daysOfWeek.map(day => ({
      name: day.substring(0, 3), // Abbreviate the day names
      count: 0
    }));
    
    // If we have workout data, populate real counts
    if (stats?.timePatterns?.daysFrequency) {
      Object.entries(stats.timePatterns.daysFrequency).forEach(([day, count]) => {
        const index = daysOfWeek.findIndex(d => d.toLowerCase() === day.toLowerCase());
        if (index !== -1) {
          dayCounts[index].count = count;
        }
      });
    }
    
    return dayCounts;
  };
  
  // Prepare data for trend chart based on selected timeframe
  const prepareTrendData = () => {
    const today = new Date();
    let startDate: Date;
    let interval: string;
    
    switch(timeframe) {
      case 'year':
        startDate = subMonths(today, 12);
        interval = 'month';
        break;
      case 'month':
        startDate = subDays(today, 30);
        interval = 'week';
        break;
      case 'week':
      default:
        startDate = subDays(today, 7);
        interval = 'day';
        break;
    }
    
    // For simplicity, generate mock data for the trend
    // In a real implementation, you would query actual workout data for these dates
    if (timeframe === 'week') {
      // For week view, show each day of the past week
      const days = eachDayOfInterval({
        start: startDate,
        end: today
      });
      
      return days.map(day => ({
        date: format(day, 'EEE'),
        workouts: Math.floor(Math.random() * 2) // Random 0 or 1 workouts per day for demo
      }));
    } else if (timeframe === 'month') {
      // For month view, aggregate by week
      const weeks = [];
      for (let i = 0; i < 4; i++) {
        const weekStart = subDays(today, (i + 1) * 7);
        weeks.push({
          date: `Week ${4-i}`,
          workouts: stats?.totalWorkouts ? Math.max(0, Math.floor(stats.totalWorkouts / 4) - i + Math.floor(Math.random() * 2)) : 0
        });
      }
      return weeks.reverse();
    } else {
      // For year view, aggregate by month
      const months = [];
      for (let i = 0; i < 12; i++) {
        const monthDate = subMonths(today, i);
        months.push({
          date: format(monthDate, 'MMM'),
          workouts: stats?.totalWorkouts ? Math.max(0, Math.floor(stats.totalWorkouts / 12) - i/3 + Math.floor(Math.random() * 3)) : 0
        });
      }
      return months.reverse();
    }
  };

  const frequencyData = prepareWeeklyFrequencyData();
  const trendData = prepareTrendData();
  
  const calculateConsistencyScore = () => {
    // This would ideally be calculated from actual workout data
    // For now, use the consistency score from stats if available
    return stats?.progressMetrics?.consistencyScore || 0;
  };
  
  const consistencyScore = calculateConsistencyScore();

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center">
          <CalendarDays className="mr-2 h-5 w-5 text-purple-400" />
          Training Patterns
        </h3>
        <Select
          defaultValue={timeframe}
          onValueChange={(value) => setTimeframe(value as 'week' | 'month' | 'year')}
        >
          <SelectTrigger className="w-[120px] bg-gray-900 border-gray-800">
            <SelectValue placeholder="Time period" />
          </SelectTrigger>
          <SelectContent className="bg-gray-900 border-gray-800">
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
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
                Training Trend ({timeframe === 'week' ? 'Daily' : timeframe === 'month' ? 'Weekly' : 'Monthly'})
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                  <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151" }}
                    itemStyle={{ color: "#e5e7eb" }}
                    formatter={(value) => [`${value} workouts`, "Count"]}
                    labelStyle={{ color: "#e5e7eb" }}
                  />
                  <Line type="monotone" dataKey="workouts" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4, strokeWidth: 2 }} />
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
                  style={{ width: `${consistencyScore}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
