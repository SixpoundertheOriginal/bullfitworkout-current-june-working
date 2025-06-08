
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface WizardProgressBarProps {
  currentStep: number;
  totalSteps: number;
  percentage: number;
}

const stepLabels = [
  'Exercise Identity',
  'Muscle Selection', 
  'Equipment & Details',
  'Review & Create'
];

export const WizardProgressBar: React.FC<WizardProgressBarProps> = ({
  currentStep,
  totalSteps,
  percentage
}) => {
  return (
    <div className="px-6 py-4 border-b border-gray-700 bg-gray-800/50">
      {/* Progress percentage */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-white mb-1">Create New Exercise</h2>
        <p className="text-sm text-gray-400">
          Step {currentStep} of {totalSteps} • {Math.round(percentage)}% Complete
        </p>
      </div>

      {/* Progress bar */}
      <div className="relative mb-4">
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }, (_, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;
          
          return (
            <div key={stepNumber} className="flex flex-col items-center">
              <motion.div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2 transition-all duration-200",
                  isCompleted && "bg-green-600 border-green-600 text-white",
                  isActive && "bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-500/30",
                  !isActive && !isCompleted && "bg-gray-700 border-gray-600 text-gray-400"
                )}
                animate={{ 
                  scale: isActive ? 1.1 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
              </motion.div>
              
              <p className={cn(
                "text-xs mt-1 text-center max-w-16",
                isActive && "text-white font-medium",
                isCompleted && "text-green-400",
                !isActive && !isCompleted && "text-gray-500"
              )}>
                {stepLabels[index]}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
