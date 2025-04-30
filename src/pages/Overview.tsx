
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkoutCalendarTab } from "@/components/workouts/WorkoutCalendarTab";
import { InsightsDashboard } from "@/components/workouts/InsightsDashboard";
import { WorkoutLogSection } from "@/components/workouts/WorkoutLogSection";
import { Button } from "@/components/ui/button";
import { Zap, BarChart3, CalendarDays, History } from "lucide-react";
import { useWorkoutStats } from "@/hooks/useWorkoutStats";
import { WeeklyTrainingPatterns } from "@/components/workouts/WeeklyTrainingPatterns";
import { QuickStatsSection } from "@/components/metrics/QuickStatsSection";
import { TonnageChart } from "@/components/metrics/TonnageChart";
import { useDateRange } from "@/context/DateRangeContext";
import { useBasicWorkoutStats } from "@/hooks/useBasicWorkoutStats";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  startOfWeek, 
  endOfWeek, 
  subWeeks,
  subDays,
  format 
} from "date-fns";
import { DateRange } from "react-day-picker";

interface TonnageData {
  date: string;
  tonnage: number;
}

type TimeRange = 'this-week' | 'previous-week' | 'last-30-days' | 'all-time' | 'custom';

export const OverviewPage = () => {
  const navigate = useNavigate();
  const [showWorkouts, setShowWorkouts] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Global time range state that will be used by all components
  const [timeRange, setTimeRange] = useState<TimeRange>('this-week');
  const [calculatedDateRange, setCalculatedDateRange] = useState<DateRange | undefined>();
  
  const { dateRange, setDateRange } = useDateRange();
  const { stats, loading: statsLoading, refetch } = useWorkoutStats();
  
  // Effect to calculate date range based on selected time range
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
    setDateRange(newDateRange);
  }, [timeRange, setDateRange]);
  
  // When the tab changes to history, ensure workouts are shown
  useEffect(() => {
    if (activeTab === "history") {
      setShowWorkouts(true);
    }
  }, [activeTab]);
  
  // Calculate tonnage data from exercise sets filtered by date range
  const tonnageData = React.useMemo<TonnageData[]>(() => {
    if (!stats?.workouts || stats.workouts.length === 0) return [];
    
    console.log("Computing tonnage data from workouts:", stats.workouts.length);
    
    // Filter workouts by date range if provided
    let filteredWorkouts = [...stats.workouts];
    
    if (calculatedDateRange?.from && calculatedDateRange?.to) {
      const fromDate = new Date(calculatedDateRange.from);
      const toDate = new Date(calculatedDateRange.to);
      toDate.setHours(23, 59, 59, 999); // End of day
      
      filteredWorkouts = filteredWorkouts.filter(workout => {
        const workoutDate = new Date(workout.start_time);
        return workoutDate >= fromDate && workoutDate <= toDate;
      });
    }
    
    console.log("Filtered workouts count:", filteredWorkouts.length);
    
    // Create a map to hold daily workout tonnage
    const workoutsByDate = new Map<string, TonnageData>();
    
    // Process each workout and its exercises
    filteredWorkouts.forEach(workout => {
      // Format date as YYYY-MM-DD to use as key
      const dateKey = new Date(workout.start_time).toISOString().split('T')[0];
      
      if (!workoutsByDate.has(dateKey)) {
        workoutsByDate.set(dateKey, {
          date: workout.start_time,
          tonnage: 0
        });
      }
      
      // Get exercise sets for this workout
      const sets = workout.exercises || [];
      
      // Calculate tonnage for this workout
      let workoutTonnage = 0;
      sets.forEach(set => {
        if (set.weight && set.reps && set.completed) {
          workoutTonnage += set.weight * set.reps;
        }
      });
      
      // Add to the daily total
      if (workoutTonnage > 0) {
        const currentData = workoutsByDate.get(dateKey);
        if (currentData) {
          workoutsByDate.set(dateKey, {
            ...currentData,
            tonnage: currentData.tonnage + workoutTonnage
          });
        }
      }
    });
    
    console.log("Tonnage data points calculated:", workoutsByDate.size);
    
    // Convert map to array and sort by date
    return Array.from(workoutsByDate.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [stats?.workouts, calculatedDateRange]);

  console.log("Final tonnage data calculated:", tonnageData);

  // Get date range text for display
  const getDateRangeText = () => {
    const now = new Date();
    
    switch (timeRange) {
      case 'this-week': {
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
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
      default:
        return "Select period";
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="flex justify-between items-center p-4 border-b border-gray-800">
        <h1 className="text-xl font-semibold">Overview</h1>
        <Button 
          onClick={() => navigate('/training-session')}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <Zap className="w-4 h-4 mr-2" />
          Start Workout
        </Button>
      </header>

      <main className="flex-1 overflow-auto p-4">
        <Tabs 
          defaultValue="overview" 
          className="w-full"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-3 bg-gray-900">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-4 space-y-6">
            {/* Global time period selector */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Overview</h3>
              <div className="flex items-center gap-2">
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
            </div>
            
            <div className="text-sm text-gray-400 -mt-4 mb-2">
              {getDateRangeText()}
            </div>
            
            <QuickStatsSection showDateRange={false} />
            <TonnageChart 
              data={tonnageData} 
              className="mt-4"
            />
            <WeeklyTrainingPatterns 
              externalTimeframe={timeRange as any} 
              externalDateRange={calculatedDateRange} 
              className="" 
            />
            <InsightsDashboard stats={stats} className="mb-8" />
          </TabsContent>
          
          <TabsContent value="calendar" className="mt-4">
            <WorkoutCalendarTab />
          </TabsContent>
          
          <TabsContent value="history" className="mt-4">
            <WorkoutLogSection 
              showWorkouts={showWorkouts} 
              onToggle={() => setShowWorkouts(!showWorkouts)} 
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default OverviewPage;
