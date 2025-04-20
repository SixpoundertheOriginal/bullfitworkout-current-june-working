
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
      console.log(`URL changed, updating tab from ${activeTab} to ${tabFromURL}`);
      setActiveTab(tabFromURL);
    }
  }, [location.search]);
  
  // Get date filter from URL
  const getDateFilterFromURL = () => {
    const params = new URLSearchParams(location.search);
    return params.get('date');
  };

  return (
    <div className="container max-w-7xl mx-auto p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Training</h1>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={handleTabChange} 
        className="space-y-4"
      >
        <TabsList className="bg-gray-900 border-gray-800 grid grid-cols-3">
          <TabsTrigger 
            value="overview"
            className="flex items-center gap-2 data-[state=active]:bg-purple-600"
          >
            <Sparkles className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="calendar" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-600"
          >
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger 
            value="history" 
            className="flex items-center gap-2 data-[state=active]:bg-purple-600"
          >
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
          ) : (
            <>
              <WorkoutSummary stats={stats} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <WorkoutTypeChart data={stats.workoutTypes} />
                <TopExercisesTable exercises={stats.topExercises} />
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <WorkoutCalendarTab />
        </TabsContent>

        <TabsContent value="history">
          <WorkoutHistory 
            className="mt-4" 
            dateFilter={getDateFilterFromURL()}
            limit={20}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Training;
