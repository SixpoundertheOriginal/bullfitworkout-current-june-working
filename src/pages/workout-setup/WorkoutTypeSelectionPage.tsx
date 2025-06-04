
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CardContainer } from "@/components/workout-setup/CardContainer";
import { EnhancedTrainingTypeSelector } from "@/components/training/EnhancedTrainingTypeSelector";
import { useWorkoutSetup } from "@/context/WorkoutSetupContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

export const WorkoutTypeSelectionPage = () => {
  const navigate = useNavigate();
  const { state, updateState } = useWorkoutSetup();

  const handleTypeSelect = (type: string) => {
    updateState({ trainingType: type });
  };

  const handleContinue = () => {
    if (state.trainingType) {
      navigate("/workout-setup/customize");
    }
  };

  return (
    <CardContainer
      title="Your Perfect"
      subtitle="Workout Awaits"
      showBackButton={false}
      progress={{ current: 1, total: 2 }}
    >
      <div className="space-y-8">
        {/* Enhanced AI-powered message */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="flex items-center justify-center gap-2 text-purple-400">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">AI-Powered Recommendations</span>
          </div>
          <p className="text-white/60 text-sm">
            Personalized based on your patterns, time, and goals
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <EnhancedTrainingTypeSelector
            selectedType={state.trainingType}
            onSelect={handleTypeSelect}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="pt-4"
        >
          <Button
            onClick={handleContinue}
            disabled={!state.trainingType}
            className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Customization
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </motion.div>
      </div>
    </CardContainer>
  );
};
