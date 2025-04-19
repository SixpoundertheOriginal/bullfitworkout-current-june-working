
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { WorkoutHistory } from "@/components/WorkoutHistory";
import { WorkoutSummary } from "@/components/workouts/WorkoutSummary";
import { WorkoutTypeChart } from "@/components/workouts/WorkoutTypeChart";
import { TopExercisesTable } from "@/components/workouts/TopExercisesTable";
import { WorkoutCalendarTab } from "@/components/workouts/WorkoutCalendarTab";
import { Calendar } from "lucide-react";

const Training = () => {
  return (
    <div className="container max-w-7xl mx-auto p-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Training</h1>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="bg-gray-900 border-gray-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            History
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <WorkoutSummary />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <WorkoutTypeChart />
            <TopExercisesTable />
          </div>
        </TabsContent>

        <TabsContent value="history">
          <WorkoutHistory className="mt-4" />
        </TabsContent>

        <TabsContent value="calendar">
          <WorkoutCalendarTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Training;
