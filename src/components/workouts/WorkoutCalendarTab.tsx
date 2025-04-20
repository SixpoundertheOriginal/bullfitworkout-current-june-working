
import React, { useState } from "react";
import { WorkoutCalendar } from "./WorkoutCalendar";
import { DailyWorkoutSummary } from "../workouts/DailyWorkoutSummary";

export const WorkoutCalendarTab = () => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handleDateSelect = (date: string | null) => {
    setSelectedDate(date);
  };

  return (
    <div className="mt-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WorkoutCalendar onDatePreview={handleDateSelect} />
        {selectedDate && (
          <div className="hidden md:block">
            <DailyWorkoutSummary 
              date={selectedDate}
              onClose={() => setSelectedDate(null)}
              preview
            />
          </div>
        )}
      </div>
    </div>
  );
};
