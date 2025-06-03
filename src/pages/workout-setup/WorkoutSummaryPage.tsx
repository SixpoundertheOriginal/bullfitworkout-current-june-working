
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { CardContainer } from "@/components/workout-setup/CardContainer";
import { useWorkoutSetup } from "@/context/WorkoutSetupContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Dumbbell, 
  Clock, 
  Target, 
  Zap, 
  Star, 
  Trophy,
  Rocket
} from "lucide-react";

export const WorkoutSummaryPage = () => {
  const navigate = useNavigate();
  const { state, resetState } = useWorkoutSetup();

  const estimatedXP = Math.round(state.duration * 2);
  const estimatedCalories = Math.round(state.duration * 8);
  const estimatedExercises = Math.round(state.duration / 8) + 2;

  const handleStartWorkout = () => {
    navigate('/training-session', { 
      state: { 
        trainingConfig: {
          trainingType: state.trainingType, 
          tags: state.tags, 
          duration: state.duration
        }
      } 
    });
    resetState();
  };

  return (
    <CardContainer
      title="Ready to"
      subtitle="Crush It! 💪"
      progress={{ current: 3, total: 3 }}
    >
      <div className="space-y-6">
        {/* Workout hero card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/30">
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Dumbbell className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">
                  Your Workout is Ready!
                </h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Target className="h-5 w-5 text-purple-400 mr-1" />
                  </div>
                  <p className="text-2xl font-bold text-white">{state.trainingType}</p>
                  <p className="text-xs text-gray-400">Training Type</p>
                </div>
                
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Clock className="h-5 w-5 text-purple-400 mr-1" />
                  </div>
                  <p className="text-2xl font-bold text-white">{state.duration}min</p>
                  <p className="text-xs text-gray-400">Duration</p>
                </div>
              </div>

              {state.tags.length > 0 && (
                <div className="border-t border-gray-700/50 pt-4">
                  <p className="text-sm text-gray-400 mb-2">Focus Areas:</p>
                  <div className="flex flex-wrap gap-1">
                    {state.tags.slice(0, 4).map((tag) => (
                      <Badge 
                        key={tag} 
                        variant="secondary" 
                        className="text-xs bg-purple-500/20 text-purple-200"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {state.tags.length > 4 && (
                      <Badge variant="secondary" className="text-xs bg-gray-500/20">
                        +{state.tags.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Estimated rewards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-3 gap-3"
        >
          <Card className="bg-yellow-900/20 border-yellow-500/30">
            <CardContent className="p-4 text-center">
              <Star className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-yellow-400">+{estimatedXP}</p>
              <p className="text-xs text-gray-400">XP Points</p>
            </CardContent>
          </Card>

          <Card className="bg-orange-900/20 border-orange-500/30">
            <CardContent className="p-4 text-center">
              <Zap className="h-6 w-6 text-orange-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-orange-400">~{estimatedCalories}</p>
              <p className="text-xs text-gray-400">Calories</p>
            </CardContent>
          </Card>

          <Card className="bg-green-900/20 border-green-500/30">
            <CardContent className="p-4 text-center">
              <Trophy className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <p className="text-lg font-bold text-green-400">{estimatedExercises}</p>
              <p className="text-xs text-gray-400">Exercises</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Motivational message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center py-4"
        >
          <p className="text-sm text-gray-300 italic">
            "Every workout brings you closer to your goals. Let's make today count!"
          </p>
        </motion.div>

        {/* Start button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            onClick={handleStartWorkout}
            className="w-full h-16 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Rocket className="mr-3 h-6 w-6" />
            Start Quest
          </Button>
        </motion.div>
      </div>
    </CardContainer>
  );
};
