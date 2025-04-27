
import React, { useState } from "react";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { Button } from "@/components/ui/button";
import { TabsList, TabsTrigger, Tabs, TabsContent } from "@/components/ui/tabs";
import { Search, Filter, Calendar, BarChart3 } from "lucide-react";
import { WorkoutCard } from "@/components/WorkoutCard";
import { WorkoutLogSection } from "@/components/workouts/WorkoutLogSection";
import { WorkoutCalendarTab } from "@/components/workouts/WorkoutCalendarTab";

export const WorkoutManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showWorkouts, setShowWorkouts] = useState(true);
  
  const handleToggleWorkouts = () => {
    setShowWorkouts(prev => !prev);
  };
  
  return (
    <div className="min-h-screen bg-black text-white pb-16">
      <header className="sticky top-0 z-10 bg-black/95 backdrop-blur-sm border-b border-gray-800 p-4">
        <h1 className="text-xl font-semibold">Workout Management</h1>
        
        <div className="mt-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search workouts..."
              className="w-full bg-gray-900 border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="p-4">
        <Tabs defaultValue="list" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 bg-gray-900">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              List
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Archived
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="mt-4">
            <WorkoutLogSection 
              showWorkouts={showWorkouts} 
              onToggle={handleToggleWorkouts}
            />
          </TabsContent>

          <TabsContent value="calendar" className="mt-4">
            <WorkoutCalendarTab />
          </TabsContent>

          <TabsContent value="archived" className="mt-4">
            <div className="text-center text-gray-500 py-8">
              No archived workouts
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default WorkoutManagementPage;
