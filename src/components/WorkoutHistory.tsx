
import React from "react";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { WorkoutCard } from "@/components/WorkoutCard";
import { Button } from "@/components/ui/button";
import { History, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WorkoutHistoryProps {
  limit?: number;
  className?: string;
}

export const WorkoutHistory = ({ limit = 5, className = "" }: WorkoutHistoryProps) => {
  const { data, isLoading, isError } = useWorkoutHistory(limit);
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className={`flex justify-center items-center py-8 ${className}`}>
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }
  
  if (isError || !data) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-400">Failed to load workout history</p>
      </div>
    );
  }
  
  const { workouts, exerciseCounts } = data;
  
  if (workouts.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-400">No workout history yet</p>
        <Button 
          className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          onClick={() => navigate('/training-session')}
        >
          Start Your First Workout
        </Button>
      </div>
    );
  }
  
  console.log("Rendering workout history cards:", workouts.map(w => ({id: w.id, name: w.name})));
  
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <History size={18} className="mr-2 text-purple-400" />
          Recent Workouts
        </h2>
      </div>
      
      <div className="space-y-3">
        {workouts.map(workout => (
          <WorkoutCard
            key={workout.id}
            id={workout.id}
            name={workout.name}
            type={workout.training_type}
            date={workout.start_time}
            duration={workout.duration}
            exerciseCount={exerciseCounts[workout.id]?.exercises || 0}
            setCount={exerciseCounts[workout.id]?.sets || 0}
          />
        ))}
      </div>
    </div>
  );
};

