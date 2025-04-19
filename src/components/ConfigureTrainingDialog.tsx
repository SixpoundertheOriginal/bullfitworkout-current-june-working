import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useWorkoutStats } from "@/hooks/useWorkoutStats";
import { TrainingTypeSelector } from "./training/TrainingTypeSelector";
import { AddCustomTrainingType } from "./training/AddCustomTrainingType";
import { WorkoutTagPicker } from "./training/WorkoutTagPicker";
import { DurationSelector } from "./training/DurationSelector";
import { QuickSetupTemplates } from "./training/QuickSetupTemplates";

interface ConfigureTrainingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartTraining: (config: TrainingConfig) => void;
}

interface TrainingConfig {
  trainingType: string;
  tags: string[];
  duration: number;
}

export function ConfigureTrainingDialog({ 
  open, 
  onOpenChange, 
  onStartTraining 
}: ConfigureTrainingDialogProps) {
  const [trainingType, setTrainingType] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [duration, setDuration] = useState(30);
  const { stats, loading } = useWorkoutStats();

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleStartTraining = () => {
    if (!trainingType) {
      toast({
        title: "Training type required",
        description: "Please select a training type to continue",
        variant: "destructive",
      });
      return;
    }
    
    onStartTraining({
      trainingType,
      tags: selectedTags,
      duration
    });
    
    onOpenChange(false);
  };

  const getRecommendedTypes = () => {
    const types = stats.workoutTypes.slice(0, 3).map(wt => wt.type);
    const commonTypes = ["Running", "Strength", "Yoga"];
    return [...new Set([...types, ...commonTypes])].slice(0, 4);
  };

  const getCommonTags = () => {
    const defaultTags = ["Cardio", "Strength", "Flexibility", "Recovery", "Outdoors"];
    
    if (loading || !stats.tags || stats.tags.length === 0) {
      return defaultTags;
    }
    
    const topTags = stats.tags.slice(0, 5).map(t => t.name);
    return [...new Set([...topTags, ...defaultTags])].slice(0, 5);
  };

  const applyQuickSetup = (preset: "morning" | "fullbody") => {
    if (preset === "morning") {
      setTrainingType("Running");
      setSelectedTags(["Cardio", "Morning"]);
      setDuration(30);
    } else {
      setTrainingType("Strength");
      setSelectedTags(["Strength", "Full Body"]);
      setDuration(45);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden max-w-md bg-gray-900 border-0">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Configure Training</h2>
          </div>

          <div className="space-y-8">
            <div>
              <label className="block text-base font-medium mb-2">Quick Setup</label>
              <QuickSetupTemplates
                onSelect={({ trainingType, tags, duration }) => {
                  setTrainingType(trainingType);
                  setSelectedTags(tags);
                  setDuration(duration);
                }}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-base font-medium">Training Type</label>
                <AddCustomTrainingType />
              </div>
              
              <TrainingTypeSelector
                selectedType={trainingType}
                onSelect={setTrainingType}
              />
            </div>

            <div>
              <label className="block text-base font-medium mb-2">Tags</label>
              <WorkoutTagPicker
                selectedTags={selectedTags}
                onToggleTag={handleTagToggle}
                trainingType={trainingType}
              />
            </div>

            <DurationSelector 
              value={duration} 
              onChange={setDuration}
            />

            <Button 
              onClick={handleStartTraining}
              className="w-full py-3 font-medium bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white rounded-lg"
            >
              Start Training
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
