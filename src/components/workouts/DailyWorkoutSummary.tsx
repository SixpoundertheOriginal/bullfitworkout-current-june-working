
import React from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CalendarDays, Clock, Dumbbell } from "lucide-react";
import { WorkoutCard } from "@/components/WorkoutCard";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";

interface DailyWorkoutSummaryProps {
  date: string;
  onClose?: () => void;
}

export const DailyWorkoutSummary = ({ date, onClose }: DailyWorkoutSummaryProps) => {
  const { data, isLoading } = useWorkoutHistory(undefined, date);
  const workouts = data?.workouts || [];
  
  const formattedDate = format(new Date(date), 'MMMM d, yyyy');
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-purple-400" />
            {formattedDate}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {workouts.length > 0 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                  <Clock className="h-4 w-4" />
                  Total Time
                </div>
                <div className="text-xl font-semibold">
                  {workouts.reduce((acc, w) => acc + (w.duration || 0), 0)} min
                </div>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-1">
                  <Dumbbell className="h-4 w-4" />
                  Workouts
                </div>
                <div className="text-xl font-semibold">
                  {workouts.length}
                </div>
              </div>
            </div>
            
            <div className="space-y-3 mt-4">
              {workouts.map((workout) => (
                <WorkoutCard
                  key={workout.id}
                  id={workout.id}
                  name={workout.name}
                  type={workout.training_type}
                  date={workout.start_time}
                  duration={workout.duration}
                  exerciseCount={data.exerciseCounts[workout.id]?.exercises || 0}
                  setCount={data.exerciseCounts[workout.id]?.sets || 0}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-400">
            <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No workouts recorded on this date</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
