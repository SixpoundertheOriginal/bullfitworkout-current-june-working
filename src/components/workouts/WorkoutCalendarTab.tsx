
import React from "react";
import { WorkoutCalendar } from "@/components/workouts/WorkoutCalendar";
import { Card } from "@/components/ui/card";

export const WorkoutCalendarTab = () => {
  return (
    <div className="space-y-4">
      <Card className="p-4 bg-gray-900/50 border-gray-800">
        <WorkoutCalendar />
      </Card>
    </div>
  );
};
