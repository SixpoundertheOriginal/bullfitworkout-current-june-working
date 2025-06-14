import React, { useState } from "react";
import { AccessibleDialog } from "@/components/ui/AccessibleDialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WorkoutTypeStep } from "./funnel/WorkoutTypeStep";
import { WorkoutCustomizationStep } from "./funnel/WorkoutCustomizationStep";
import { WorkoutSummaryStep } from "./funnel/WorkoutSummaryStep";
import { ProgressIndicator } from "./ProgressIndicator";
import { cn } from "@/lib/utils";

interface WorkoutFunnelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartTraining: (config: any) => void;
  initialDuration?: number;
  initialType?: string;
}

export const WorkoutFunnelModal: React.FC<WorkoutFunnelModalProps> = ({
  open,
  onOpenChange,
  onStartTraining,
  initialDuration,
  initialType,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [trainingType, setTrainingType] = useState<string>(initialType || "Strength");
  const [tags, setTags] = useState<string[]>([]);
  const [duration, setDuration] = useState<number>(initialDuration || 30);
  const [isNavigating, setIsNavigating] = useState(false);

  const totalSteps = 3;
  const stepLabels = ["Adventure Type", "Customize", "Summary"];

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setIsNavigating(true);
      
      // Add a small delay for smooth animation
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsNavigating(false);
      }, 150);
    }
  };

  const handleBack = async () => {
    if (currentStep > 1) {
      setIsNavigating(true);
      
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsNavigating(false);
      }, 150);
    }
  };

  const handleStart = () => {
    onStartTraining({ trainingType, tags, duration });
    onOpenChange(false);
    // Reset to first step for next time
    setCurrentStep(1);
  };

  const handleToggleTag = (tag: string) => {
    setTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Reset state when modal closes
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCurrentStep(1);
      setIsNavigating(false);
    }
    onOpenChange(open);
  };

  const canContinue = () => {
    switch (currentStep) {
      case 1:
        return !!trainingType;
      case 2:
        return duration > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <AccessibleDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Start Your Quest"
      description={`Follow the steps to configure and start your training quest. Current step: ${currentStep} of ${totalSteps}.`}
      hideTitleVisually
      contentClassName="sm:max-w-[420px] max-h-[90vh] p-0 overflow-hidden bg-gray-900/95 border-gray-800"
    >
      {/* Enhanced Header with Progress */}
      <div className="px-6 py-6 border-b border-gray-800/50">
        <div className="text-center mb-4">
          <div aria-hidden="true" className="text-xl font-bold text-white mb-1">Start Your Quest</div>
          <p className="text-sm text-gray-400">Step {currentStep} of {totalSteps}</p>
        </div>
        
        <ProgressIndicator 
          currentStep={currentStep} 
          totalSteps={totalSteps}
          stepLabels={stepLabels}
        />
      </div>

      {/* Step Content with Enhanced Transitions */}
      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ 
              opacity: isNavigating ? 0.7 : 1, 
              x: 0,
              scale: isNavigating ? 0.98 : 1
            }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="h-full"
          >
            {currentStep === 1 && (
              <WorkoutTypeStep
                selectedType={trainingType}
                onSelect={setTrainingType}
              />
            )}
            
            {currentStep === 2 && (
              <WorkoutCustomizationStep
                trainingType={trainingType}
                selectedTags={tags}
                onToggleTag={handleToggleTag}
                duration={duration}
                onDurationChange={setDuration}
              />
            )}
            
            {currentStep === 3 && (
              <WorkoutSummaryStep
                trainingType={trainingType}
                tags={tags}
                duration={duration}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Enhanced Navigation Footer */}
      <div className="px-6 py-4 border-t border-gray-800/50 bg-gray-900/50">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            disabled={currentStep === 1 || isNavigating}
            className={cn(
              "text-gray-400 hover:text-white transition-colors",
              currentStep === 1 && "invisible"
            )}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!canContinue() || isNavigating}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            >
              {isNavigating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Continue
                  <ChevronRight className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleStart}
              disabled={isNavigating}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8 transition-all duration-200"
            >
              {isNavigating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Start Quest 🚀"
              )}
            </Button>
          )}
        </div>
      </div>
    </AccessibleDialog>
  );
};
