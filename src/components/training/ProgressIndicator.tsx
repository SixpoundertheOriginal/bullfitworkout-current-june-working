
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

export const ProgressIndicator = React.memo(({ 
  currentStep, 
  totalSteps, 
  stepLabels 
}: ProgressIndicatorProps) => {
  return (
    <div className="flex items-center justify-center space-x-2 mb-6">
      {Array.from({ length: totalSteps }, (_, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isCompleted = stepNumber < currentStep;
        
        return (
          <div key={stepNumber} className="flex items-center">
            <motion.div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300",
                isActive && "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg",
                isCompleted && "bg-green-500 text-white",
                !isActive && !isCompleted && "bg-gray-700 text-gray-400"
              )}
              initial={{ scale: 0.8 }}
              animate={{ 
                scale: isActive ? 1.1 : 1,
                boxShadow: isActive ? "0 0 20px rgba(168, 85, 247, 0.3)" : "none"
              }}
              transition={{ duration: 0.2 }}
            >
              {isCompleted ? "✓" : stepNumber}
            </motion.div>
            
            {stepNumber < totalSteps && (
              <div 
                className={cn(
                  "w-8 h-0.5 mx-1 transition-colors duration-300",
                  isCompleted ? "bg-green-500" : "bg-gray-700"
                )}
              />
            )}
          </div>
        );
      })}
      
      {stepLabels && (
        <div className="absolute top-12 left-0 right-0">
          <p className="text-center text-xs text-gray-400">
            {stepLabels[currentStep - 1]}
          </p>
        </div>
      )}
    </div>
  );
});

ProgressIndicator.displayName = 'ProgressIndicator';
