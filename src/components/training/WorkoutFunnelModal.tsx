
import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WorkoutTypeStep } from "./funnel/WorkoutTypeStep";
import { WorkoutCustomizationStep } from "./funnel/WorkoutCustomizationStep";
import { WorkoutSummaryStep } from "./funnel/WorkoutSummaryStep";
import { cn } from "@/lib/utils";

interface WorkoutFunnelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartTraining: (config: any) => void;
}

export const WorkoutFunnelModal: React.FC<WorkoutFunnelModalProps> = ({
  open,
  onOpenChange,
  onStartTraining,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [trainingType, setTrainingType] = useState<string>("Strength");
  const [tags, setTags] = useState<string[]>([]);
  const [duration, setDuration] = useState<number>(30);

  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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
    }
    onOpenChange(open);
  };

  const canContinue = () => {
    switch (currentStep) {
      case 1:
        return trainingType;
      case 2:
        return duration > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[420px] max-h-[90vh] p-0 overflow-hidden bg-gray-900/95 border-gray-800">
        {/* Progress Header */}
        <div className="px-6 py-4 border-b border-gray-800/50">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white">Start Workout</h2>
            <span className="text-sm text-gray-400">
              {currentStep} of {totalSteps}
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-800 rounded-full h-1.5">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full"
              initial={{ width: "33%" }}
              animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
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

        {/* Navigation Footer */}
        <div className="px-6 py-4 border-t border-gray-800/50 bg-gray-900/50">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              disabled={currentStep === 1}
              className={cn(
                "text-gray-400 hover:text-white",
                currentStep === 1 && "invisible"
              )}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>

            {currentStep < totalSteps ? (
              <Button
                onClick={handleNext}
                disabled={!canContinue()}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                Continue
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={handleStart}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8"
              >
                Start Quest 🚀
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
