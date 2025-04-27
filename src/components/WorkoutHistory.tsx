import React, { useState, useEffect } from "react";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { WorkoutCard } from "@/components/WorkoutCard";
import { Button } from "@/components/ui/button";
import { History, Loader2, X, Check, SquareCheck, Undo, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format, parseISO, subDays } from "date-fns";
import { DailyWorkoutSummary } from "./workouts/DailyWorkoutSummary";
import { deleteWorkout, restoreWorkout, diagnoseAndFixWorkout } from "@/services/workoutService";
import { toast } from "@/components/ui/sonner";
import { BulkWorkoutActions } from "./BulkWorkoutActions";
import { CollapsibleHistorySection } from "./workouts/CollapsibleHistorySection";
import { darkModeText } from "@/lib/theme";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface WorkoutHistoryProps {
  limit?: number;
  className?: string;
  dateFilter?: string | null;
  selectionMode?: boolean;
  selectedWorkouts?: string[];
  onWorkoutSelected?: (id: string, isSelected: boolean) => void;
}

export const WorkoutHistory = ({ 
  limit = 5, 
  className = "",
  dateFilter = null,
  selectionMode = false,
  selectedWorkouts = [],
  onWorkoutSelected
}: WorkoutHistoryProps) => {
  const { data, isLoading, isError, refetch } = useWorkoutHistory(limit, dateFilter);
  const navigate = useNavigate();
  const [deletingWorkoutId, setDeletingWorkoutId] = useState<string | null>(null);
  const [fixingWorkoutId, setFixingWorkoutId] = useState<string | null>(null);
  const [showRecoverPrompt, setShowRecoverPrompt] = useState(false);
  const [recoveryChecking, setRecoveryChecking] = useState(false);
  const { user } = useAuth();
  
  const [selectionModeState, setSelectionModeState] = useState(selectionMode);
  const [selectedWorkoutsState, setSelectedWorkoutsState] = useState(selectedWorkouts);
  
  useEffect(() => {
    if (!user || !data?.workouts || recoveryChecking) return;
    
    const checkForOrphanedWorkouts = async () => {
      try {
        setRecoveryChecking(true);
        
        const thirtyMinutesAgo = new Date();
        thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
        
        const { data: recentWorkouts, error } = await supabase
          .from('workout_sessions')
          .select('id, name, created_at, exercise_sets(count)')
          .eq('user_id', user.id)
          .gte('created_at', thirtyMinutesAgo.toISOString())
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error("Error checking for recent workouts:", error);
          return;
        }
        
        if (recentWorkouts && recentWorkouts.length > 0) {
          const visibleWorkoutIds = new Set(data.workouts.map(w => w.id));
          const missingWorkouts = recentWorkouts.filter(w => {
            const isMissing = !visibleWorkoutIds.has(w.id);
            const hasNoSets = w.exercise_sets && w.exercise_sets.length === 0;
            return isMissing || hasNoSets;
          });
          
          if (missingWorkouts.length > 0) {
            console.log(`Found ${missingWorkouts.length} potentially missing recent workouts:`, missingWorkouts);
            setShowRecoverPrompt(true);
          } else {
            setShowRecoverPrompt(false);
          }
        }
      } catch (error) {
        console.error("Error in checkForOrphanedWorkouts:", error);
      } finally {
        setRecoveryChecking(false);
      }
    };
    
    checkForOrphanedWorkouts();
  }, [user, data, recoveryChecking]);
  
  const toggleSelectionMode = () => {
    setSelectionModeState(!selectionModeState);
    setSelectedWorkoutsState([]);
  };
  
  const toggleWorkoutSelection = (workoutId: string) => {
    const isSelected = selectedWorkoutsState.includes(workoutId);
    if (onWorkoutSelected) {
      onWorkoutSelected(workoutId, !isSelected);
    } else {
      setSelectedWorkoutsState(prevSelected => {
        if (prevSelected.includes(workoutId)) {
          return prevSelected.filter(id => id !== workoutId);
        } else {
          return [...prevSelected, workoutId];
        }
      });
    }
  };
  
  const selectAllWorkouts = () => {
    if (!data?.workouts) return;
    
    if (selectedWorkoutsState.length === data.workouts.length) {
      setSelectedWorkoutsState([]);
    } else {
      setSelectedWorkoutsState(data.workouts.map(w => w.id));
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
          label: (
            <span className="flex items-center gap-1">
              <Undo size={14} className="text-purple-400" />
              Undo
            </span>
          ),
          onClick: () => handleUndoDelete(deletedWorkout),
        },
        duration: 7000,
      });
      
      refetch();
    } catch (error) {
      console.error("Error deleting workout:", error);
      toast.error("Failed to delete workout", {
        description: "Something went wrong when trying to delete the workout. Please try again.",
      });
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
  
  const handleFixWorkout = async (workoutId: string) => {
    setFixingWorkoutId(workoutId);
    
    try {
      const result = await diagnoseAndFixWorkout(workoutId);
      
      if (result.success) {
        if (result.workoutFixed) {
          toast.success("Workout fixed", {
            description: "The workout has been recovered and should now be visible in your history.",
          });
        } else {
          toast("No issues were found with this workout.");
        }
      } else {
        toast.error("Could not fix workout", {
          description: result.message || "An unknown error occurred",
        });
      }
      
      refetch();
    } catch (error) {
      console.error("Error fixing workout:", error);
      toast.error("Failed to fix workout");
    } finally {
      setFixingWorkoutId(null);
    }
  };
  
  const handleBulkActionComplete = () => {
    setSelectionModeState(false);
    setSelectedWorkoutsState([]);
    refetch();
  };
  
  const handleRecoverRecentWorkouts = async () => {
    setRecoveryChecking(true);
    try {
      const thirtyMinutesAgo = new Date();
      thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
      
      const { data: recentWorkouts, error } = await supabase
        .from('workout_sessions')
        .select('id, name')
        .eq('user_id', user?.id)
        .gte('created_at', thirtyMinutesAgo.toISOString())
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error("Error fetching recent workouts:", error);
        toast.error("Could not fetch recent workouts");
        return;
      }
      
      if (!recentWorkouts || recentWorkouts.length === 0) {
        toast("There are no workouts from the last 30 minutes to recover.");
        setShowRecoverPrompt(false);
        return;
      }
      
      let fixedCount = 0;
      let errorCount = 0;
      
      for (const workout of recentWorkouts) {
        try {
          const result = await diagnoseAndFixWorkout(workout.id);
          if (result.success && result.workoutFixed) {
            fixedCount++;
          }
        } catch (error) {
          console.error(`Error fixing workout ${workout.id}:`, error);
          errorCount++;
        }
      }
      
      if (fixedCount > 0) {
        toast.success(`${fixedCount} workout${fixedCount !== 1 ? 's' : ''} recovered`, {
          description: "Your workouts should now be visible in your history."
        });
      } else if (errorCount === 0) {
        toast("Your recent workouts appear to be properly saved.");
      } else {
        toast.error(`${errorCount} workout${errorCount !== 1 ? 's' : ''} could not be recovered.`);
      }
      
      setShowRecoverPrompt(false);
      refetch();
    } catch (error) {
      console.error("Error recovering workouts:", error);
      toast.error("Failed to recover workouts");
    } finally {
      setRecoveryChecking(false);
    }
  };
  
  const groupWorkouts = (workouts: any[]) => {
    const today = new Date();
    const yesterday = subDays(today, 1);
    
    return {
      today: workouts.filter(w => 
        new Date(w.start_time).toDateString() === today.toDateString()
      ),
      yesterday: workouts.filter(w => 
        new Date(w.start_time).toDateString() === yesterday.toDateString()
      ),
      earlier: workouts.filter(w => 
        new Date(w.start_time) < yesterday && 
        new Date(w.start_time).toDateString() !== yesterday.toDateString()
      )
    };
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
        <p className={darkModeText.body}>Failed to load workout history</p>
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
  
  const groupedWorkouts = groupWorkouts(workouts);

  if (workouts.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className={darkModeText.body}>
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
        
        {showRecoverPrompt && (
          <div className="mt-6 p-4 bg-yellow-900/30 border border-yellow-600/30 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-yellow-500 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-yellow-200">Recently incomplete workouts detected</h3>
                <p className="text-sm text-yellow-200/70 mt-1">
                  We found workouts from the last 30 minutes that might not be fully saved.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRecoverRecentWorkouts}
                  disabled={recoveryChecking}
                  className="mt-3 bg-yellow-900/50 border-yellow-700 hover:bg-yellow-800 text-yellow-100"
                >
                  {recoveryChecking ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <span className="flex items-center">
                      <Check className="mr-2 h-4 w-4" />
                      Recover Workouts
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h2 className={`${darkModeText.heading} flex items-center`}>
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
          {selectionModeState ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={selectAllWorkouts}
                className="text-xs h-8"
              >
                <SquareCheck className="h-4 w-4 mr-1" />
                {selectedWorkoutsState.length === workouts.length ? "Deselect All" : "Select All"}
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
      
      {showRecoverPrompt && (
        <div className="mb-4 p-3 bg-yellow-900/30 border border-yellow-600/30 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-yellow-500 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-yellow-200">Recently incomplete workouts detected</h3>
              <p className="text-sm text-yellow-200/70 mt-1">
                We found workouts from the last 30 minutes that might not be fully saved.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRecoverRecentWorkouts}
                disabled={recoveryChecking}
                className="mt-2 bg-yellow-900/50 border-yellow-700 hover:bg-yellow-800 text-yellow-100"
              >
                {recoveryChecking ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <span className="flex items-center">
                    <Check className="mr-2 h-4 w-4" />
                    Recover Workouts
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {selectionModeState && selectedWorkoutsState.length > 0 && onWorkoutSelected === undefined && (
        <div className="bg-gray-800/50 p-3 rounded-lg mb-4 flex justify-between items-center">
          <span className="text-sm text-gray-300">
            {selectedWorkoutsState.length} workout{selectedWorkoutsState.length !== 1 ? 's' : ''} selected
          </span>
          
          <BulkWorkoutActions 
            selectedWorkoutIds={selectedWorkoutsState}
            onActionComplete={handleBulkActionComplete}
          />
        </div>
      )}
      
      <div className="space-y-4">
        {groupedWorkouts.today.length > 0 && (
          <CollapsibleHistorySection title="Today">
            <div className="space-y-3">
              {groupedWorkouts.today.map(workout => (
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
                  onFix={() => handleFixWorkout(workout.id)}
                  isDeleting={deletingWorkoutId === workout.id}
                  isFixing={fixingWorkoutId === workout.id}
                  selectionMode={selectionModeState}
                  isSelected={selectedWorkoutsState.includes(workout.id)}
                  onToggleSelection={() => toggleWorkoutSelection(workout.id)}
                  showFixOption={exerciseCounts[workout.id]?.exercises === 0 || exerciseCounts[workout.id]?.sets === 0}
                />
              ))}
            </div>
          </CollapsibleHistorySection>
        )}

        {groupedWorkouts.yesterday.length > 0 && (
          <CollapsibleHistorySection title="Yesterday">
            <div className="space-y-3">
              {groupedWorkouts.yesterday.map(workout => (
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
                  onFix={() => handleFixWorkout(workout.id)}
                  isDeleting={deletingWorkoutId === workout.id}
                  isFixing={fixingWorkoutId === workout.id}
                  selectionMode={selectionModeState}
                  isSelected={selectedWorkoutsState.includes(workout.id)}
                  onToggleSelection={() => toggleWorkoutSelection(workout.id)}
                  showFixOption={exerciseCounts[workout.id]?.exercises === 0 || exerciseCounts[workout.id]?.sets === 0}
                />
              ))}
            </div>
          </CollapsibleHistorySection>
        )}

        {groupedWorkouts.earlier.length > 0 && (
          <CollapsibleHistorySection 
            title="Earlier" 
            defaultOpen={false}
          >
            <div className="space-y-3">
              {groupedWorkouts.earlier.map(workout => (
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
                  onFix={() => handleFixWorkout(workout.id)}
                  isDeleting={deletingWorkoutId === workout.id}
                  isFixing={fixingWorkoutId === workout.id}
                  selectionMode={selectionModeState}
                  isSelected={selectedWorkoutsState.includes(workout.id)}
                  onToggleSelection={() => toggleWorkoutSelection(workout.id)}
                  showFixOption={exerciseCounts[workout.id]?.exercises === 0 || exerciseCounts[workout.id]?.sets === 0}
                />
              ))}
            </div>
          </CollapsibleHistorySection>
        )}
      </div>
    </div>
  );
};
