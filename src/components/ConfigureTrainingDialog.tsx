
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
import { ChevronLeft, ChevronRight, Check, X, Info, Dumbbell, Bike, Heart, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { typography } from "@/lib/typography";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

// Animation variants for page transitions
const pageVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
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

  const steps = [
    { title: "Type", description: "Select training type" },
    { title: "Focus", description: "Choose your focus areas" },
    { title: "Duration", description: "Set session length" },
    { title: "Review", description: "Confirm & start" }
  ];

  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-between mb-8 relative">
        {/* Progress Bar Background */}
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-800 -translate-y-1/2 z-0" />
        
        {/* Progress Bar Fill */}
        <div 
          className="absolute top-1/2 left-0 h-0.5 bg-gradient-to-r from-purple-500 via-purple-400 to-pink-500 -translate-y-1/2 z-0"
          style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
        />
        
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isActive = index === currentStep;
          
          return (
            <div key={index} className="z-10 flex flex-col items-center">
              <motion.div 
                initial={{ scale: 1 }}
                animate={{ 
                  scale: isActive ? 1.1 : 1,
                  boxShadow: isActive ? '0 0 15px rgba(168, 85, 247, 0.5)' : 'none'
                }}
                className={cn(
                  "relative w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300",
                  isActive ? 
                    "bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-white/20" : 
                    isCompleted ? 
                      "bg-purple-600 border border-purple-400/30" : 
                      "bg-gray-800/80 border border-gray-700"
                )}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5 text-white" />
                ) : (
                  <span className={cn(
                    isActive ? typography.text.primary : typography.text.muted
                  )}>
                    {index + 1}
                  </span>
                )}
                
                {/* Pulse effect for active step */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-purple-500 opacity-20"
                    animate={{ 
                      scale: [1, 1.2, 1],
                      opacity: [0.2, 0.1, 0.2],
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "loop"
                    }}
                  />
                )}
              </motion.div>
              
              <span className={cn(
                "text-xs font-medium transition-all duration-200",
                isActive ? typography.text.primary : typography.text.muted
              )}>
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const renderStepContent = () => {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={pageVariants}
          transition={{ duration: 0.25 }}
          className="min-h-[350px]"
        >
          {currentStep === ConfigurationStep.TrainingType && (
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className={cn(typography.headings.primary, "text-lg")}>
                    Select Your Training Type
                  </h3>
                  <AddCustomTrainingType />
                </div>
                <TrainingTypeSelector
                  selectedType={trainingType}
                  onSelect={setTrainingType}
                />
              </div>
            </div>
          )}
          
          {currentStep === ConfigurationStep.TrainingFocus && (
            <div className="space-y-8">
              <div>
                <h3 className={cn(typography.headings.primary, "text-lg mb-4")}>
                  Choose Your Training Focus
                </h3>
                <WorkoutTagPicker
                  selectedTags={selectedTags}
                  onToggleTag={handleTagToggle}
                  trainingType={trainingType}
                />
              </div>
            </div>
          )}
          
          {currentStep === ConfigurationStep.Duration && (
            <div className="space-y-8">
              <div>
                <h3 className={cn(typography.headings.primary, "text-lg mb-4")}>
                  Set Your Training Duration
                </h3>
                <DurationSelector 
                  value={duration} 
                  onChange={setDuration}
                />
              </div>
              <div>
                <h3 className={cn(typography.headings.primary, "text-lg mb-4")}>
                  Quick Setup Templates
                </h3>
                <QuickSetupTemplates
                  onSelect={({ trainingType, tags, duration }) => {
                    setTrainingType(trainingType);
                    setSelectedTags(tags);
                    setDuration(duration);
                  }}
                />
              </div>
            </div>
          )}
          
          {currentStep === ConfigurationStep.Review && (
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className={cn(typography.headings.primary, "text-lg")}>
                    Review Your Training
                  </h3>
                  {recommendation && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 bg-black/30 px-3 py-1 rounded-full">
                            <Progress 
                              value={recommendation.confidence * 100}
                              className="w-16 h-1.5 bg-gray-800/50 [&>div]:bg-purple-500"
                            />
                            <span className="text-xs text-gray-400">
                              {Math.round(recommendation.confidence * 100)}% match
                            </span>
                            <Info size={14} className="text-gray-400" />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p>This match score shows how well this workout matches your training history and preferences</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                
                <div className="rounded-lg bg-black/30 p-6 space-y-5 border border-white/10 backdrop-blur-sm">
                  <div>
                    <span className={typography.text.muted}>Training Type</span>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        trainingType === "Strength" ? "bg-purple-500/30" :
                        trainingType === "Cardio" ? "bg-red-500/30" :
                        trainingType === "Yoga" ? "bg-green-500/30" :
                        trainingType === "Calisthenics" ? "bg-blue-500/30" :
                        "bg-gray-700/30"
                      )}>
                        {trainingType === "Strength" ? <Dumbbell className="h-5 w-5" /> :
                         trainingType === "Cardio" ? <Bike className="h-5 w-5" /> :
                         trainingType === "Yoga" ? <Heart className="h-5 w-5" /> :
                         trainingType === "Calisthenics" ? <Activity className="h-5 w-5" /> : null}
                      </div>
                      <span className={cn(typography.text.primary, "text-lg")}>{trainingType}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-end pt-2 border-t border-white/5">
                    <div>
                      <span className={typography.text.muted}>Duration</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(typography.text.primary, "text-2xl font-bold")}>
                          {duration}
                        </span>
                        <span className={typography.text.secondary}>minutes</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <span className={typography.text.muted}>Estimated calories</span>
                      <span className={cn(typography.text.primary, "text-lg")}>
                        ~{Math.round(duration * 7.5)} kcal
                      </span>
                    </div>
                  </div>
                  
                  <div className="pt-2 border-t border-white/5">
                    <span className={typography.text.muted}>Training Focus</span>
                    <div className="flex flex-wrap gap-2 mt-2">
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
                        <span className="text-gray-500 italic">No specific focus areas selected</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case ConfigurationStep.TrainingType:
        return "Configure Your Workout";
      case ConfigurationStep.TrainingFocus:
        return "Training Focus Areas";
      case ConfigurationStep.Duration:
        return "Workout Duration";
      case ConfigurationStep.Review:
        return "Ready to Start";
      default:
        return "Configure Training";
    }
  };

  const getNextButtonText = () => {
    return currentStep === ConfigurationStep.Review ? "Start Training" : "Continue";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "p-0 overflow-hidden max-w-md max-h-[85vh]",
        "bg-gradient-to-br from-gray-900/95 via-gray-900/98 to-gray-900/95",
        "backdrop-blur-sm border border-white/5",
        "shadow-[0_0_30px_rgba(124,58,237,0.15)]",
        "rounded-2xl",
        bgGradient
      )}>
        <header className="flex justify-between items-center p-6 pb-0">
          <div className="flex items-center gap-3">
            <motion.div 
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-80 blur-sm absolute -top-3 -left-3 z-0"
            />
            <h2 className={cn(typography.headings.primary, "text-2xl relative z-10")}>
              {getStepTitle()}
            </h2>
          </div>
          
          {recommendation && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400/80 flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse" />
                AI Suggested
              </span>
            </div>
          )}
        </header>
        
        <ScrollArea className="max-h-[calc(85vh-8rem)]">
          <div className="p-6 space-y-4">
            {renderStepIndicator()}
            {renderStepContent()}
          </div>
        </ScrollArea>
        
        <footer className="flex items-center justify-between p-6 pt-4 border-t border-white/5 bg-gray-900/70 backdrop-blur-sm">
          <Button 
            onClick={handlePrevStep}
            disabled={currentStep === ConfigurationStep.TrainingType}
            variant="outline"
            className={cn(
              "rounded-xl",
              "border border-white/5 bg-black/20",
              "hover:bg-black/40 hover:border-white/10",
              "text-white/80"
            )}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Button 
            onClick={handleNextStep}
            className={cn(
              "rounded-xl",
              "bg-gradient-to-r from-purple-600 to-pink-500",
              "hover:from-purple-500 hover:to-pink-400",
              "transform transition-all duration-300",
              "shadow-lg hover:shadow-purple-500/25",
              "border border-white/10"
            )}
          >
            {getNextButtonText()}
            {currentStep === ConfigurationStep.Review ? (
              <Check className="w-4 h-4 ml-2" />
            ) : (
              <ChevronRight className="w-4 h-4 ml-2" />
            )}
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
  );
}
