
import React, { useState } from "react";
import { WorkoutCalendar } from "./WorkoutCalendar";
import { DailyWorkoutSummary } from "../workouts/DailyWorkoutSummary";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

export const WorkoutCalendarTab = () => {
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date');
  const [selectedDate, setSelectedDate] = useState<string | null>(dateParam);
  const navigate = useNavigate();

  const handleDateSelect = (date: string | null) => {
    setSelectedDate(date);
    
    // Update URL with the selected date but don't navigate away
    if (date) {
      navigate(`/training?tab=calendar&date=${date}`, { replace: true });
    } else {
      navigate('/training?tab=calendar', { replace: true });
    }
  };

  return (
    <div className="mt-4">
      {selectedDate ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <Button 
              variant="ghost" 
              className="flex items-center gap-1 text-gray-400 hover:text-white p-0"
              onClick={() => handleDateSelect(null)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Calendar
            </Button>
          </div>
          <DailyWorkoutSummary 
            date={selectedDate}
            onClose={() => handleDateSelect(null)}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WorkoutCalendar onDatePreview={handleDateSelect} />
          {/* Preview panel for medium and larger screens */}
          {selectedDate && (
            <div className="hidden md:block">
              <DailyWorkoutSummary 
                date={selectedDate}
                onClose={() => handleDateSelect(null)}
                preview
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
