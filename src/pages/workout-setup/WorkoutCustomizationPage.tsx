
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CardContainer } from "@/components/workout-setup/CardContainer";
import { SmartWorkoutCustomization } from "@/components/training/SmartWorkoutCustomization";
import { useWorkoutSetup } from "@/context/WorkoutSetupContext";
import { Badge } from "@/components/ui/badge";
import { Target, Brain } from "lucide-react";

export const WorkoutCustomizationPage = () => {
  const navigate = useNavigate();
  const { state, updateState, resetState } = useWorkoutSetup();

  const handleDurationChange = (duration: number) => {
    updateState({ duration });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = state.tags.includes(tag)
      ? state.tags.filter(t => t !== tag)
      : [...state.tags, tag];
    updateState({ tags: newTags });
  };

  const handleStartTraining = () => {
    navigate('/training-session', { 
      state: { 
        trainingConfig: {
          trainingType: state.trainingType, 
          tags: state.tags, 
          duration: state.duration,
          intensity: state.intensity
        }
      } 
    });
    resetState();
  };

  return (
    <CardContainer
      title="Smart"
      subtitle="Workout Setup"
      progress={{ current: 2, total: 2 }}
    >
      <div className="space-y-6">
        {/* AI Context Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <div className="flex items-center justify-center gap-2">
            <Badge variant="outline" className="text-purple-400 border-purple-400/30 px-3 py-1">
              <Brain className="h-4 w-4 mr-2" />
              AI Optimized
            </Badge>
            <Badge variant="outline" className="text-blue-400 border-blue-400/30 px-3 py-1">
              <Target className="h-4 w-4 mr-2" />
              {state.trainingType}
            </Badge>
          </div>
          <p className="text-white/70 text-sm">
            We've analyzed your patterns to create the perfect workout
          </p>
        </motion.div>

        {/* Smart Customization Component */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <SmartWorkoutCustomization
            trainingType={state.trainingType}
            duration={state.duration}
            tags={state.tags}
            onDurationChange={handleDurationChange}
            onTagToggle={handleTagToggle}
            onStartWorkout={handleStartTraining}
          />
        </motion.div>
      </div>
    </CardContainer>
  );
};
