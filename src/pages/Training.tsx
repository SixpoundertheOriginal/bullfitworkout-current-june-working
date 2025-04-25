import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { ConfigureTrainingDialog } from "@/components/ConfigureTrainingDialog";
import { TrainingSession } from "@/components/training/TrainingSession";
import { Button } from "@/components/ui/button";
import { ArrowRight, Flame, Dumbbell } from "lucide-react";
import { useWorkoutState } from "@/hooks/useWorkoutState";
import { useTrainingSetupPersistence } from "@/hooks/useTrainingSetupPersistence";

const TrainingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [trainingConfig, setTrainingConfig] = useState(null);
  const [workoutActive, setWorkoutActive] = useState(false);
  const { resetSession } = useWorkoutState();
  const { storedConfig, isLoading, saveConfig } = useTrainingSetupPersistence();

  useEffect(() => {
    if (storedConfig && !trainingConfig && !workoutActive) {
      toast({
        title: "Saved configuration found",
        description: "We've restored your previous training setup",
      });
    }
  }, [storedConfig, trainingConfig, workoutActive]);

  const handleStartTraining = (config) => {
    saveConfig(config);
    setTrainingConfig(config);
    setWorkoutActive(true);
  };

  const handleCompleteWorkout = () => {
    setWorkoutActive(false);
    navigate("/workout-complete", {
      state: {
        workoutData: {
          trainingType: trainingConfig?.trainingType || "Strength",
          tags: trainingConfig?.tags || [],
          duration: trainingConfig?.duration || 30,
        },
      },
    });
  };

  const handleCancelWorkout = () => {
    setWorkoutActive(false);
    resetSession();
    toast({
      title: "Workout cancelled",
      description: "Your workout session has been cancelled.",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="flex justify-between items-center p-4 border-b border-gray-800">
        <h1 className="title-large">Training Session</h1>
      </header>

      <main className="flex-1 overflow-auto p-4">
        {!workoutActive ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Button
              variant="gradient"
              className="w-full max-w-md"
              onClick={() => setIsConfiguring(true)}
            >
              Start New Workout
            </Button>
          </div>
        ) : (
          <TrainingSession
            trainingConfig={trainingConfig}
            onComplete={handleCompleteWorkout}
            onCancel={handleCancelWorkout}
          />
        )}
      </main>

      <ConfigureTrainingDialog
        open={isConfiguring}
        onOpenChange={setIsConfiguring}
        onStartTraining={handleStartTraining}
        initialConfig={storedConfig}
      />
    </div>
  );
};

export default TrainingPage;
export { TrainingPage };
