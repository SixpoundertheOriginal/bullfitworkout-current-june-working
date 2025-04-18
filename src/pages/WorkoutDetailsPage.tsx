
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
  Zap
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
  
  const [activeTab, setActiveTab] = useState<string>(workoutId ? "details" : "overview");
  const { stats, loading: statsLoading } = useWorkoutStats();
  const { data: historyData, isLoading: historyLoading } = useWorkoutHistory(25);
  
  // For single workout details
  const [workoutDetails, setWorkoutDetails] = useState<WorkoutDetails | null>(null);
  const [exerciseSets, setExerciseSets] = useState<ExerciseSet[]>([]);
  const [loading, setLoading] = useState(workoutId ? true : false);
  
  useEffect(() => {
    if (!user || !workoutId) return;
    
    const fetchWorkoutDetails = async () => {
      try {
        setLoading(true);
        
        // Fetch workout details
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
        
        // Fetch exercise sets for this workout
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
  
  // If dateFilter is present, we need to show the history tab
  useEffect(() => {
    if (dateFilter) {
      setActiveTab("history");
    }
  }, [dateFilter]);
  
  // When workoutId changes, update the active tab
  useEffect(() => {
    if (workoutId) {
      setActiveTab("details");
    }
  }, [workoutId]);
  
  // Main overview page content
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
        {/* Top row stats cards */}
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
        
        {/* Main content */}
        <WorkoutSummary stats={stats} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <WorkoutTypeChart data={stats.workoutTypes} />
          <TopExercisesTable exercises={stats.topExercises} />
        </div>
        
        <WorkoutCalendar />
      </div>
    );
  };
  
  // History tab content
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
  
  // If we're on a specific workout details view
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
      <header className="flex justify-between items-center p-4 border-b border-gray-800">
        <button 
          onClick={() => workoutId ? navigate('/workout-details') : navigate('/')}
          className="p-2 rounded-full hover:bg-gray-900"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold">
          {workoutId ? 'Workout Details' : 'Training'}
        </h1>
        <WeightUnitToggle variant="badge" />
      </header>
      
      <main className="flex-1 overflow-auto px-4 py-6 pb-24">
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
        
        {/* Show workout details if we have a workoutId */}
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
                  <Button variant="outline" size="sm" className="text-purple-400 border-purple-400/30">
                    {workoutDetails.training_type}
                  </Button>
                </div>
                
                {/* Exercise list */}
                <div className="mt-6">
                  <h3 className="text-md font-medium mb-2">Exercises</h3>
                  
                  {exerciseSets.length > 0 ? (
                    <div className="space-y-4">
                      {Array.from(new Set(exerciseSets.map(set => set.exercise_name))).map(exerciseName => {
                        const exerciseSetsFiltered = exerciseSets.filter(set => set.exercise_name === exerciseName);
                        
                        return (
                          <div key={exerciseName} className="bg-gray-800/50 rounded-lg p-3">
                            <h4 className="font-medium text-sm mb-2">{exerciseName}</h4>
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
                
                {/* Notes Section */}
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
    </div>
  );
};

export default WorkoutDetailsPage;
