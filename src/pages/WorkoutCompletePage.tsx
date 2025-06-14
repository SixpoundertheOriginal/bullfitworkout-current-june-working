import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { TrainingConfig } from "@/hooks/useTrainingSetupPersistence";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useWorkoutStore } from '@/store/workoutStore';
import { WorkoutCompletion } from "@/components/training/WorkoutCompletion";
import NotesSection from "@/components/workouts/NotesSection";
import { useWorkoutSave } from "@/hooks/useWorkoutSave";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import SaveTemplateSection from "@/components/workouts/SaveTemplateSection";
import { useEffect as useEffectState } from 'react';

export interface WorkoutPageState {
  workoutData?: {
    exercises: Record<string, any[]>;
    duration: number;
    startTime: Date;
    endTime: Date;
    trainingType: string;
    name: string;
    trainingConfig: TrainingConfig | null;
    notes: string;
    metadata: any;
  };
}

export const WorkoutCompletePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Access the workout store
  const { 
    resetWorkout, 
    exercises, 
    elapsedTime,
    isActive,
    setWorkoutStatus
  } = useWorkoutStore();
  
  // Local state for this page
  const [notes, setNotes] = useState("");
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  
  // State from the route transition
  const state = location.state as WorkoutPageState;
  const workoutData = state?.workoutData;
  
  // Initialize the workout save hook
  const { saveWorkout, isSaving, error, isSuccess } = useWorkoutSave();
  
  // When page loads, validate if we have workout data
  useEffectState(() => {
    console.log("Workout Complete Page - Initial State:", { 
      hasWorkoutData: !!workoutData,
      exercises: Object.keys(workoutData?.exercises || {}).length,
      isActive,
      isSaving
    });
    
    if (!workoutData && Object.keys(exercises).length === 0) {
      toast({
        title: "No workout data found",
        description: "Please complete a workout session first",
        variant: "destructive"
      });
      
      // Navigate back to workout page
      navigate('/training-session');
    }
  }, []);

  // Initialize template name from workout data
  useEffect(() => {
    if (workoutData) {
      setTemplateName(workoutData.name || "My Workout");
    }
  }, [workoutData]);

  // Back button handler
  const handleBack = () => {
    setShowDiscardDialog(true);
  };

  // Save workout handler
  const handleSave = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to save your workout",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Prepare the workout data with user notes
      const finalWorkoutData = {
        ...workoutData,
        notes
      };
      
      console.log("Saving workout with data:", finalWorkoutData);
      
      // Save workout using the hook
      saveWorkout(finalWorkoutData);
      
      // Handle template creation if requested
      if (saveAsTemplate) {
        try {
          // Logic for saving template would go here
          console.log("Saving template:", {
            name: templateName,
            description: templateDescription,
            exercises: finalWorkoutData.exercises
          });
          
          toast({
            title: "Template saved!",
            description: "Your workout template has been created"
          });
        } catch (templateError) {
          console.error("Error saving template:", templateError);
          toast({
            title: "Workout saved, but template could not be created",
            description: "There was a problem saving your workout template",
            variant: "destructive"
          });
        }
      }
      
    } catch (error) {
      console.error("Error saving workout:", error);
      toast({
        title: "Error saving workout",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  // Watch for successful save
  useEffect(() => {
    if (isSuccess) {
      console.log("Workout saved successfully");
      toast({
        title: "Workout saved!",
        description: "Your workout has been successfully recorded"
      });
      
      // Navigate after short delay to show the success message
      setTimeout(() => {
        navigate('/overview');
      }, 1500);
    }
  }, [isSuccess, navigate]);

  // Watch for save errors
  useEffect(() => {
    if (error) {
      console.error("Workout save error:", error);
      setIsLoading(false);
    }
  }, [error]);

  // Discard workout handler
  const handleDiscard = () => {
    console.log("Discarding workout");
    // Reset state related to the workout
    resetWorkout();
    
    // Close the dialog
    setShowDiscardDialog(false);
    
    // Show confirmation
    toast({
      title: "Workout discarded",
      description: "Your workout session has been discarded"
    });
    
    // Navigate to home screen
    navigate('/overview');
  };
  
  // Cancel discard and return to training session
  const handleContinueWorkout = () => {
    console.log("Continuing workout");
    // Ensure workout status is set back to active when returning
    setWorkoutStatus('active');
    setShowDiscardDialog(false);
    
    // Navigate back to training session with a flag to indicate we're returning from discard
    navigate('/training-session', { 
      state: { fromDiscard: true }
    });
  };

  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-black text-white p-6">
        <h1 className="text-2xl font-bold mb-4">Error Saving Workout</h1>
        <div className="bg-red-900/30 border border-red-800 p-4 rounded-lg mb-6">
          <p className="text-red-200 mb-2">There was an error saving your workout:</p>
          <p className="font-mono text-sm bg-black/50 p-2 rounded whitespace-pre-wrap">
            {error.message}
          </p>
        </div>
        <div className="flex gap-4 justify-end">
          <Button variant="outline" onClick={() => navigate('/training-session')}>
            Back to Workout
          </Button>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Show loading state
  if (isLoading || isSaving || !workoutData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Processing your workout...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <header className="sticky top-0 z-10 bg-black p-4 border-b border-gray-800 flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleBack}
          className="mr-2"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-semibold flex-1">Complete Workout</h1>
      </header>
      
      <main className="container max-w-3xl mx-auto px-4 py-6">
        <WorkoutCompletion
          exercises={workoutData.exercises}
          duration={workoutData.duration}
          intensity={75} // Default values for required props
          efficiency={80} // Default values for required props
          onComplete={handleSave}
        />
        
        <NotesSection 
          notes={notes}
          setNotes={setNotes}
          className="mb-6"
        />
        
        <SaveTemplateSection
          saveAsTemplate={saveAsTemplate}
          setSaveAsTemplate={setSaveAsTemplate}
          templateName={templateName}
          setTemplateName={setTemplateName}
          workoutData={workoutData}
        />
        
        <div className="flex justify-end gap-4 mt-8">
          <Button 
            variant="outline" 
            onClick={handleBack}
          >
            Back
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading || isSaving}
            className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
          >
            {isLoading || isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Workout"
            )}
          </Button>
        </div>
      </main>
      
      {/* Discard confirmation dialog */}
      <Dialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <DialogContent className="bg-gray-900 text-white">
          <DialogHeader>
            <DialogTitle>Discard Workout?</DialogTitle>
            <DialogDescription>
              Do you want to discard this workout or continue editing it?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowDiscardDialog(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              variant="secondary"
              onClick={handleContinueWorkout}
              className="w-full sm:w-auto"
            >
              Continue Workout
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDiscard}
              className="w-full sm:w-auto"
            >
              Discard Workout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkoutCompletePage;
