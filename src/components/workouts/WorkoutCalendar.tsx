
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { useNavigate } from "react-router-dom";
import { useWorkoutDates } from "@/hooks/useWorkoutHistory";
import { Loader2 } from "lucide-react";
import { toast } from "@/components/ui/sonner";

interface WorkoutCalendarProps {
  className?: string;
}

export const WorkoutCalendar = ({ className = "" }: WorkoutCalendarProps) => {
  const navigate = useNavigate();
  const [month, setMonth] = useState<Date>(new Date());
  
  // Get current year and month from the selected month
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  
  // Fetch workout dates for the current month view
  const { data: workoutDates = {}, isLoading, isError } = useWorkoutDates(year, monthIndex);
  
  if (isError) {
    toast.error("Failed to load workout calendar");
  }
  
  const handleSelectDate = (date: Date | undefined) => {
    if (!date) return;
    
    const dateString = date.toISOString().split('T')[0];
    const workoutCount = workoutDates[dateString] || 0;
    
    if (workoutCount > 0) {
      // Navigate to the history tab with date filter
      navigate(`/training?tab=history&date=${dateString}`);
    }
  };

  const handleMonthChange = (newMonth: Date) => {
    console.log("Month changed to:", newMonth);
    setMonth(newMonth);
  };
  
  // Function to customize day rendering based on workout count
  const dayClassName = (date: Date): string => {
    const dateString = date.toISOString().split('T')[0];
    const workoutCount = workoutDates[dateString] || 0;
    
    if (workoutCount > 0) {
      if (workoutCount >= 3) {
        return 'bg-purple-600 text-white rounded-full hover:bg-purple-700';
      } else if (workoutCount === 2) {
        return 'bg-purple-500/80 text-white rounded-full hover:bg-purple-600';
      } else {
        return 'bg-purple-500/50 text-white rounded-full hover:bg-purple-500';
      }
    }
    
    return '';
  };
  
  return (
    <Card className={`bg-gray-900 border-gray-800 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-md">Workout Calendar</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="h-[300px] flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          </div>
        ) : (
          <>
            <Calendar
              mode="single"
              className="rounded-md border-0"
              classNames={{
                day_selected: 'bg-purple-600 text-white hover:bg-purple-700 focus:bg-purple-600',
                day: 'h-9 w-9 p-0 font-normal aria-selected:opacity-100',
                day_today: 'bg-gray-800 text-white',
                nav_button: 'border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700'
              }}
              selected={undefined}
              onSelect={handleSelectDate}
              onMonthChange={handleMonthChange}
              month={month}
              disabled={{ after: new Date() }}
              components={{
                Day({ date, ...props }) {
                  const extraClass = dayClassName(date);
                  return (
                    <div 
                      {...props}
                      className={`${props.className || ''} ${extraClass}`}
                    />
                  );
                }
              }}
            />
            
            <div className="flex justify-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-purple-500/50"></div>
                <span className="text-xs text-gray-400">1 workout</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-purple-500/80"></div>
                <span className="text-xs text-gray-400">2 workouts</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                <span className="text-xs text-gray-400">3+ workouts</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
