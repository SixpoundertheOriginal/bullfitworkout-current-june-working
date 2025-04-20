
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
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

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

enum ConfigurationStep {
  TrainingType = 0,
  TrainingFocus = 1,
  Duration = 2,
  Review = 3
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
  const [currentStep, setCurrentStep] = useState<ConfigurationStep>(ConfigurationStep.TrainingType);
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

  useEffect(() => {
    if (open) {
      // Reset to first step when dialog opens
      setCurrentStep(ConfigurationStep.TrainingType);
    }
  }, [open]);

  const handleTagToggle = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleStartTraining = () => {
    if (!trainingType) {
      toast.error("Training type required", {
        description: "Please select a training type to continue"
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

  const handleNextStep = () => {
    if (currentStep === ConfigurationStep.TrainingType && !trainingType) {
      toast.error("Training type required", {
        description: "Please select a training type to continue"
      });
      return;
    }

    if (currentStep < ConfigurationStep.Review) {
      setCurrentStep(currentStep + 1);
    } else {
      handleStartTraining();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > ConfigurationStep.TrainingType) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        {[0, 1, 2, 3].map((step) => (
          <div 
            key={step} 
            className={cn(
              "h-2 rounded-full transition-all duration-300",
              step === currentStep 
                ? "w-8 bg-purple-500" 
                : step < currentStep 
                  ? "w-4 bg-purple-500/70" 
                  : "w-4 bg-gray-700"
            )}
          />
        ))}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case ConfigurationStep.TrainingType:
        return (
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
          </div>
        );
      
      case ConfigurationStep.TrainingFocus:
        return (
          <div className="space-y-8">
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
          </div>
        );
      
      case ConfigurationStep.Duration:
        return (
          <div className="space-y-8">
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
          </div>
        );
      
      case ConfigurationStep.Review:
        return (
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Review Your Training
              </h3>
              
              <div className="rounded-lg bg-black/30 p-4 space-y-3 border border-white/10">
                <div className="flex justify-between">
                  <span className="text-gray-400">Training Type:</span>
                  <span className="font-medium text-white">{trainingType}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Duration:</span>
                  <span className="font-medium text-white">{duration} minutes</span>
                </div>
                
                <div>
                  <span className="text-gray-400 block mb-2">Training Focus:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.length > 0 ? (
                      selectedTags.map(tag => (
                        <span 
                          key={tag} 
                          className="px-2 py-1 rounded-full text-xs bg-purple-500/20 border border-purple-500/40 text-purple-200"
                        >
                          {tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500 italic">No tags selected</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case ConfigurationStep.TrainingType:
        return "Select Training Type";
      case ConfigurationStep.TrainingFocus:
        return "Choose Training Focus";
      case ConfigurationStep.Duration:
        return "Set Duration & Templates";
      case ConfigurationStep.Review:
        return "Review & Start Training";
      default:
        return "Configure Training";
    }
  };

  const getNextButtonText = () => {
    return currentStep === ConfigurationStep.Review ? "Start Training" : "Next";
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
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                {getStepTitle()}
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

            {renderStepIndicator()}
            {renderStepContent()}
            
            <div className="flex items-center justify-between mt-8">
              <Button 
                onClick={handlePrevStep}
                disabled={currentStep === ConfigurationStep.TrainingType}
                variant="outline"
                className={cn(
                  "rounded-xl",
                  "border border-gray-700",
                  "bg-black/30 hover:bg-black/50",
                  "text-white/80"
                )}
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back
              </Button>
              
              <Button 
                onClick={handleNextStep}
                className={cn(
                  "rounded-xl",
                  "bg-gradient-to-r from-purple-600 to-pink-500",
                  "hover:from-purple-700 hover:to-pink-600",
                  "transform transition-all duration-300",
                  "shadow-lg hover:shadow-purple-500/25",
                  "border border-purple-500/20"
                )}
              >
                {getNextButtonText()}
                {currentStep === ConfigurationStep.Review ? (
                  <Check className="w-5 h-5 ml-1" />
                ) : (
                  <ChevronRight className="w-5 h-5 ml-1" />
                )}
              </Button>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
