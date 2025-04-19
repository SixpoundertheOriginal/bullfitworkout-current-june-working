
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { useWorkoutStats } from "@/hooks/useWorkoutStats";
import { TrainingTypeSelector } from "./training/TrainingTypeSelector";
import { AddCustomTrainingType } from "./training/AddCustomTrainingType";
import { WorkoutTagPicker } from "./training/WorkoutTagPicker";
import { DurationSelector } from "./training/DurationSelector";
import { QuickSetupTemplates } from "./training/QuickSetupTemplates";
import { cn } from "@/lib/utils";

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

const getGradientByType = (type: string) => {
  const gradients = {
    "Strength": "from-purple-600/20 via-purple-500/10 to-pink-500/20",
    "Cardio": "from-red-600/20 via-orange-500/10 to-yellow-500/20",
    "Yoga": "from-green-600/20 via-emerald-500/10 to-teal-500/20",
    "Calisthenics": "from-blue-600/20 via-blue-500/10 to-indigo-500/20",
    "default": "from-gray-600/20 via-gray-500/10 to-slate-500/20"
  };
  
  return gradients[type] || gradients.default;
};

export function ConfigureTrainingDialog({ 
  open, 
  onOpenChange, 
  onStartTraining 
}: ConfigureTrainingDialogProps) {
  const [trainingType, setTrainingType] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [duration, setDuration] = useState(30);
  const { stats, loading } = useWorkoutStats();
  const [bgGradient, setBgGradient] = useState(getGradientByType("default"));

  useEffect(() => {
    setBgGradient(getGradientByType(trainingType));
  }, [trainingType]);

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "p-0 overflow-hidden max-w-md border-0 shadow-xl",
        "bg-gradient-to-br bg-gray-900/95 backdrop-blur-sm",
        "transition-all duration-500 ease-out",
        bgGradient
      )}>
        <div className="p-6 space-y-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white">Configure Training</h2>
          </div>

          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="block text-base font-medium text-white/90">Training Type</label>
                <AddCustomTrainingType />
              </div>
              
              <TrainingTypeSelector
                selectedType={trainingType}
                onSelect={setTrainingType}
              />
            </div>

            <div>
              <label className="block text-base font-medium mb-2 text-white/90">Tags</label>
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

            <div>
              <label className="block text-base font-medium mb-2 text-white/90">Quick Setup</label>
              <QuickSetupTemplates
                onSelect={({ trainingType, tags, duration }) => {
                  setTrainingType(trainingType);
                  setSelectedTags(tags);
                  setDuration(duration);
                }}
              />
            </div>

            <Button 
              onClick={handleStartTraining}
              className={cn(
                "w-full py-3 font-medium text-white rounded-lg",
                "bg-gradient-to-r from-purple-600 to-pink-500",
                "hover:from-purple-700 hover:to-pink-600",
                "transform transition-all duration-300",
                "hover:scale-[1.02] active:scale-[0.98]",
                "shadow-lg hover:shadow-purple-500/25"
              )}
            >
              Start Training
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
