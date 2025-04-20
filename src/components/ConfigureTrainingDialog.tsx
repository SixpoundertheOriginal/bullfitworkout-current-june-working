import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { useWorkoutStats } from "@/hooks/useWorkoutStats";
import { TrainingTypeSelector } from "./training/TrainingTypeSelector";
import { AddCustomTrainingType } from "./training/AddCustomTrainingType";
import { WorkoutTagPicker } from "./training/WorkoutTagPicker";
import { DurationSelector } from "./training/DurationSelector";
import { QuickSetupTemplates } from "./training/QuickSetupTemplates";
import { cn } from "@/lib/utils";
import { useWorkoutRecommendations } from "@/hooks/useWorkoutRecommendations";
import { Progress } from "@/components/ui/progress";

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
  const { data: recommendation, isLoading: loadingRecommendation } = useWorkoutRecommendations();

  useEffect(() => {
    if (recommendation && !trainingType) {
      setTrainingType(recommendation.trainingType);
      setDuration(recommendation.duration);
      setSelectedTags(recommendation.tags);
    }
  }, [recommendation]);

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
      toast("Training type required", {
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
        "p-0 overflow-hidden max-w-md max-h-[85vh]",
        "bg-gradient-to-br from-gray-900/95 via-gray-900/98 to-gray-900/95",
        "backdrop-blur-sm border-0",
        "shadow-[0_0_30px_rgba(124,58,237,0.1)]",
        "rounded-2xl"
      )}>
        <ScrollArea className="h-full max-h-[85vh]">
          <div className="p-6 space-y-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Configure Training
              </h2>
              {recommendation && (
                <div className="flex items-center gap-2">
                  <Progress 
                    value={recommendation.confidence * 100}
                    className="w-20 h-2 bg-gray-800/50 [&>div]:bg-purple-500"
                  />
                  <span className="text-xs text-gray-400">
                    {Math.round(recommendation.confidence * 100)}% match
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="text-lg font-semibold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                    Training Type
                  </label>
                  <AddCustomTrainingType />
                </div>
                <TrainingTypeSelector
                  selectedType={trainingType}
                  onSelect={setTrainingType}
                />
              </div>

              <div>
                <label className="text-lg font-semibold mb-3 block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  Training Focus
                </label>
                <WorkoutTagPicker
                  selectedTags={selectedTags}
                  onToggleTag={handleTagToggle}
                  trainingType={trainingType}
                />
              </div>

              <div>
                <label className="text-lg font-semibold mb-3 block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  Duration
                </label>
                <DurationSelector 
                  value={duration} 
                  onChange={setDuration}
                />
              </div>

              <div>
                <label className="text-lg font-semibold mb-3 block bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  Quick Setup Templates
                </label>
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
                  "w-full py-6 text-lg font-medium rounded-xl",
                  "bg-gradient-to-r from-purple-600 to-pink-500",
                  "hover:from-purple-700 hover:to-pink-600",
                  "transform transition-all duration-300",
                  "hover:scale-[1.02] active:scale-[0.98]",
                  "shadow-lg hover:shadow-purple-500/25",
                  "border border-purple-500/20"
                )}
              >
                Start Training
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
