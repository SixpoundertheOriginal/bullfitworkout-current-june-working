
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

interface TonnageData {
  date: string;
  tonnage: number;
}

export const OverviewPage = () => {
  const navigate = useNavigate();
  const [showWorkouts, setShowWorkouts] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { dateRange } = useDateRange();
  const { stats, loading: statsLoading } = useWorkoutStats();
  const { data: basicStats, isLoading: basicStatsLoading } = useBasicWorkoutStats(dateRange);
  
  useEffect(() => {
    if (activeTab === "history") {
      setShowWorkouts(true);
    }
  }, [activeTab]);
  
  // Calculate tonnage data from exercise sets filtered by date range
  const tonnageData = React.useMemo<TonnageData[]>(() => {
    if (!stats?.workouts) return [];
    
    // Filter workouts by date range if provided
    let filteredWorkouts = [...stats.workouts];
    
    if (dateRange?.from && dateRange?.to) {
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999); // End of day
      
      filteredWorkouts = filteredWorkouts.filter(workout => {
        const workoutDate = new Date(workout.start_time);
        return workoutDate >= fromDate && workoutDate <= toDate;
      });
    }
    
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
      const workoutSets = workout.exercises || [];
      
      // Calculate tonnage for this workout
      let workoutTonnage = 0;
      workoutSets.forEach(exercise => {
        if (exercise.weight && exercise.reps) {
          workoutTonnage += exercise.weight * exercise.reps;
        }
      });
      
      // Add to the daily total
      const currentData = workoutsByDate.get(dateKey);
      if (currentData) {
        workoutsByDate.set(dateKey, {
          ...currentData,
          tonnage: currentData.tonnage + workoutTonnage
        });
      }
    });
    
    // Convert map to array and sort by date
    return Array.from(workoutsByDate.values())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [stats?.workouts, dateRange]);

  console.log("Tonnage data calculated:", tonnageData);

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
            <QuickStatsSection showDateRange={true} />
            <TonnageChart 
              data={tonnageData} 
              className="mt-4"
            />
            <WeeklyTrainingPatterns />
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
