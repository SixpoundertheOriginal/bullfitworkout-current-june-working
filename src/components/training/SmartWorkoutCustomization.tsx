
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DurationSelector } from "./DurationSelector";
import { WorkoutTagPicker } from "./WorkoutTagPicker";
import { useSmartWorkoutRecommendations } from "@/services/workoutRecommendationService";
import { cn } from "@/lib/utils";
import { 
  Zap, 
  Clock, 
  Target, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  Sparkles,
  Users,
  TrendingUp
} from "lucide-react";

interface SmartWorkoutCustomizationProps {
  trainingType: string;
  duration: number;
  tags: string[];
  onDurationChange: (duration: number) => void;
  onTagToggle: (tag: string) => void;
  onStartWorkout: () => void;
}

export function SmartWorkoutCustomization({
  trainingType,
  duration,
  tags,
  onDurationChange,
  onTagToggle,
  onStartWorkout
}: SmartWorkoutCustomizationProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const recommendations = useSmartWorkoutRecommendations();
  const currentRecommendation = recommendations.find(r => r.type === trainingType) || recommendations[0];

  const getSuccessRate = () => {
    const baseRate = 85;
    const durationFactor = duration <= 30 ? 10 : duration >= 60 ? -5 : 0;
    const tagFactor = tags.length > 0 ? 5 : 0;
    return Math.min(98, baseRate + durationFactor + tagFactor);
  };

  const getEquipmentNeeded = () => {
    if (trainingType === "Strength Training") return ["Dumbbells", "Bench"];
    if (trainingType === "Hypertrophy") return ["Dumbbells", "Cables"];
    if (trainingType === "Calisthenics") return ["None required"];
    return ["None required"];
  };

  const getExpectedResults = () => {
    if (trainingType === "Strength Training") return "Build strength & power";
    if (trainingType === "Hypertrophy") return "Increase muscle mass";
    if (trainingType === "Calisthenics") return "Master bodyweight skills";
    return "Improve overall fitness";
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Mobile-optimized recommendation card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        <Card className="p-4 sm:p-6 bg-gradient-to-br from-purple-600/20 to-pink-600/20 border-purple-500/30">
          <div className="space-y-4">
            {/* Header with badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                <Sparkles className="h-3 w-3 mr-1" />
                AI Recommended
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                {getSuccessRate()}% success rate
              </Badge>
            </div>
            
            {/* Title and description */}
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
                Your Perfect {trainingType} Workout
              </h3>
              <p className="text-white/70 text-sm">{currentRecommendation.reason}</p>
            </div>

            {/* Duration and XP display */}
            <div className="flex items-center justify-between bg-white/10 rounded-lg p-3">
              <div>
                <div className="text-xl sm:text-2xl font-bold text-white">{duration} min</div>
                <div className="text-yellow-400 text-sm">+{duration * 2} XP</div>
              </div>
              <div className="text-right">
                <Users className="h-4 w-4 text-white/70 inline mr-1" />
                <span className="text-white/70 text-sm">{currentRecommendation.socialProof}</span>
              </div>
            </div>

            {/* Quick stats - mobile stacked layout */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="text-center p-2 bg-white/5 rounded-lg">
                <div className="text-white font-medium">Expected</div>
                <div className="text-white/70">{getExpectedResults()}</div>
              </div>
              <div className="text-center p-2 bg-white/5 rounded-lg">
                <div className="text-white font-medium">Equipment</div>
                <div className="text-white/70">{getEquipmentNeeded().join(", ")}</div>
              </div>
              <div className="text-center p-2 bg-white/5 rounded-lg sm:hidden">
                <div className="text-white font-medium">Community</div>
                <div className="text-white/70">{currentRecommendation.socialProof}</div>
              </div>
            </div>

            {/* Primary CTA - always visible */}
            <Button
              onClick={onStartWorkout}
              className="w-full h-12 sm:h-14 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold text-base sm:text-lg rounded-xl touch-target touch-feedback"
            >
              <CheckCircle className="mr-2 h-5 w-5" />
              Start Now - Perfect Setup
            </Button>
          </div>
        </Card>
      </motion.div>

      {/* Progressive disclosure toggle */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <Button
          variant="ghost"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-white/70 hover:text-white touch-target"
        >
          <Target className="mr-2 h-4 w-4" />
          Want to customize further?
          {showAdvanced ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      </motion.div>

      {/* Advanced customization - mobile optimized */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Duration customization */}
            <Card className="p-4 bg-white/5 border-white/10">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="h-5 w-5 text-purple-400" />
                <h3 className="text-base sm:text-lg font-semibold text-white">Duration</h3>
              </div>
              <DurationSelector
                value={duration}
                onChange={onDurationChange}
              />
            </Card>

            {/* Focus areas */}
            <Card className="p-4 bg-white/5 border-white/10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-400" />
                  <h3 className="text-base sm:text-lg font-semibold text-white">Focus Areas</h3>
                </div>
                {tags.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {tags.length} selected
                  </Badge>
                )}
              </div>
              <WorkoutTagPicker
                selectedTags={tags}
                onToggleTag={onTagToggle}
                trainingType={trainingType}
              />
            </Card>

            {/* Custom start button */}
            <Button
              onClick={onStartWorkout}
              className="w-full h-12 sm:h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-base sm:text-lg rounded-xl touch-target touch-feedback"
            >
              <TrendingUp className="mr-2 h-5 w-5" />
              Start Custom Workout
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
