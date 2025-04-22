import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useWeightUnit } from "@/context/WeightUnitContext";
import { useWorkoutStats } from "@/hooks/useWorkoutStats";
import { useWorkoutHistory } from "@/hooks/useWorkoutHistory";
import { 
  ArrowLeft, 
  BarChart3, 
  Calendar, 
  CalendarDays,
  Clock, 
  Dumbbell,
  History,
  Loader2, 
  Sparkles,
  Zap,
  Edit,
  PlusCircle,
  Trash2,
  ClipboardEdit
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkoutHistory } from "@/components/WorkoutHistory";
import { StatsCard } from "@/components/workouts/StatsCard";
import { WorkoutTypeChart } from "@/components/workouts/WorkoutTypeChart";
import { TopExercisesTable } from "@/components/workouts/TopExercisesTable";
import { WorkoutSummary } from "@/components/workouts/WorkoutSummary";
import { WorkoutCalendar } from "@/components/workouts/WorkoutCalendar";
import { WeightUnitToggle } from "@/components/WeightUnitToggle";
import { EditWorkoutModal } from "@/components/EditWorkoutModal";
import { EditExerciseSetModal } from "@/components/EditExerciseSetModal";
import { WorkoutMetricsSummary } from "@/components/workouts/WorkoutMetricsSummary";
import { updateWorkout, updateExerciseSets, addExerciseToWorkout, removeExerciseFromWorkout } from "@/services/workoutService";
import { ExerciseAutocomplete } from "@/components/ExerciseAutocomplete";
import { toast } from "@/components/ui/sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AddExerciseDialog } from "@/components/AddExerciseDialog";

interface WorkoutDetails {
  id: string;
  name: string;
  training_type: string;
  start_time: string;
  end_time: string;
  duration: number;
  notes: string | null;
  created_at: string;
}

interface ExerciseSet {
  id: string;
  exercise_name: string;
  workout_id: string;
  weight: number;
  reps: number;
  set_number: number;
  completed: boolean;
}

const WorkoutDetailsPage = () => {
  const { workoutId } = useParams<{ workoutId: string }>();
  const [searchParams] = useSearchParams();
  const dateFilter = searchParams.get('date');
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const { weightUnit } = useWeightUnit();
  
  const [activeTab, setActiveTab] = useState<string>(workoutId ? "details" : "overview");
  const { stats, loading: statsLoading } = useWorkoutStats();
  const { data: historyData, isLoading: historyLoading } = useWorkoutHistory(25);
  
  const [workoutDetails, setWorkoutDetails] = useState<WorkoutDetails | null>(null);
  const [exerciseSets, setExerciseSets] = useState<ExerciseSet[]>([]);
  const [loading, setLoading] = useState(workoutId ? true : false);
  
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [exerciseSetModalOpen, setExerciseSetModalOpen] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<string>("");
  const [exerciseSetsToEdit, setExerciseSetsToEdit] = useState<ExerciseSet[]>([]);
  
  const [addExerciseModalOpen, setShowAddDialog] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState<string>("");
  
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<string>("");
  
  useEffect(() => {
    if (!user || !workoutId) return;
    
    const fetchWorkoutDetails = async () => {
      try {
        setLoading(true);
        
        const { data: workout, error: workoutError } = await supabase
          .from('workout_sessions')
          .select('*')
          .eq('id', workoutId)
          .single();
          
        if (workoutError) {
          console.error('Error fetching workout:', workoutError);
          navigate('/workout-details');
          return;
        }
        
        setWorkoutDetails(workout);
        
        const { data: sets, error: setsError } = await supabase
          .from('exercise_sets')
          .select('*')
          .eq('workout_id', workoutId)
          .order('exercise_name', { ascending: true })
          .order('set_number', { ascending: true });
          
        if (setsError) {
          console.error('Error fetching exercise sets:', setsError);
          return;
        }
        
        setExerciseSets(sets || []);
      } catch (error) {
        console.error('Error in workout details fetch:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkoutDetails();
  }, [workoutId, user, navigate]);
  
  useEffect(() => {
    if (dateFilter) {
      setActiveTab("history");
    }
  }, [dateFilter]);
  
  useEffect(() => {
    if (workoutId) {
      setActiveTab("details");
    }
  }, [workoutId]);
  
  const renderOverviewTab = () => {
    if (statsLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-2 gap-4">
          <StatsCard 
            title="Total Workouts" 
            value={stats.totalWorkouts}
            icon={<Dumbbell size={20} />}
          />
          <StatsCard 
            title="Workout Time" 
            value={`${stats.totalDuration} min`}
            icon={<Clock size={20} />}
          />
        </div>
        
        <WorkoutSummary stats={stats} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <WorkoutTypeChart data={stats.workoutTypes} />
          <TopExercisesTable exercises={stats.topExercises} />
        </div>
        
        <WorkoutCalendar />
      </div>
    );
  };
  
  const renderHistoryTab = () => {
    return (
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <History size={20} className="mr-2 text-purple-400" />
          Workout History
          {dateFilter && (
            <span className="ml-2 text-sm text-gray-400">
              ({new Date(dateFilter).toLocaleDateString()})
            </span>
          )}
        </h2>
        
        <WorkoutHistory limit={30} className="mt-2" />
      </div>
    );
  };
  
  const handleSaveWorkoutEdit = async (updatedWorkout: WorkoutDetails) => {
    if (!workoutId) return;
    
    try {
      const data = {
        name: updatedWorkout.name,
        training_type: updatedWorkout.training_type,
        start_time: updatedWorkout.start_time,
        end_time: updatedWorkout.end_time,
        duration: updatedWorkout.duration,
        notes: updatedWorkout.notes
      };
      
      const updated = await updateWorkout(workoutId, data);
      setWorkoutDetails(updated);
    } catch (error) {
      console.error("Error updating workout:", error);
      throw error;
    }
  };
  
  const handleEditExercise = (exerciseName: string) => {
    const setsForExercise = exerciseSets.filter(set => set.exercise_name === exerciseName);
    setCurrentExercise(exerciseName);
    setExerciseSetsToEdit(setsForExercise);
    setExerciseSetModalOpen(true);
  };
  
  const handleSaveExerciseSets = async (updatedSets: ExerciseSet[]) => {
    if (!workoutId || !currentExercise) return;
    
    try {
      const updated = await updateExerciseSets(workoutId, currentExercise, updatedSets);
      
      const otherSets = exerciseSets.filter(set => set.exercise_name !== currentExercise);
      setExerciseSets([...otherSets, ...updated]);
    } catch (error) {
      console.error("Error updating exercise sets:", error);
      throw error;
    }
  };
  
  const handleAddExercise = async (exerciseName: string) => {
    if (!workoutId) return;
    
    try {
      const newSets = await addExerciseToWorkout(workoutId, exerciseName, 3);
      setExerciseSets([...exerciseSets, ...newSets]);
      toast.success(`Added ${exerciseName} to workout`);
      return Promise.resolve();
    } catch (error) {
      console.error("Error adding exercise:", error);
      toast.error("Failed to add exercise");
      return Promise.reject(error);
    }
  };
  
  const handleDeleteClick = (exerciseName: string) => {
    setExerciseToDelete(exerciseName);
    setDeleteAlertOpen(true);
  };
  
  const handleDeleteExercise = async () => {
    if (!workoutId || !exerciseToDelete) return;
    
    try {
      await removeExerciseFromWorkout(workoutId, exerciseToDelete);
      setExerciseSets(exerciseSets.filter(set => set.exercise_name !== exerciseToDelete));
      toast.success(`Removed ${exerciseToDelete} from workout`);
    } catch (error) {
      console.error("Error removing exercise:", error);
      toast.error("Failed to remove exercise");
    } finally {
      setDeleteAlertOpen(false);
      setExerciseToDelete("");
    }
  };
  
  const handleSelectExercise = (exercise: any) => {
    setNewExerciseName(exercise.name);
  };
  
  if (workoutId && loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <Loader2 className="h-8 w-8 animate-spin mr-2 text-purple-500" />
        <p>Loading workout details...</p>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <main className="flex-1 overflow-auto px-4 py-6 pb-24 mt-16">
        {!workoutId && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="overview" className="data-[state=active]:bg-purple-600">
                <Sparkles size={16} className="mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-purple-600">
                <History size={16} className="mr-2" />
                History
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-0">
              {renderOverviewTab()}
            </TabsContent>
            
            <TabsContent value="history" className="mt-0">
              {renderHistoryTab()}
            </TabsContent>
          </Tabs>
        )}
        
        {workoutId && workoutDetails && (
          <div className="mb-6">
            <Card className="bg-gray-900 border-gray-800 mb-6">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">{workoutDetails.name}</h2>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Calendar size={14} />
                      <span>
                        {new Date(workoutDetails.start_time).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short', 
                          day: 'numeric'
                        })}
                      </span>
                      <Clock size={14} />
                      <span className="font-mono">{workoutDetails.duration} min</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="text-purple-400 border-purple-400/30">
                      {workoutDetails.training_type}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditModalOpen(true)}
                      className="text-gray-400 hover:text-white hover:bg-gray-800"
                    >
                      <Edit size={18} />
                    </Button>
                  </div>
                </div>
                
                {exerciseSets.length > 0 && (
                  <WorkoutMetricsSummary exerciseSets={exerciseSets} className="mb-4" />
                )}
                
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-md font-medium">Exercises</h3>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowAddDialog(true)}
                      className="text-sm flex items-center text-gray-400 hover:text-white"
                    >
                      <PlusCircle size={16} className="mr-1" />
                      Add Exercise
                    </Button>
                  </div>
                  
                  {exerciseSets.length > 0 ? (
                    <div className="space-y-4">
                      {Array.from(new Set(exerciseSets.map(set => set.exercise_name))).map(exerciseName => {
                        const exerciseSetsFiltered = exerciseSets.filter(set => set.exercise_name === exerciseName);
                        
                        return (
                          <div key={exerciseName} className="bg-gray-800/50 rounded-lg p-3">
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="font-medium text-sm">{exerciseName}</h4>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditExercise(exerciseName)}
                                  className="h-7 w-7 text-gray-400 hover:text-white hover:bg-gray-700"
                                >
                                  <ClipboardEdit size={14} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteClick(exerciseName)}
                                  className="h-7 w-7 text-gray-400 hover:text-red-400 hover:bg-gray-700"
                                >
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            </div>
                            <div className="grid grid-cols-4 gap-1 text-xs text-gray-400">
                              <div>Set</div>
                              <div className="text-right">Weight</div>
                              <div className="text-right">Reps</div>
                              <div className="text-right">Volume</div>
                            </div>
                            <Separator className="my-1 bg-gray-700" />
                            {exerciseSetsFiltered.map((set, index) => (
                              <div key={set.id} className="grid grid-cols-4 gap-1 text-sm py-1">
                                <div>{set.set_number}</div>
                                <div className="text-right font-mono">{set.weight}</div>
                                <div className="text-right font-mono">{set.reps}</div>
                                <div className="text-right font-mono">{set.weight * set.reps}</div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      <Dumbbell size={24} className="mx-auto mb-2 opacity-50" />
                      <p>No exercises recorded for this workout</p>
                    </div>
                  )}
                </div>
                
                {workoutDetails.notes && (
                  <div className="mt-4 bg-gray-800/50 p-3 rounded">
                    <h3 className="text-sm font-medium mb-1">Notes</h3>
                    <p className="text-sm text-gray-300">{workoutDetails.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
      
      <EditWorkoutModal
        workout={workoutDetails}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        onSave={handleSaveWorkoutEdit}
      />
      
      <EditExerciseSetModal
        sets={exerciseSetsToEdit}
        exerciseName={currentExercise}
        open={exerciseSetModalOpen}
        onOpenChange={setExerciseSetModalOpen}
        onSave={handleSaveExerciseSets}
      />
      
      <AddExerciseDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        onAddExercise={handleAddExercise}
        onAdd={async (exercise) => {
          if (exercise.name) {
            return handleAddExercise(exercise.name);
          }
          return Promise.resolve();
        }}
      />
      
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Remove Exercise</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to remove {exerciseToDelete}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 border-gray-700 text-white hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteExercise}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorkoutDetailsPage;
