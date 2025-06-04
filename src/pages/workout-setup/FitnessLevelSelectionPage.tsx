
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CardContainer } from "@/components/workout-setup/CardContainer";
import { useWorkoutSetup } from "@/context/WorkoutSetupContext";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Target, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

const fitnessLevels = [
  {
    id: "Beginner",
    title: "Beginner",
    description: "Just starting your fitness journey",
    details: "Perfect for those new to working out or returning after a break",
    icon: Zap,
    color: "from-green-500 to-emerald-600"
  },
  {
    id: "Intermediate",
    title: "Intermediate", 
    description: "Regular workout routine established",
    details: "You exercise 2-3 times per week with basic form knowledge",
    icon: Target,
    color: "from-blue-500 to-cyan-600"
  },
  {
    id: "Advanced",
    title: "Advanced",
    description: "Experienced with complex movements",
    details: "Consistent training 4+ times per week with advanced techniques",
    icon: Trophy,
    color: "from-purple-500 to-pink-600"
  }
];

export const FitnessLevelSelectionPage = () => {
  const navigate = useNavigate();
  const { state, updateState } = useWorkoutSetup();

  const handleLevelSelect = (level: string) => {
    updateState({ fitnessLevel: level });
  };

  const handleContinue = () => {
    navigate("/workout-setup/customize");
  };

  return (
    <CardContainer
      title="Fitness Level"
      subtitle="Help us personalize your workout"
      progress={{ current: 2, total: 5 }}
    >
      <div className="space-y-6">
        <div className="grid gap-4">
          {fitnessLevels.map((level) => {
            const Icon = level.icon;
            const isSelected = state.fitnessLevel === level.id;
            
            return (
              <motion.button
                key={level.id}
                onClick={() => handleLevelSelect(level.id)}
                className={cn(
                  "relative p-6 rounded-2xl border-2 transition-all duration-200 text-left",
                  "bg-white/5 backdrop-blur-sm hover:bg-white/10",
                  isSelected 
                    ? "border-purple-500 bg-gradient-to-r from-purple-500/20 to-pink-500/20" 
                    : "border-white/10 hover:border-white/20"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start space-x-4">
                  <div className={cn(
                    "p-3 rounded-full bg-gradient-to-br",
                    level.color
                  )}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">
                      {level.title}
                    </h3>
                    <p className="text-white/70 mb-2">
                      {level.description}
                    </p>
                    <p className="text-sm text-white/50">
                      {level.details}
                    </p>
                  </div>
                  
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                    >
                      <div className="w-2 h-2 bg-white rounded-full" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="pt-4"
        >
          <Button
            onClick={handleContinue}
            disabled={!state.fitnessLevel}
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
