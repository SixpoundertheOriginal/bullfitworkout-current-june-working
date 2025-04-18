
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useWeightUnit } from "@/context/WeightUnitContext";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  TrendingUp, 
  BarChart3, 
  ChevronRight, 
  ChevronLeft
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatWeightWithUnit, convertWeight } from "@/utils/unitConversion";
import { toast } from "@/components/ui/sonner";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { ChartContainer } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
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

interface ExercisePerformance {
  date: string;
  max_weight: number;
  total_volume: number;
  total_reps: number;
  sets: number;
}

const WorkoutDetailsPage = () => {
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { weightUnit } = useWeightUnit();
  
  const [workoutDetails, setWorkoutDetails] = useState<WorkoutDetails | null>(null);
  const [exerciseSets, setExerciseSets] = useState<ExerciseSet[]>([]);
  const [exercises, setExercises] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [exerciseHistory, setExerciseHistory] = useState<ExercisePerformance[]>([]);
  const [relatedWorkouts, setRelatedWorkouts] = useState<WorkoutDetails[]>([]);
  const [loading, setLoading] = useState(true);
  
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
          toast.error('Failed to load workout details');
          navigate('/');
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
          toast.error('Failed to load workout exercises');
          return;
        }
        
        setExerciseSets(sets || []);
        
        // Extract unique exercise names
        const uniqueExercises = [...new Set(sets?.map(set => set.exercise_name) || [])];
        setExercises(uniqueExercises);
        
        // Set the first exercise as selected by default
        if (uniqueExercises.length > 0 && !selectedExercise) {
          setSelectedExercise(uniqueExercises[0]);
        }
        
        // Fetch related workouts (same training type)
        if (workout) {
          const { data: related, error: relatedError } = await supabase
            .from('workout_sessions')
            .select('*')
            .eq('training_type', workout.training_type)
            .eq('user_id', user.id)
            .neq('id', workoutId)
            .order('start_time', { ascending: false })
            .limit(5);
            
          if (!relatedError) {
            setRelatedWorkouts(related || []);
          }
        }
        
      } catch (error) {
        console.error('Error in workout details fetch:', error);
        toast.error('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkoutDetails();
  }, [workoutId, user, navigate]);
  
  // Fetch exercise history when selected exercise changes
  useEffect(() => {
    if (!user || !selectedExercise) return;
    
    const fetchExerciseHistory = async () => {
      try {
        // Get all workouts containing this exercise
        const { data: exerciseSets, error: setsError } = await supabase
          .from('exercise_sets')
          .select('workout_id, exercise_name, weight, reps')
          .eq('exercise_name', selectedExercise);
          
        if (setsError) throw setsError;
        
        if (!exerciseSets || exerciseSets.length === 0) {
          setExerciseHistory([]);
          return;
        }
        
        // Get unique workout IDs
        const workoutIds = [...new Set(exerciseSets.map(set => set.workout_id))];
        
        // Fetch those workouts to get the dates
        const { data: workouts, error: workoutsError } = await supabase
          .from('workout_sessions')
          .select('id, start_time')
          .in('id', workoutIds)
          .order('start_time', { ascending: true });
          
        if (workoutsError) throw workoutsError;
        
        // Calculate performance metrics for each workout
        const history = workouts.map(workout => {
          const workoutSets = exerciseSets.filter(set => set.workout_id === workout.id);
          
          const maxWeight = Math.max(...workoutSets.map(set => set.weight));
          const totalVolume = workoutSets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
          const totalReps = workoutSets.reduce((sum, set) => sum + set.reps, 0);
          
          return {
            date: new Date(workout.start_time).toLocaleDateString(),
            max_weight: maxWeight,
            total_volume: totalVolume,
            total_reps: totalReps,
            sets: workoutSets.length
          };
        });
        
        setExerciseHistory(history);
        
      } catch (error) {
        console.error('Error fetching exercise history:', error);
      }
    };
    
    fetchExerciseHistory();
  }, [selectedExercise, user]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const calculateMetrics = () => {
    if (!exerciseSets.length) return { totalSets: 0, totalVolume: 0, maxWeight: 0 };
    
    const totalSets = exerciseSets.length;
    const totalVolume = exerciseSets.reduce((sum, set) => {
      const convertedWeight = convertWeight(set.weight, "lb", weightUnit);
      return sum + (convertedWeight * set.reps);
    }, 0);
    const maxWeight = Math.max(...exerciseSets.map(set => convertWeight(set.weight, "lb", weightUnit)));
    
    return {
      totalSets,
      totalVolume: Math.round(totalVolume * 10) / 10,
      maxWeight: Math.round(maxWeight * 10) / 10
    };
  };
  
  const metrics = calculateMetrics();
  
  const getExerciseSets = (exerciseName: string) => {
    return exerciseSets.filter(set => set.exercise_name === exerciseName);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p>Loading workout details...</p>
      </div>
    );
  }
  
  if (!workoutDetails) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black text-white">
        <p>Workout not found</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/')}
        >
          Return Home
        </Button>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="flex justify-between items-center p-4 border-b border-gray-800">
        <button 
          onClick={() => navigate('/')}
          className="p-2 rounded-full hover:bg-gray-900"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="title-large">Workout Details</h1>
        <WeightUnitToggle variant="badge" />
      </header>
      
      <main className="flex-1 overflow-auto px-4 py-6 pb-24">
        {/* Workout Header */}
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
                  <span className="font-mono">{formatTime(workoutDetails.duration)}</span>
                </div>
              </div>
              <Badge className="bg-purple-600 text-white">
                {workoutDetails.training_type}
              </Badge>
            </div>
            
            {/* Workout Metrics */}
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="bg-gray-800 p-3 rounded text-center">
                <div className="text-2xl font-medium">{metrics.totalSets}</div>
                <div className="text-xs text-gray-400 font-medium">Total Sets</div>
              </div>
              <div className="bg-gray-800 p-3 rounded text-center">
                <div className="text-2xl font-medium">{exercises.length}</div>
                <div className="text-xs text-gray-400 font-medium">Exercises</div>
              </div>
              <div className="bg-gray-800 p-3 rounded text-center">
                <div className="text-2xl font-medium">
                  {metrics.totalVolume} <span className="text-sm text-gray-400">{weightUnit}</span>
                </div>
                <div className="text-xs text-gray-400 font-medium">Volume</div>
              </div>
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
        
        {/* Exercise Selection Tabs */}
        {exercises.length > 0 && (
          <div className="mb-6 overflow-x-auto">
            <div className="flex space-x-2 pb-2">
              {exercises.map(exercise => (
                <button
                  key={exercise}
                  onClick={() => setSelectedExercise(exercise)}
                  className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${
                    selectedExercise === exercise
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {exercise}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Selected Exercise Details */}
        {selectedExercise && (
          <>
            {/* Exercise Sets Table */}
            <Card className="bg-gray-900 border-gray-800 mb-6">
              <CardContent className="p-4">
                <h3 className="text-lg font-medium mb-3">{selectedExercise} Sets</h3>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800">
                      <TableHead className="text-gray-400">Set</TableHead>
                      <TableHead className="text-gray-400 text-right">Weight</TableHead>
                      <TableHead className="text-gray-400 text-right">Reps</TableHead>
                      <TableHead className="text-gray-400 text-right">Volume</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getExerciseSets(selectedExercise).map((set, index) => {
                      const convertedWeight = convertWeight(set.weight, "lb", weightUnit);
                      const setVolume = convertedWeight * set.reps;
                      
                      return (
                        <TableRow key={set.id} className="border-gray-800">
                          <TableCell>{set.set_number}</TableCell>
                          <TableCell className="text-right font-mono">
                            {Math.round(convertedWeight * 10) / 10} {weightUnit}
                          </TableCell>
                          <TableCell className="text-right font-mono">{set.reps}</TableCell>
                          <TableCell className="text-right font-mono">
                            {Math.round(setVolume * 10) / 10} {weightUnit}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            
            {/* Performance History Chart */}
            {exerciseHistory.length > 0 && (
              <Card className="bg-gray-900 border-gray-800 mb-6">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-lg font-medium">Performance History</h3>
                    <div className="text-xs text-gray-400">{exerciseHistory.length} workouts</div>
                  </div>
                  
                  <div className="h-60 w-full">
                    <ChartContainer 
                      className="[&_.recharts-cartesian-axis-tick-value]:fill-gray-400 [&_.recharts-cartesian-axis-tick-value]:text-xs"
                      config={{
                        maxWeight: { theme: { dark: '#9b87f5', light: '#9b87f5' } },
                        volume: { theme: { dark: '#D946EF', light: '#D946EF' } }
                      }}
                    >
                      <LineChart data={exerciseHistory}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 10 }}
                          stroke="#555"
                        />
                        <YAxis 
                          stroke="#555"
                          tick={{ fontSize: 10 }}
                          yAxisId="left"
                        />
                        <YAxis 
                          stroke="#555"
                          tick={{ fontSize: 10 }}
                          yAxisId="right"
                          orientation="right"
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#1A1F2C', 
                            border: '1px solid #333',
                            borderRadius: '4px'
                          }}
                          itemStyle={{ color: '#fff' }}
                          labelStyle={{ color: '#9b87f5' }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="max_weight" 
                          name={`Max Weight (${weightUnit})`}
                          stroke="var(--color-maxWeight)" 
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                          yAxisId="left"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="total_volume" 
                          name={`Total Volume (${weightUnit})`}
                          stroke="var(--color-volume)" 
                          strokeWidth={2}
                          dot={{ r: 3 }}
                          activeDot={{ r: 5 }}
                          yAxisId="right"
                        />
                      </LineChart>
                    </ChartContainer>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="bg-gray-800/50 p-3 rounded flex flex-col items-center">
                      <div className="flex items-center text-sm text-gray-400 mb-1">
                        <TrendingUp size={14} className="mr-1 text-purple-500" />
                        Progress
                      </div>
                      {exerciseHistory.length > 1 ? (
                        <div className="text-center">
                          <span className="text-lg font-medium">
                            {((exerciseHistory[exerciseHistory.length - 1].max_weight - exerciseHistory[0].max_weight) > 0) ? '+' : ''}
                            {Math.round((exerciseHistory[exerciseHistory.length - 1].max_weight - exerciseHistory[0].max_weight) * 10) / 10} {weightUnit}
                          </span>
                          <span className="text-xs text-gray-400 block">since first workout</span>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">Not enough data</div>
                      )}
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded flex flex-col items-center">
                      <div className="flex items-center text-sm text-gray-400 mb-1">
                        <BarChart3 size={14} className="mr-1 text-purple-500" />
                        Best Set
                      </div>
                      {exerciseHistory.length > 0 ? (
                        <div className="text-center">
                          <span className="text-lg font-medium">
                            {Math.max(...exerciseHistory.map(h => h.max_weight))} {weightUnit}
                          </span>
                          <span className="text-xs text-gray-400 block">max weight</span>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">No data available</div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
        
        {/* Related Workouts */}
        {relatedWorkouts.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Related Workouts</h3>
            <div className="space-y-2">
              {relatedWorkouts.map(workout => (
                <div 
                  key={workout.id}
                  onClick={() => navigate(`/workout-details/${workout.id}`)}
                  className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex justify-between items-center cursor-pointer hover:bg-gray-800/50 transition-colors"
                >
                  <div>
                    <div className="font-medium">{workout.name}</div>
                    <div className="text-sm text-gray-400 flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(workout.start_time).toLocaleDateString()}
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-500" />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default WorkoutDetailsPage;
