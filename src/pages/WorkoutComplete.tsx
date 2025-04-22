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
  ChevronRight,
  Weight
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useWeightUnit } from "@/context/WeightUnitContext";
import { WeightUnitToggle } from "@/components/WeightUnitToggle";
import { convertWeight, formatWeightWithUnit } from "@/utils/unitConversion";
import { TrainingType, isValidTrainingType, trainingTypes } from "@/components/TrainingTypeTag";

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
  const { weightUnit } = useWeightUnit();
  
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
  const [navigatePending, setNavigatePending] = useState<{
    pending: boolean;
    exerciseName: string | null;
  }>({ pending: false, exerciseName: null });

  useEffect(() => {
    if (location.state?.workoutId) {
      setWorkoutId(location.state.workoutId);
    }
    
    if (location.state?.workoutData) {
      setWorkoutData(location.state.workoutData);
      // Set a default template name based on the workout name or training type
      if (location.state.workoutData.name) {
        setTemplateName(location.state.workoutData.name);
      } else if (location.state.workoutData.trainingType) {
        setTemplateName(`${location.state.workoutData.trainingType} Template`);
      }
    } else {
      toast({
        title: "No workout data found",
        description: "Please complete a workout session first",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [location.state, navigate]);
  
  useEffect(() => {
    if (navigatePending.pending && workoutId && navigatePending.exerciseName) {
      console.log(`Now navigating to details with workout ID: ${workoutId}`);
      navigate(`/workout-details/${workoutId}`, {
        state: { highlightExercise: navigatePending.exerciseName }
      });
      setNavigatePending({ pending: false, exerciseName: null });
    }
  }, [navigatePending, workoutId, navigate]);

  const totalVolume = workoutData ? Object.keys(workoutData.exercises).reduce((total, exercise) => {
    return total + workoutData.exercises[exercise].reduce((exerciseTotal, set) => {
      if (set.completed) {
        const convertedWeight = convertWeight(set.weight, "lb", weightUnit);
        return exerciseTotal + (convertedWeight * set.reps);
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
    if (!workoutData) return null;
    
    setSaving(true);
    
    try {
      // If the workout is already saved (we have a workoutId),
      // just update it with notes
      if (workoutId && user) {
        try {
          const { error: updateError } = await supabase
            .from('workout_sessions')
            .update({
              notes: notes || null
            })
            .eq('id', workoutId);

          if (updateError) {
            console.error("Error updating workout notes:", updateError);
            throw updateError;
          }

          // Save as template if requested
          if (saveAsTemplate) {
            await saveWorkoutTemplate();
          }
          
          setSavingStats({
            completed: true,
            error: false
          });
          
          toast({
            title: "Workout updated!",
            description: "Your workout notes have been saved"
          });
          
          return workoutId;
        } catch (error) {
          console.error("Error updating workout:", error);
          setSavingStats({
            completed: true,
            error: true
          });
          
          toast({
            title: "Error updating workout",
            description: "There was a problem saving your workout notes",
            variant: "destructive",
          });
          
          return null;
        }
      }
      
      // If no workoutId or user, we need to create a new workout
      if (!user) {
        toast({
          title: "Please log in",
          description: "You need to be logged in to save workouts",
          variant: "destructive",
        });
        setSaving(false);
        return null;
      }
      
      const trainingTypeValue = isValidTrainingType(workoutData.trainingType) 
        ? workoutData.trainingType 
        : 'Strength';
      
      console.log("Saving new workout with data:", {
        user_id: user.id,
        name: workoutData.name || workoutData.trainingType || "Workout",
        training_type: trainingTypeValue,
        start_time: workoutData.startTime.toISOString(),
        end_time: workoutData.endTime.toISOString(),
        duration: workoutData.duration || 0,
        notes: notes || null
      });
      
      // Create the workout session
      const { data: workoutSession, error: workoutError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          name: workoutData.name || workoutData.trainingType || "Workout",
          training_type: trainingTypeValue,
          start_time: workoutData.startTime.toISOString(),
          end_time: workoutData.endTime.toISOString(),
          duration: workoutData.duration || 0,
          notes: notes || null
        })
        .select('id')
        .single();

      if (workoutError) {
        console.error("Error saving workout session:", workoutError);
        throw workoutError;
      }
      
      if (workoutSession) {
        setWorkoutId(workoutSession.id);
        
        try {
          // Build the exercise sets array
          await saveExerciseSets(workoutSession.id);
          
          // Save as template if requested
          if (saveAsTemplate) {
            try {
              await saveWorkoutTemplate(workoutSession.id);
            } catch (templateError) {
              console.error("Error saving workout template:", templateError);
              // Don't throw here, we still want the workout to be considered saved
              toast({
                title: "Workout saved, but template could not be created",
                description: "There was a problem saving your workout template",
                variant: "default",
              });
            }
          }
          
          setSavingStats({
            completed: true,
            error: false
          });
          
          toast({
            title: "Workout saved!",
            description: "Your workout has been successfully recorded"
          });
          
          return workoutSession.id;
        } catch (exerciseError) {
          console.error("Error saving exercise sets:", exerciseError);
          
          // Still return the workout ID since the workout session was created successfully
          toast({
            title: "Workout saved with limited details",
            description: "Your workout was saved but we couldn't save all exercise details",
            variant: "default",
          });
          
          return workoutSession.id;
        }
      }
      
      return null;
    } catch (error: any) {
      console.error("Error saving workout:", error);
      setSavingStats({
        completed: true,
        error: true
      });
      
      let errorMessage = "There was a problem saving your workout data";
      
      // Special handling for the jsonb_set error
      if (error.message && error.message.includes("jsonb_set") && error.message.includes("does not exist")) {
        errorMessage = "Workout saved, but we couldn't update your experience points. This will be fixed soon.";
        
        // If we have a workoutId, consider the save successful despite the error
        if (workoutId) {
          toast({
            title: "Workout partially saved",
            description: errorMessage,
            variant: "default",
          });
          
          return workoutId;
        }
      }
      
      toast({
        title: "Error saving workout",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setSaving(false);
    }
  };
  
  const saveExerciseSets = async (sessionId: string) => {
    if (!workoutData) return;
    
    try {
      // Build the exercise sets array
      const exerciseSets = [];
      
      for (const [exerciseName, sets] of Object.entries(workoutData.exercises)) {
        sets.forEach((set, index) => {
          // Only include completed sets to reduce database load
          if (set.completed) {
            exerciseSets.push({
              workout_id: sessionId,
              exercise_name: exerciseName,
              weight: set.weight || 0,
              reps: set.reps || 0,
              set_number: index + 1,
              completed: true
            });
          }
        });
      }
      
      // Skip if no sets to save
      if (exerciseSets.length === 0) {
        console.log("No completed sets to save");
        return;
      }
      
      // Split into smaller batches to avoid request size limits
      const batchSize = 25;
      const batches = [];
      
      for (let i = 0; i < exerciseSets.length; i += batchSize) {
        batches.push(exerciseSets.slice(i, i + batchSize));
      }
      
      // Process each batch sequentially
      for (const batch of batches) {
        const { error: batchError } = await supabase
          .from('exercise_sets')
          .insert(batch);
          
        if (batchError) {
          console.error("Error saving exercise set batch:", batchError);
          // Continue with next batch rather than stopping completely
        }
      }
    } catch (error) {
      console.error("Error saving exercise sets:", error);
      // Don't throw here, we still want to consider the workout saved
    }
  };
  
  const saveWorkoutTemplate = async (sessionId?: string) => {
    if (!user || !workoutData) return;
    
    try {
      const validTrainingType = isValidTrainingType(workoutData.trainingType)
        ? workoutData.trainingType
        : 'Strength';
      
      // Instead of using jsonb_set in the database, we'll just store the data directly
      const { error: templateError } = await supabase
        .from('workout_templates')
        .insert({
          name: templateName || `${workoutData.trainingType || 'Workout'} Template`,
          description: `Created from workout on ${new Date().toLocaleDateString()}`,
          training_type: validTrainingType,
          exercises: JSON.stringify(workoutData.exercises),
          created_by: user.id,
          estimated_duration: workoutData.duration || 0
        });
        
      if (templateError) {
        console.error("Error saving workout template:", templateError);
        throw templateError;
      } else {
        toast({
          title: "Template saved!",
          description: "Your workout template has been created",
          variant: "default",
        });
      }
    } catch (templateError) {
      console.error("Error saving workout template:", templateError);
      throw templateError;
    }
  };

  const getVolumeChartData = () => {
    if (!workoutData) return [];
    
    return Object.keys(workoutData.exercises).map(exercise => {
      const totalExerciseVolume = workoutData.exercises[exercise].reduce((total, set) => {
        if (set.completed) {
          const convertedWeight = convertWeight(set.weight || 0, "lb", weightUnit);
          return total + (convertedWeight * (set.reps || 0));
        }
        return total;
      }, 0);
      
      return {
        name: exercise,
        volume: Math.round(totalExerciseVolume * 10) / 10
      };
    });
  };

  const handleExerciseClick = async (exerciseName: string) => {
    if (!workoutId) {
      console.log("No workout ID available yet, saving workout first");
      setNavigatePending({ pending: true, exerciseName });
      await saveWorkout();
    } else {
      console.log(`Navigating to details with workout ID: ${workoutId}`);
      navigate(`/workout-details/${workoutId}`, {
        state: { highlightExercise: exerciseName }
      });
    }
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
        <WeightUnitToggle variant="badge" />
      </header>

      <main className="flex-1 overflow-auto px-4 py-6">
        <Card className="bg-gray-900 border-gray-800 mb-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="training-type-primary">{workoutData?.name || workoutData?.trainingType}</h2>
                <div className="training-metadata">
                  <Calendar size={14} />
                  <span>{new Date().toLocaleDateString()}</span>
                  <Clock size={14} />
                  <span className="mono-text">{formatTime(workoutData?.duration || 0)}</span>
                </div>
              </div>
              <Badge className="training-type-tag">
                {workoutData?.trainingType}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="bg-gray-800 p-3 rounded text-center">
                <div className="text-2xl font-medium mono-text">{completedSets}/{totalSets}</div>
                <div className="text-xs text-gray-400 font-medium">Sets</div>
              </div>
              <div className="bg-gray-800 p-3 rounded text-center">
                <div className="text-2xl font-medium mono-text">{Object.keys(workoutData?.exercises || {}).length}</div>
                <div className="text-xs text-gray-400 font-medium">Exercises</div>
              </div>
              <div className="bg-gray-800 p-3 rounded text-center">
                <div className="text-2xl font-medium mono-text">
                  {Math.round(totalVolume * 10) / 10} <span className="text-sm text-gray-400">{weightUnit}</span>
                </div>
                <div className="text-xs text-gray-400 font-medium">Volume</div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-label text-gray-400 mb-2">
                Volume by Exercise <span className="text-xs">({weightUnit})</span>
              </h3>
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
                    <Tooltip 
                      formatter={(value) => [`${value} ${weightUnit}`, 'Volume']}
                      labelFormatter={(label) => `Exercise: ${label}`}
                    />
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
                placeholder={`${workoutData?.trainingType} Template`}
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
          {Object.keys(workoutData?.exercises || {}).map((exercise) => (
            <div 
              key={exercise} 
              className="bg-gray-900 border border-gray-800 rounded-lg p-4 mb-3 cursor-pointer hover:bg-gray-800/70 transition-all duration-200"
              onClick={() => handleExerciseClick(exercise)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{exercise}</h4>
                  <p className="text-sm text-gray-400">
                    {workoutData?.exercises[exercise].filter(set => set.completed).length} sets completed
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
