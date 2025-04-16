import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft, 
  BarChart3, 
  Trophy, 
  Calendar, 
  Clock, 
  Save, 
  CheckCircle, 
  Dumbbell, 
  ChevronRight 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface ExerciseSet {
  weight: number;
  reps: number;
  completed: boolean;
}

interface WorkoutExercises {
  [key: string]: ExerciseSet[];
}

interface WorkoutData {
  exercises: WorkoutExercises;
  duration: number;
  startTime: Date;
  endTime: Date;
  trainingType: string;
  name: string;
}

const WorkoutComplete = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [workoutData, setWorkoutData] = useState<WorkoutData | null>(null);
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [savingStats, setSavingStats] = useState({
    completed: false,
    error: false
  });

  useEffect(() => {
    if (location.state?.workoutData) {
      setWorkoutData(location.state.workoutData);
    } else {
      toast({
        title: "No workout data found",
        description: "Please complete a workout session first",
        variant: "destructive"
      });
      navigate("/");
    }
  }, [location.state, navigate]);

  const totalVolume = workoutData ? Object.keys(workoutData.exercises).reduce((total, exercise) => {
    return total + workoutData.exercises[exercise].reduce((exerciseTotal, set) => {
      if (set.completed) {
        return exerciseTotal + (set.weight * set.reps);
      }
      return exerciseTotal;
    }, 0);
  }, 0) : 0;

  const totalSets = workoutData ? Object.keys(workoutData.exercises).reduce((total, exercise) => {
    return total + workoutData.exercises[exercise].length;
  }, 0) : 0;

  const completedSets = workoutData ? Object.keys(workoutData.exercises).reduce((total, exercise) => {
    return total + workoutData.exercises[exercise].filter(set => set.completed).length;
  }, 0) : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const saveWorkout = async () => {
    if (!workoutData || !user) return;
    
    setSaving(true);
    
    try {
      console.log("Saving workout with data:", {
        user_id: user.id,
        name: workoutData.name || workoutData.trainingType,
        training_type: workoutData.trainingType,
        start_time: workoutData.startTime.toISOString(),
        end_time: workoutData.endTime.toISOString(),
        duration: workoutData.duration,
        notes: notes || null
      });
      
      const { data: workoutSession, error: workoutError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          name: workoutData.name || workoutData.trainingType,
          training_type: workoutData.trainingType,
          start_time: workoutData.startTime.toISOString(),
          end_time: workoutData.endTime.toISOString(),
          duration: workoutData.duration,
          notes: notes || null
        })
        .select('id')
        .single();

      if (workoutError) throw workoutError;
      
      if (workoutSession) {
        setWorkoutId(workoutSession.id);
        
        const exerciseSets = [];
        
        for (const [exerciseName, sets] of Object.entries(workoutData.exercises)) {
          sets.forEach((set, index) => {
            if (set.completed) {
              exerciseSets.push({
                workout_id: workoutSession.id,
                exercise_name: exerciseName,
                weight: set.weight,
                reps: set.reps,
                completed: set.completed,
                set_number: index + 1
              });
            }
          });
        }
        
        console.log("Saving exercise sets:", exerciseSets);
        
        if (exerciseSets.length > 0) {
          const { error: setsError } = await supabase
            .from('exercise_sets')
            .insert(exerciseSets);
            
          if (setsError) throw setsError;
        }
        
        if (saveAsTemplate) {
          const { error: templateError } = await supabase
            .from('workout_templates')
            .insert({
              name: templateName || `${workoutData.trainingType} Template`,
              description: `Created from workout on ${new Date().toLocaleDateString()}`,
              training_type: workoutData.trainingType,
              exercises: JSON.stringify(workoutData.exercises),
              created_by: user.id,
              estimated_duration: workoutData.duration
            });
            
          if (templateError) throw templateError;
        }
        
        setSavingStats({
          completed: true,
          error: false
        });
        
        toast({
          title: "Workout saved!",
          description: "Your workout has been successfully recorded",
        });
        
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (error) {
      console.error("Error saving workout:", error);
      setSavingStats({
        completed: true,
        error: true
      });
      
      toast({
        title: "Error saving workout",
        description: "There was a problem saving your workout data",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getVolumeChartData = () => {
    if (!workoutData) return [];
    
    return Object.keys(workoutData.exercises).map(exercise => {
      const totalExerciseVolume = workoutData.exercises[exercise].reduce((total, set) => {
        if (set.completed) {
          return total + (set.weight * set.reps);
        }
        return total;
      }, 0);
      
      return {
        name: exercise,
        volume: totalExerciseVolume
      };
    });
  };

  if (!workoutData) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <p>Loading workout data...</p>
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
        <h1 className="title-large">Workout Complete</h1>
        <div className="w-9"></div>
      </header>

      <main className="flex-1 overflow-auto px-4 py-6">
        <div className="mb-8 rounded-xl p-6 text-center bg-gradient-to-r from-green-600 to-emerald-500">
          <CheckCircle size={48} className="mx-auto mb-2" />
          <p className="title-medium">
            Congrats! You've completed your workout
          </p>
          <p className="text-sm opacity-80 mt-1 font-medium">
            {workoutData.trainingType} • <span className="mono-text">{formatTime(workoutData.duration)}</span>
          </p>
        </div>

        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="title-small">{workoutData.name || workoutData.trainingType}</h2>
                <div className="flex items-center text-gray-400 text-sm">
                  <Calendar size={14} className="mr-1" />
                  <span>{new Date().toLocaleDateString()}</span>
                  <Clock size={14} className="ml-3 mr-1" />
                  <span className="mono-text">{formatTime(workoutData.duration)}</span>
                </div>
              </div>
              <Badge className="bg-purple-500/20 text-purple-300 status-tag">
                {workoutData.trainingType}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-gray-800 p-3 rounded text-center">
                <div className="text-2xl font-medium mono-text">{completedSets}/{totalSets}</div>
                <div className="text-xs text-gray-400 font-medium">Sets</div>
              </div>
              <div className="bg-gray-800 p-3 rounded text-center">
                <div className="text-2xl font-medium mono-text">{Object.keys(workoutData.exercises).length}</div>
                <div className="text-xs text-gray-400 font-medium">Exercises</div>
              </div>
              <div className="bg-gray-800 p-3 rounded text-center">
                <div className="text-2xl font-medium mono-text">{totalVolume}</div>
                <div className="text-xs text-gray-400 font-medium">Volume (lbs)</div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-label text-gray-400 mb-2">Volume by Exercise</h3>
              <div className="bg-gray-800 p-3 rounded-lg h-40">
                <ChartContainer 
                  className="h-full w-full [&_.recharts-cartesian-axis-tick-value]:fill-gray-400 [&_.recharts-cartesian-axis-tick-value]:text-xs [&_.recharts-cartesian-axis-tick-value]:font-mono"
                  config={{
                    volume: { theme: { dark: '#9b87f5', light: '#9b87f5' } }
                  }}
                >
                  <BarChart data={getVolumeChartData()} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <Bar dataKey="volume" name="Volume" fill="var(--color-volume)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ChartContainer>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <h3 className="title-small mb-2">Add Notes</h3>
          <Textarea
            placeholder="How was your workout? Note any PRs or areas to improve..."
            className="bg-gray-900 border-gray-700 h-32"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="mb-8">
          <div 
            className="flex justify-between items-center p-4 bg-gray-900 border border-gray-800 rounded-lg mb-2"
            onClick={() => setSaveAsTemplate(!saveAsTemplate)}
          >
            <div className="flex items-center">
              <Save size={20} className="text-purple-400 mr-3" />
              <span className="font-medium">Save as Template</span>
            </div>
            <div className={`h-6 w-6 rounded-full flex items-center justify-center ${saveAsTemplate ? 'bg-purple-500 text-white' : 'bg-gray-700'}`}>
              {saveAsTemplate && <CheckCircle size={14} />}
            </div>
          </div>
          
          {saveAsTemplate && (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
              <label className="block text-sm font-medium mb-2">Template Name</label>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder={`${workoutData.trainingType} Template`}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <Button
            variant="outline"
            className="border-gray-700 text-white"
            onClick={() => navigate('/')}
          >
            Discard
          </Button>
          <Button
            className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 font-medium"
            onClick={saveWorkout}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Workout"}
          </Button>
        </div>

        <div className="mb-6">
          <h3 className="title-small mb-3">Exercises Completed</h3>
          {Object.keys(workoutData.exercises).map((exercise) => (
            <div key={exercise} className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-3">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{exercise}</h4>
                  <p className="text-sm text-gray-400">
                    {workoutData.exercises[exercise].filter(set => set.completed).length} sets completed
                  </p>
                </div>
                <ChevronRight size={20} className="text-gray-600" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default WorkoutComplete;
