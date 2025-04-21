
import React, { useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { WorkoutHistory } from "@/components/WorkoutHistory";
import { WorkoutSummary } from "@/components/workouts/WorkoutSummary";
import { WorkoutTypeChart } from "@/components/workouts/WorkoutTypeChart";
import { TopExercisesTable } from "@/components/workouts/TopExercisesTable";
import { WorkoutCalendarTab } from "@/components/workouts/WorkoutCalendarTab";
import { Calendar, Loader2, History, Sparkles } from "lucide-react";
import { useWorkoutStats } from "@/hooks/useWorkoutStats";
import { useLocation, useNavigate } from "react-router-dom";
import { InsightsDashboard } from "@/components/workouts/InsightsDashboard";

// Main dashboard page for analytics & insights
const Training = () => {
  // Fetch workout stats using the hook
  const { stats, loading } = useWorkoutStats();
  const location = useLocation();
  const navigate = useNavigate();

  // Get tab from URL query parameter or default to overview
  const getTabFromURL = () => {
    const params = new URLSearchParams(location.search);
    return params.get('tab') || "overview";
  };

  const [activeTab, setActiveTab] = React.useState(getTabFromURL());

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);

    // If changing to a tab other than history with date filter, remove the date filter
    if (value !== 'history') {
      navigate(`/training?tab=${value}`, { replace: true });
    } else {
      // Preserve date parameter if present when switching to history tab
      const params = new URLSearchParams(location.search);
      const dateParam = params.get('date');
      if (dateParam) {
        navigate(`/training?tab=history&date=${dateParam}`, { replace: true });
      } else {
        navigate(`/training?tab=${value}`, { replace: true });
      }
    }
  };

  // Update active tab state if URL changes
  useEffect(() => {
    const tabFromURL = getTabFromURL();
    if (tabFromURL !== activeTab) {
      setActiveTab(tabFromURL);
    }
  }, [location.search]);

  // Get date filter from URL
  const getDateFilterFromURL = () => {
    const params = new URLSearchParams(location.search);
    return params.get('date');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container max-w-7xl mx-auto p-4 pb-20 bg-background">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-foreground">Training</h1>
        </div>

        <Tabs 
          value={activeTab} 
          onValueChange={handleTabChange} 
          className="space-y-4"
        >
          <TabsList className="bg-gray-900 border border-gray-800 grid grid-cols-3">
            <TabsTrigger 
              value="overview"
              className="flex items-center gap-2 data-[state=active]:bg-purple-600 text-white"
            >
              <Sparkles className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="calendar" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-600 text-gray-300 hover:text-white"
            >
              <Calendar className="h-4 w-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="flex items-center gap-2 data-[state=active]:bg-purple-600 text-gray-300 hover:text-white"
            >
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            ) : (
              // Make analytics/insights the central dashboard
              <div className="flex flex-col gap-6">
                {/* MAIN DASHBOARD INSIGHTS */}
                <InsightsDashboard stats={stats} className="bg-gray-900/80 rounded-lg p-4" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <WorkoutSummary 
                    stats={stats} 
                    className="bg-gray-900/80 rounded-lg p-4" 
                  />

                  <div className="flex flex-col gap-4">
                    <WorkoutTypeChart data={stats.workoutTypes} className="bg-gray-900/80 rounded-lg p-4" />
                    <TopExercisesTable 
                      exercises={stats.topExercises} 
                      className="bg-gray-900/80 rounded-lg p-4" 
                    />
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="calendar" className="bg-gray-900/80 rounded-lg p-4">
            <WorkoutCalendarTab />
          </TabsContent>

          <TabsContent value="history" className="mt-4 bg-gray-900/80 rounded-lg p-4">
            <WorkoutHistory 
              dateFilter={getDateFilterFromURL()}
              limit={20}
              className="text-white"
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Training;
