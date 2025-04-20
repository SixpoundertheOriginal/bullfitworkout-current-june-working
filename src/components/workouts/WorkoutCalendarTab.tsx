
import React from "react";
import { WorkoutCalendar } from "@/components/workouts/WorkoutCalendar";

export const WorkoutCalendarTab = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold mb-4">Your Workout Schedule</h2>
      <WorkoutCalendar />
      
      <div className="mt-6 bg-gray-900 border border-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-300 mb-3">About the Calendar</h3>
        <p className="text-sm text-gray-400">
          Track your workout consistency with this calendar. Dates with workouts are highlighted, and the color intensity shows how many workouts you completed on each day.
          Click on any highlighted date to view the details of your workout sessions.
        </p>
      </div>
    </div>
  );
};
