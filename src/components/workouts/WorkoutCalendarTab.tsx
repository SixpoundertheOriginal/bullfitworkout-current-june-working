
import React from "react";
import { WorkoutCalendar } from "@/components/workouts/WorkoutCalendar";
import { Card } from "@/components/ui/card";

export const WorkoutCalendarTab = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mb-4">Workout Calendar</h2>
      <Card className="bg-gray-900/50 border-gray-800">
        <WorkoutCalendar />
      </Card>
    </div>
  );
};
