
import React from 'react';
import { motion } from "framer-motion";
import { ReadyWorkoutState } from "@/components/training/ReadyWorkoutState";
import { WorkoutMotivation } from "@/components/training/WorkoutMotivation";
import { generateWorkoutTemplate } from "@/services/workoutTemplateService";
import { TrainingConfig } from '@/hooks/useTrainingSetupPersistence';

interface ReadyWorkoutSectionProps {
  trainingConfig: TrainingConfig | null;
  onAutoPopulateWorkout: () => void;
  onManualWorkout: () => void;
}

export const ReadyWorkoutSection: React.FC<ReadyWorkoutSectionProps> = React.memo(({
  trainingConfig,
  onAutoPopulateWorkout,
  onManualWorkout
}) => {
  if (!trainingConfig) return null;
  
  const workoutTemplate = generateWorkoutTemplate(trainingConfig);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-8"
    >
      <ReadyWorkoutState
        template={workoutTemplate}
        onStartWorkout={onAutoPopulateWorkout}
        trainingType={trainingConfig?.trainingType || "Strength"}
      />
      
      <WorkoutMotivation
        xpReward={workoutTemplate.xpReward}
        trainingType={trainingConfig?.trainingType || "Strength"}
      />
      
      {/* Manual Option */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="text-center pt-6"
      >
        <button
          onClick={onManualWorkout}
          className="text-white/60 hover:text-white text-sm underline underline-offset-4 
                   transition-colors duration-200 hover:underline-offset-2"
        >
          Prefer to build your own workout?
        </button>
      </motion.div>
    </motion.div>
  );
});

ReadyWorkoutSection.displayName = 'ReadyWorkoutSection';
