
import React from "react";
import { motion } from "framer-motion";
import { SmartWorkoutCard } from "./SmartWorkoutCard";
import { ExerciseFAB } from "@/components/ExerciseFAB";
import { cn } from "@/lib/utils";
import { typography } from "@/lib/typography";

interface EnhancedWorkoutActionCenterProps {
  isActive: boolean;
  fabVisible: boolean;
  isSectionVisible: boolean;
  recommendedWorkoutType: string;
  recommendedDuration: number;
  onStartWorkout: () => void;
  onContinueWorkout: () => void;
  onQuickStart: (duration: number, type: string) => void;
}

export const EnhancedWorkoutActionCenter = React.memo(({ 
  isActive, 
  fabVisible, 
  isSectionVisible, 
  recommendedWorkoutType,
  recommendedDuration,
  onStartWorkout,
  onContinueWorkout,
  onQuickStart
}: EnhancedWorkoutActionCenterProps) => {
  // Quick start presets based on common workout durations
  const quickStartOptions = [
    { duration: 15, type: "Quick", description: "Fast & focused session" },
    { duration: 30, type: "Standard", description: "Balanced workout" },
    { duration: 45, type: "Extended", description: "Full body session" },
    { duration: 60, type: "Complete", description: "Comprehensive training" }
  ];

  return (
    <section className="mb-10">
      <motion.h2 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className={cn(typography.text.secondary, "mb-6 text-center")}
      >
        {isActive ? "Continue your fitness journey" : "Start your fitness adventure"}
      </motion.h2>
      
      <div style={{ height: "auto" }} className="relative space-y-4">
        <ExerciseFAB 
          onClick={onStartWorkout}
          visible={fabVisible}
          className="!bottom-20"
        />

        <div className={cn(
          "transition-all duration-300",
          isSectionVisible ? "scale-100 opacity-100" : "scale-95 opacity-90"
        )}>
          {isActive ? (
            <div className="space-y-4">
              {/* Continue Workout - Primary Action */}
              <SmartWorkoutCard
                title="Continue Workout"
                description="Resume your active training session"
                workoutType={recommendedWorkoutType}
                isPrimary={true}
                isActive={true}
                onClick={onContinueWorkout}
              />
              
              {/* Start New Workout - Secondary */}
              <div className="text-center">
                <button 
                  onClick={onStartWorkout}
                  className="text-sm text-white/70 hover:text-white/90 underline transition-colors"
                >
                  Start a new workout instead
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Quick Start Grid */}
              <div className="grid grid-cols-2 gap-3">
                {quickStartOptions.map((option) => (
                  <SmartWorkoutCard
                    key={option.duration}
                    title={`${option.duration} min`}
                    description={option.description}
                    duration={option.duration}
                    workoutType={option.type}
                    isPrimary={option.duration === recommendedDuration}
                    onClick={() => onQuickStart(option.duration, option.type)}
                  />
                ))}
              </div>
              
              {/* Custom Workout Option with Card Navigation */}
              <div className="text-center pt-2">
                <SmartWorkoutCard
                  title="Custom Workout"
                  description="Full customization with duration, focus areas, and intensity"
                  workoutType="Personalized"
                  onClick={onStartWorkout}
                  className="max-w-sm mx-auto"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
});

EnhancedWorkoutActionCenter.displayName = 'EnhancedWorkoutActionCenter';
