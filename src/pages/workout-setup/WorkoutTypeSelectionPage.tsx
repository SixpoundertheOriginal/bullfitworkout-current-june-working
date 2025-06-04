
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CardContainer } from "@/components/workout-setup/CardContainer";
import { TrainingTypeSelector } from "@/components/training/TrainingTypeSelector";
import { useWorkoutSetup } from "@/context/WorkoutSetupContext";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const WorkoutTypeSelectionPage = () => {
  const navigate = useNavigate();
  const { state, updateState } = useWorkoutSetup();

  const handleTypeSelect = (type: string) => {
    updateState({ trainingType: type });
  };

  const handleContinue = () => {
    navigate("/workout-setup/fitness-level");
  };

  return (
    <CardContainer
      title="Choose Your"
      subtitle="Adventure"
      showBackButton={false}
      progress={{ current: 1, total: 5 }}
    >
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <TrainingTypeSelector
            selectedType={state.trainingType}
            onSelect={handleTypeSelect}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-8"
        >
          <Button
            onClick={handleContinue}
            disabled={!state.trainingType}
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
