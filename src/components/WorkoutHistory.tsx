import React, { useState } from "react";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { WorkoutCard } from "@/components/WorkoutCard";
import { Button } from "@/components/ui/button";
import { History, Loader2, X, Check, SquareCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { DailyWorkoutSummary } from "./workouts/DailyWorkoutSummary";
import { deleteWorkout, restoreWorkout } from "@/services/workoutService";
import { toast } from "@/components/ui/sonner";
import { BulkWorkoutActions } from "./BulkWorkoutActions";

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
  
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedWorkouts, setSelectedWorkouts] = useState<string[]>([]);
  
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedWorkouts([]);
  };
  
  const toggleWorkoutSelection = (workoutId: string) => {
    setSelectedWorkouts(prevSelected => {
      if (prevSelected.includes(workoutId)) {
        return prevSelected.filter(id => id !== workoutId);
      } else {
        return [...prevSelected, workoutId];
      }
    });
  };
  
  const selectAllWorkouts = () => {
    if (!data?.workouts) return;
    
    if (selectedWorkouts.length === data.workouts.length) {
      setSelectedWorkouts([]);
    } else {
      setSelectedWorkouts(data.workouts.map(w => w.id));
    }
  };
  
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
      
      toast.success("Workout deleted", {
        description: `"${deletedWorkout.name}" has been removed`,
        action: {
          label: "Undo",
          onClick: () => handleUndoDelete(deletedWorkout),
        },
        duration: 5000,
      });
      
      refetch();
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
      refetch();
    } catch (error) {
      console.error("Error restoring workout:", error);
      toast.error("Failed to restore workout");
    }
  };
  
  const handleBulkActionComplete = () => {
    setSelectionMode(false);
    setSelectedWorkouts([]);
    refetch();
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
        
        <div className="flex items-center gap-2">
          {selectionMode ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllWorkouts}
                className="text-xs h-8"
              >
                <SquareCheck className="h-4 w-4 mr-1" />
                {selectedWorkouts.length === workouts.length ? "Deselect All" : "Select All"}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSelectionMode}
                className="text-xs h-8"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSelectionMode}
              className="text-xs h-8 border-purple-500/20 text-purple-400 hover:text-purple-300 hover:bg-purple-950/30"
            >
              <Check className="h-4 w-4 mr-1" />
              Select Multiple
            </Button>
          )}
        </div>
      </div>
      
      {selectionMode && selectedWorkouts.length > 0 && (
        <div className="bg-gray-800/50 p-3 rounded-lg mb-4 flex justify-between items-center">
          <span className="text-sm text-gray-300">
            {selectedWorkouts.length} workout{selectedWorkouts.length !== 1 ? 's' : ''} selected
          </span>
          
          <BulkWorkoutActions 
            selectedWorkoutIds={selectedWorkouts}
            onActionComplete={handleBulkActionComplete}
          />
        </div>
      )}
      
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
            selectionMode={selectionMode}
            isSelected={selectedWorkouts.includes(workout.id)}
            onToggleSelection={() => toggleWorkoutSelection(workout.id)}
          />
        ))}
      </div>
    </div>
  );
};
