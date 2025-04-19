
import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "@/hooks/use-toast";
import { useWorkoutStats } from "@/hooks/useWorkoutStats";

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
    // Ensure we have at least these common types
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

          <div className="space-y-6">
            <div>
              <label className="block text-base font-medium mb-2">Training Type</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g., Running, Yoga, HIIT..."
                  value={trainingType}
                  onChange={(e) => setTrainingType(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                {trainingType && (
                  <button
                    onClick={() => setTrainingType("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    <X size={16} className="text-gray-400" />
                  </button>
                )}
              </div>
              
              <div className="mt-2 flex flex-wrap gap-2">
                {getRecommendedTypes().map(type => (
                  <button
                    key={type}
                    onClick={() => setTrainingType(type)}
                    className="px-3 py-1 rounded-full text-sm bg-gray-800 text-white hover:bg-gray-700"
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-base font-medium mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {getCommonTags().map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm ${
                      selectedTags.includes(tag)
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "bg-gray-800 text-gray-300 border border-gray-700"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-base font-medium mb-2">Duration (minutes)</label>
              <ToggleGroup 
                type="single" 
                value={duration.toString()} 
                onValueChange={(value) => setDuration(parseInt(value || "30"))}
                className="justify-between"
              >
                <ToggleGroupItem 
                  value="15" 
                  className="w-1/4 data-[state=on]:bg-purple-600 text-white"
                >
                  15
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="30" 
                  className="w-1/4 data-[state=on]:bg-purple-600 text-white"
                >
                  30
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="45" 
                  className="w-1/4 data-[state=on]:bg-purple-600 text-white"
                >
                  45
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="60" 
                  className="w-1/4 data-[state=on]:bg-purple-600 text-white"
                >
                  60
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div>
              <label className="block text-base font-medium mb-2">Quick Setup</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => applyQuickSetup("morning")}
                  className="bg-gray-800 rounded-lg p-3 text-left hover:bg-gray-750 transition-colors border border-gray-700"
                >
                  <h4 className="font-medium text-sm">Morning Cardio</h4>
                  <p className="text-gray-400 text-xs mt-1">30min running session</p>
                </button>
                <button
                  onClick={() => applyQuickSetup("fullbody")}
                  className="bg-gray-800 rounded-lg p-3 text-left hover:bg-gray-750 transition-colors border border-gray-700"
                >
                  <h4 className="font-medium text-sm">Full Body</h4>
                  <p className="text-gray-400 text-xs mt-1">45min strength workout</p>
                </button>
              </div>
            </div>

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
