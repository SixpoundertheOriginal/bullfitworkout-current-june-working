
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Dumbbell, 
  Clock, 
  Target, 
  Zap,
  Trophy,
  Star
} from "lucide-react";

interface WorkoutSummaryStepProps {
  trainingType: string;
  tags: string[];
  duration: number;
}

export function WorkoutSummaryStep({ trainingType, tags, duration }: WorkoutSummaryStepProps) {
  const estimatedXP = Math.round(duration * 2);
  const estimatedCalories = Math.round(duration * 8);

  return (
    <div className="px-6 py-8 h-full flex flex-col">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-4"
        >
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
            <Dumbbell className="h-8 w-8 text-white" />
          </div>
        </motion.div>
        
        <h3 className="text-2xl font-bold text-white mb-2">
          Ready to Crush It! 💪
        </h3>
        <p className="text-gray-400">
          Your personalized workout is ready to begin
        </p>
      </div>

      <div className="flex-1 space-y-4">
        {/* Workout Summary Card */}
        <Card className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border-purple-500/30">
          <CardContent className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Target className="h-5 w-5 text-purple-400 mr-1" />
                </div>
                <p className="text-2xl font-bold text-white">{trainingType}</p>
                <p className="text-xs text-gray-400">Training Type</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-2">
                  <Clock className="h-5 w-5 text-purple-400 mr-1" />
                </div>
                <p className="text-2xl font-bold text-white">{duration}min</p>
                <p className="text-xs text-gray-400">Duration</p>
              </div>
            </div>

            {tags.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-700/50">
                <p className="text-sm text-gray-400 mb-2">Focus Areas:</p>
                <div className="flex flex-wrap gap-1">
                  {tags.slice(0, 4).map((tag, index) => (
                    <Badge 
                      key={tag} 
                      variant="secondary" 
                      className="text-xs bg-purple-500/20 text-purple-200"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {tags.length > 4 && (
                    <Badge variant="secondary" className="text-xs bg-gray-500/20">
                      +{tags.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Estimated Rewards */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-yellow-900/20 border-yellow-500/30">
              <CardContent className="p-4 text-center">
                <Star className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                <p className="text-lg font-bold text-yellow-400">+{estimatedXP}</p>
                <p className="text-xs text-gray-400">XP Points</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-orange-900/20 border-orange-500/30">
              <CardContent className="p-4 text-center">
                <Zap className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                <p className="text-lg font-bold text-orange-400">~{estimatedCalories}</p>
                <p className="text-xs text-gray-400">Calories</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Motivational Message */}
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
      </div>
    </div>
  );
}
