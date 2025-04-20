
import React from "react";
import { WorkoutCalendar } from "@/components/workouts/WorkoutCalendar";

export const WorkoutCalendarTab = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mb-4">Workout Calendar</h2>
      <WorkoutCalendar />
    </div>
  );
};
