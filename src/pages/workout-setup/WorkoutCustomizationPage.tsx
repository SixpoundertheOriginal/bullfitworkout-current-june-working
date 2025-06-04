
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CardContainer } from "@/components/workout-setup/CardContainer";
import { DurationSelector } from "@/components/training/DurationSelector";
import { WorkoutTagPicker } from "@/components/training/WorkoutTagPicker";
import { useWorkoutSetup } from "@/context/WorkoutSetupContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const WorkoutCustomizationPage = () => {
  const navigate = useNavigate();
  const { state, updateState } = useWorkoutSetup();

  const handleDurationChange = (duration: number) => {
    updateState({ duration });
  };

  const handleTagToggle = (tag: string) => {
    const newTags = state.tags.includes(tag)
      ? state.tags.filter(t => t !== tag)
      : [...state.tags, tag];
    updateState({ tags: newTags });
  };

  const handleContinue = () => {
    navigate("/workout-setup/exercises");
  };

  return (
    <CardContainer
      title="Customize"
      subtitle="Your Perfect Workout"
      progress={{ current: 3, total: 5 }}
    >
      <div className="space-y-8">
        {/* Selected type and fitness level badges */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center space-x-2"
        >
          <Badge variant="outline" className="text-purple-400 border-purple-400/30 px-4 py-2">
            <Target className="h-4 w-4 mr-2" />
            {state.trainingType}
          </Badge>
          <Badge variant="outline" className="text-blue-400 border-blue-400/30 px-4 py-2">
            {state.fitnessLevel}
          </Badge>
        </motion.div>

        {/* Duration Selection */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 rounded-2xl p-6 border border-white/10"
        >
          <DurationSelector
            value={state.duration}
            onChange={handleDurationChange}
          />
        </motion.div>

        {/* Focus Areas */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 rounded-2xl p-6 border border-white/10"
        >
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-purple-400" />
            Focus Areas
            {state.tags.length > 0 && (
              <Badge variant="secondary" className="ml-auto">
                {state.tags.length} selected
              </Badge>
            )}
          </h3>
          <WorkoutTagPicker
            selectedTags={state.tags}
            onToggleTag={handleTagToggle}
            trainingType={state.trainingType}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={handleContinue}
            className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Continue
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </CardContainer>
  );
};
