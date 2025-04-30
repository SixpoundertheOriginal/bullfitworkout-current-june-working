import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { WeightUnitToggle } from "@/components/WeightUnitToggle";
import { toast } from "@/components/ui/sonner";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { convertWeight, formatWeightWithUnit } from "@/utils/unitConversion";
import { isValidTrainingType } from "@/components/TrainingTypeTag";
import WorkoutSummaryCard from "@/components/workouts/WorkoutSummaryCard";
import { VolumeByExerciseChart } from "@/components/workouts/VolumeByExerciseChart";
import NotesSection from "@/components/workouts/NotesSection";
import SaveTemplateSection from "@/components/workouts/SaveTemplateSection";
import ExercisesCompletedList from "@/components/workouts/ExercisesCompletedList";
import { useWeightUnit } from "@/context/WeightUnitContext";
import { recoverPartialWorkout } from "@/services/workoutService";
import { WorkoutSaveStatus } from "@/components/WorkoutSaveStatus";
import { WorkoutStatus } from "@/types/workout";
import { useWorkoutStore } from '@/store/workoutStore';

interface ExerciseSet {
  weight: number;
  reps: number;
  restTime: number;
  completed: boolean;
  isEditing?: boolean;
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
  notes?: string;
  trainingConfig?: {
    tags?: string[];
    duration?: number;
    timeOfDay?: string;
    intensity?: number;
  };
}

export const WorkoutCompletePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { weightUnit } = useWeightUnit();
  const { resetSession, explicitlyEnded } = useWorkoutStore();

  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [workoutData, setWorkoutData] = useState<WorkoutData | null>(null);
  const [workoutId, setWorkoutId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<WorkoutStatus>('idle');
  const [savingStats, setSavingStats] = useState({
    completed: false,
    error: false
  });
  const [navigatePending, setNavigatePending] = useState<{
    pending: boolean;
    exerciseName: string | null;
  }>({ pending: false, exerciseName: null });

  useEffect(() => {
    // Check if workout is already ended to avoid double-ending
    if (!explicitlyEnded) {
      console.log('Ending workout on WorkoutCompletePage mount');
      // This will mark the workout as ended but preserve data for potential saving
      useWorkoutStore.getState().endWorkout();
    }
    
    if (location.state?.workoutId) setWorkoutId(location.state.workoutId);
    if (location.state?.workoutData) {
      setWorkoutData(location.state.workoutData);
      if (location.state.workoutData.name) setTemplateName(location.state.workoutData.name);
      else if (location.state.workoutData.trainingType)
        setTemplateName(`${location.state.workoutData.trainingType} Template`);
      
      if (location.state.workoutData.notes) {
        setNotes(location.state.workoutData.notes);
      }
    } else {
      toast("No workout data found - Please complete a workout session first");
      navigate("/");
    }
  }, [location.state, navigate, explicitlyEnded]);

  useEffect(() => {
    if (navigatePending.pending && workoutId && navigatePending.exerciseName) {
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
    setSaveStatus('saving');
    
    try {
      if (workoutId && user) {
        try {
          const { error: updateError } = await supabase
            .from('workout_sessions')
            .update({
              notes: notes || null,
              metadata: workoutData.trainingConfig ? 
                JSON.stringify({
                  trainingConfig: workoutData.trainingConfig
                }) : null
            })
            .eq('id', workoutId);

          if (updateError) {
            if (updateError.message && updateError.message.includes("materialized view")) {
              console.warn("Materialized view error during update:", updateError.message);
              
              toast("Notes saved with limited analytics - Your workout notes were saved but some analytics couldn't be processed");
              
              setSavingStats({
                completed: true,
                error: false
              });
              
              setSaveStatus('saved');
              return workoutId;
            }
            
            console.error("Error updating workout notes:", updateError);
            throw updateError;
          }

          if (saveAsTemplate) {
            try {
              await saveWorkoutTemplate();
              toast("Template saved! - Your workout template has been created");
            } catch (templateError) {
              console.error("Error saving workout template:", templateError);
              toast("Workout saved, but template could not be created - There was a problem saving your workout template");
            }
          }
          
          setSavingStats({
            completed: true,
            error: false
          });
          
          setSaveStatus('saved');
          toast("Workout updated! - Your workout notes have been saved");
          
          return workoutId;
        } catch (error) {
          console.error("Error updating workout:", error);
          
          if (error instanceof Error && error.message.includes("materialized view")) {
            toast("Notes partially saved - Your workout notes were recorded but analytics couldn't be updated");
            
            setSavingStats({
              completed: true,
              error: false
            });
            
            setSaveStatus('partial');
            return workoutId;
          }
          
          setSavingStats({
            completed: true,
            error: true
          });
          
          setSaveStatus('failed');
          toast.error("Error updating workout - There was a problem saving your workout notes");
          
          return null;
        } finally {
          setSaving(false);
        }
      }
      
      if (!user) {
        toast.error("Please log in - You need to be logged in to save workouts");
        setSaving(false);
        setSaveStatus('failed');
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
        notes: notes || null,
        metadata: workoutData.trainingConfig ? 
          JSON.stringify({
            trainingConfig: workoutData.trainingConfig
          }) : null
      });
      
      try {
        const { data: workoutSession, error: workoutError } = await supabase
          .from('workout_sessions')
          .insert({
            user_id: user.id,
            name: workoutData.name || workoutData.trainingType || "Workout",
            training_type: trainingTypeValue,
            start_time: workoutData.startTime.toISOString(),
            end_time: workoutData.endTime.toISOString(),
            duration: workoutData.duration || 0,
            notes: notes || null,
            metadata: workoutData.trainingConfig ? 
              JSON.stringify({
                trainingConfig: workoutData.trainingConfig
              }) : null
          })
          .select('id')
          .single();
  
        if (workoutError) {
          if (workoutError.message && workoutError.message.includes("materialized view")) {
            console.warn("Materialized view error detected:", workoutError.message);
            toast("Workout partially saved - There was an issue with analytics processing, but your workout will be saved.");
            
            try {
              const { data: latestWorkout } = await supabase
                .from('workout_sessions')
                .select('id')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
                
              if (latestWorkout) {
                setWorkoutId(latestWorkout.id);
                
                try {
                  await saveExerciseSets(latestWorkout.id);
                  
                  await recoverPartialWorkout(latestWorkout.id);
                } catch (exerciseError) {
                  console.error("Error saving exercise sets:", exerciseError);
                }
                
                setSavingStats({
                  completed: true,
                  error: false
                });
                
                setSaveStatus('saved');
                return latestWorkout.id;
              }
            } catch (recoveryError) {
              console.error("Error recovering workout ID:", recoveryError);
            }
          }
          
          console.error("Error saving workout session:", workoutError);
          throw workoutError;
        }
        
        if (workoutSession) {
          setWorkoutId(workoutSession.id);
          
          try {
            await saveExerciseSets(workoutSession.id);
          } catch (exerciseError) {
            console.error("Error saving exercise sets:", exerciseError);
            toast("Workout saved with limited details - We couldn't save all exercise details, but your workout was recorded");
          }
          
          if (saveAsTemplate) {
            try {
              await saveWorkoutTemplate(workoutSession.id);
              toast("Template saved! - Your workout template has been created");
            } catch (templateError) {
              console.error("Error saving workout template:", templateError);
              toast("Workout saved, but template could not be created - There was a problem saving your workout template");
            }
          }
          
          setSavingStats({
            completed: true,
            error: false
          });
          
          setSaveStatus('saved');
          toast("Workout saved! - Your workout has been successfully recorded");
          
          return workoutSession.id;
        }
      } catch (error: any) {
        console.error("Error saving workout session:", error);
        
        if (error.message && error.message.includes("jsonb_set") && error.message.includes("does not exist")) {
          console.warn("Possible experience points update issue:", error.message);
          toast("Workout may have been saved - There was an issue with the experience points system, but your workout data was sent to the server.");
          
          try {
            const { data: latestWorkout } = await supabase
              .from('workout_sessions')
              .select('id')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .single();
              
            if (latestWorkout) {
              setWorkoutId(latestWorkout.id);
              
              try {
                await saveExerciseSets(latestWorkout.id);
                
                await recoverPartialWorkout(latestWorkout.id);
              } catch (exerciseError) {
                console.error("Error during recovery process:", exerciseError);
              }
              
              setSaveStatus('saved');
              return latestWorkout.id;
            }
          } catch (recoveryError) {
            console.error("Error recovering workout ID:", recoveryError);
          }
        } else {
          setSavingStats({
            completed: true,
            error: true
          });
          
          setSaveStatus('failed');
          toast.error("Error saving workout - There was a problem saving your workout data. Please try again.");
        }
      }
      
      return null;
    } catch (error: any) {
      console.error("Error in saveWorkout function:", error);
      setSavingStats({
        completed: true,
        error: true
      });
      
      setSaveStatus('failed');
      toast.error("Error saving workout - An unexpected error occurred while saving your workout");
      
      return null;
    } finally {
      setSaving(false);
    }
  };
  
  const saveExerciseSets = async (sessionId: string) => {
    if (!workoutData) return;
    
    try {
      const exerciseSets = [];
      
      for (const [exerciseName, sets] of Object.entries(workoutData.exercises)) {
        sets.forEach((set, index) => {
          exerciseSets.push({
            workout_id: sessionId,
            exercise_name: exerciseName,
            weight: set.weight || 0,
            reps: set.reps || 0,
            set_number: index + 1,
            completed: set.completed || false,
            rest_time: set.restTime || 60
          });
        });
      }
      
      if (exerciseSets.length === 0) {
        console.log("No sets to save");
        return;
      }
      
      const batchSize = 25;
      const batches = [];
      
      for (let i = 0; i < exerciseSets.length; i += batchSize) {
        batches.push(exerciseSets.slice(i, i + batchSize));
      }
      
      let errorCount = 0;
      for (const batch of batches) {
        try {
          const { error: batchError } = await supabase
            .from('exercise_sets')
            .insert(batch);
            
          if (batchError) {
            console.error("Error saving exercise set batch:", batchError);
            errorCount++;
          }
        } catch (batchError) {
          console.error("Exception saving exercise set batch:", batchError);
          errorCount++;
        }
      }
      
      if (errorCount > 0) {
        console.warn(`${errorCount} batches failed to save properly`);
      }
    } catch (error) {
      console.error("Error saving exercise sets:", error);
    }
  };
  
  const saveWorkoutTemplate = async (sessionId?: string) => {
    if (!user || !workoutData) return;
    
    try {
      const validTrainingType = isValidTrainingType(workoutData.trainingType)
        ? workoutData.trainingType
        : 'Strength';
      
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

  const handleSaveAndExit = async () => {
    setSaving(true);
    setSaveStatus('saving');
    try {
      const savedWorkoutId = await saveWorkout();
      if (savedWorkoutId) {
        toast("Workout saved successfully");
        
        resetSession();
        
        navigate(`/workout-details/${savedWorkoutId}`, {
          state: { from: 'workout-complete' }
        });
      }
    } catch (error) {
      console.error("Error saving workout:", error);
      toast.error("Failed to save workout");
      setSaveStatus('failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => {
    // Fully terminate the workout session
    resetSession();
    
    // Show confirmation toast
    toast.success("Workout discarded", {
      description: "Your workout session has been terminated"
    });
    
    // Navigate to main dashboard
    navigate('/');
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
          onClick={() => {
            resetSession();
            navigate('/');
          }}
          className="p-2 rounded-full hover:bg-gray-900"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="title-large">Workout Complete</h1>
        <WeightUnitToggle variant="badge" />
      </header>

      <main className="flex-1 overflow-auto px-4 py-6">
        {saveStatus !== 'idle' && (
          <div className="mb-4">
            <WorkoutSaveStatus 
              status={saveStatus}
              className="mb-4"
            />
          </div>
        )}
        
        <WorkoutSummaryCard 
          workoutData={workoutData} 
          completedSets={completedSets}
          totalSets={totalSets}
          totalVolume={totalVolume}
          weightUnit={weightUnit}
        />
        <VolumeByExerciseChart 
          workoutData={workoutData}
          weightUnit={weightUnit}
        />
        <NotesSection
          notes={notes}
          setNotes={setNotes}
        />
        <SaveTemplateSection
          saveAsTemplate={saveAsTemplate}
          setSaveAsTemplate={setSaveAsTemplate}
          templateName={templateName}
          setTemplateName={setTemplateName}
          workoutData={workoutData}
        />
        <div className="grid grid-cols-3 gap-3 mb-6">
          <button
            className="btn btn-outline border-gray-700 text-white"
            onClick={handleDiscard}
          >
            Discard
          </button>
          <button
            className="bg-purple-600 hover:bg-purple-700 font-medium rounded-md px-4 py-3 transition disabled:opacity-700"
            onClick={handleSaveAndExit}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save & Exit"}
          </button>
          <button
            className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 font-medium rounded-md px-4 py-3 transition disabled:opacity-70"
            onClick={saveWorkout}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Workout"}
          </button>
        </div>
        <ExercisesCompletedList
          exercises={workoutData.exercises}
          workoutId={workoutId}
          handleExerciseClick={handleExerciseClick}
        />
      </main>
    </div>
  );
};
