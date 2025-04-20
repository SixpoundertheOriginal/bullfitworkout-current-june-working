import React, { useState } from "react";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { WorkoutCard } from "@/components/WorkoutCard";
import { Button } from "@/components/ui/button";
import { History, Loader2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { DailyWorkoutSummary } from "./workouts/DailyWorkoutSummary";
import { deleteWorkout, restoreWorkout } from "@/services/workoutService";
import { toast } from "@/components/ui/sonner";

interface WorkoutHistoryProps {
  limit?: number;
  className?: string;
  dateFilter?: string | null;
}

export const WorkoutHistory = ({ 
  limit = 5, 
  className = "",
  dateFilter = null
}: WorkoutHistoryProps) => {
  const { data, isLoading, isError, refetch } = useWorkoutHistory(limit, dateFilter);
  const navigate = useNavigate();
  const [deletingWorkoutId, setDeletingWorkoutId] = useState<string | null>(null);
  
  const handleEditWorkout = (workoutId: string) => {
    navigate(`/workout-details/${workoutId}`);
  };
  
  const handleDeleteWorkout = async (workoutId: string) => {
    setDeletingWorkoutId(workoutId);
    
    try {
      const deletedWorkout = data?.workouts.find(w => w.id === workoutId);
      
      if (!deletedWorkout) {
        throw new Error("Workout not found");
      }
      
      await deleteWorkout(workoutId);
      
      // Show toast with undo option
      toast.success("Workout deleted", {
        description: `"${deletedWorkout.name}" has been removed`,
        action: {
          label: "Undo",
          onClick: () => handleUndoDelete(deletedWorkout),
        },
        duration: 5000, // Give user 5 seconds to undo
      });
      
      refetch(); // Refresh the workout history
    } catch (error) {
      console.error("Error deleting workout:", error);
      toast.error("Failed to delete workout");
    } finally {
      setDeletingWorkoutId(null);
    }
  };
  
  const handleUndoDelete = async (workout: any) => {
    try {
      await restoreWorkout(workout);
      toast.success("Workout restored");
      refetch(); // Refresh the workout history
    } catch (error) {
      console.error("Error restoring workout:", error);
      toast.error("Failed to restore workout");
    }
  };
  
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
  
  if (dateFilter) {
    return (
      <div className={className}>
        <DailyWorkoutSummary 
          date={dateFilter} 
          onClose={() => navigate('/training?tab=history')}
        />
      </div>
    );
  }
  
  const { workouts, exerciseCounts } = data;
  
  if (workouts.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-400">
          {dateFilter 
            ? `No workouts found for the selected date (${format(parseISO(dateFilter), 'MMMM d, yyyy')})`
            : 'No workout history yet'}
        </p>
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
          {dateFilter ? (
            <div className="flex items-center">
              <span>Workouts on {format(parseISO(dateFilter), 'MMMM d, yyyy')}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="ml-2 h-6 px-2" 
                onClick={() => navigate('/training?tab=history')}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            'Recent Workouts'
          )}
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
            onEdit={() => handleEditWorkout(workout.id)}
            onDelete={() => handleDeleteWorkout(workout.id)}
            isDeleting={deletingWorkoutId === workout.id}
          />
        ))}
      </div>
    </div>
  );
};
