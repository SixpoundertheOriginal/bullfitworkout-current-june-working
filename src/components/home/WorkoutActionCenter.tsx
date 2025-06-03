
import React from "react";
import { motion } from "framer-motion";
import { ExerciseFAB } from "@/components/ExerciseFAB";
import { StartTrainingButton } from "@/components/training/StartTrainingButton";
import { cn } from "@/lib/utils";
import { typography } from "@/lib/typography";

interface WorkoutActionCenterProps {
  isActive: boolean;
  fabVisible: boolean;
  isSectionVisible: boolean;
  recommendedWorkoutType: string;
  onStartWorkout: () => void;
  onContinueWorkout: () => void;
}

export const WorkoutActionCenter = React.memo(({ 
  isActive, 
  fabVisible, 
  isSectionVisible, 
  recommendedWorkoutType,
  onStartWorkout,
  onContinueWorkout
}: WorkoutActionCenterProps) => {
  return (
    <section className="mb-10 text-center">
      <motion.h2 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className={cn(typography.text.secondary, "mb-6")}
      >
        Embark on a new fitness adventure
      </motion.h2>
      
      <div style={{ height: "12rem" }} className="relative">
        <ExerciseFAB 
          onClick={onStartWorkout}
          visible={fabVisible}
          className="!bottom-20"
        />

        <div className={cn(
          "absolute left-1/2 transform -translate-x-1/2 transition-all duration-300",
          isSectionVisible ? "scale-100 opacity-100" : "scale-95 opacity-90"
        )}>
          {isActive ? (
            <div className="flex flex-col items-center space-y-4">
              <StartTrainingButton
                onClick={onContinueWorkout}
                trainingType="Continue"
                label="Resume"
              />
              <button 
                onClick={onStartWorkout}
                className="text-sm text-white/70 hover:text-white/90 underline"
              >
                Start a new workout
              </button>
            </div>
          ) : (
            <StartTrainingButton
              onClick={onStartWorkout}
              trainingType={recommendedWorkoutType}
              label="Start"
            />
          )}
        </div>
      </div>
    </section>
  );
});

WorkoutActionCenter.displayName = 'WorkoutActionCenter';
