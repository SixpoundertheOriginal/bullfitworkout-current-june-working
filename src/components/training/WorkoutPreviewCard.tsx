
import React from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Dumbbell, Bike, Heart, Activity, TrendingUp, Users, Clock, Zap } from "lucide-react";
import { WorkoutRecommendation } from "@/services/workoutRecommendationService";

interface WorkoutPreviewCardProps {
  recommendation: WorkoutRecommendation;
  isHero?: boolean;
  isSelected?: boolean;
  onClick: () => void;
}

const TYPE_CONFIGS = {
  "Strength": {
    icon: Dumbbell,
    gradient: "from-purple-600 to-purple-800",
    description: "Build muscle & power",
    preview: "Push-ups • Squats • Planks"
  },
  "Cardio": {
    icon: Bike,
    gradient: "from-red-600 to-red-800", 
    description: "Boost endurance",
    preview: "HIIT • Running • Cycling"
  },
  "Yoga": {
    icon: Heart,
    gradient: "from-green-600 to-green-800",
    description: "Flow & mindfulness",
    preview: "Sun salutation • Warrior poses"
  },
  "Calisthenics": {
    icon: Activity,
    gradient: "from-blue-600 to-blue-800",
    description: "Bodyweight mastery",
    preview: "Pull-ups • Dips • Handstands"
  }
};

export function WorkoutPreviewCard({ 
  recommendation, 
  isHero = false, 
  isSelected = false,
  onClick 
}: WorkoutPreviewCardProps) {
  const config = TYPE_CONFIGS[recommendation.type as keyof typeof TYPE_CONFIGS];
  const Icon = config.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <Card 
        className={cn(
          "relative overflow-hidden cursor-pointer border-2 transition-all duration-300",
          isHero ? "h-48" : "h-40",
          isSelected 
            ? "border-white/30 ring-2 ring-purple-500/50" 
            : "border-white/10 hover:border-white/20",
          "bg-gradient-to-br", config.gradient
        )}
        onClick={onClick}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        
        {/* Trending badge */}
        {recommendation.trending && (
          <motion.div
            initial={{ scale: 0, rotate: -12 }}
            animate={{ scale: 1, rotate: -12 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            className="absolute top-3 right-3 z-10"
          >
            <Badge className="bg-yellow-500/90 text-yellow-900 border-yellow-400/50">
              <TrendingUp className="h-3 w-3 mr-1" />
              Trending
            </Badge>
          </motion.div>
        )}

        {/* Recommended badge for hero */}
        {isHero && (
          <motion.div
            initial={{ scale: 0, y: -10 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
            className="absolute top-3 left-3 z-10"
          >
            <Badge className="bg-green-500/90 text-green-900 border-green-400/50">
              Perfect for you
            </Badge>
          </motion.div>
        )}

        {/* Streak continuation badge */}
        {recommendation.streakContinuation && (
          <motion.div
            initial={{ scale: 0, x: -10 }}
            animate={{ scale: 1, x: 0 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
            className="absolute top-3 left-3 z-10"
          >
            <Badge className="bg-orange-500/90 text-orange-900 border-orange-400/50">
              🔥 Streak Builder
            </Badge>
          </motion.div>
        )}

        <div className="relative z-10 p-4 h-full flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className={cn(
                  "font-bold text-white",
                  isHero ? "text-xl" : "text-lg"
                )}>
                  {recommendation.type}
                </h3>
                <p className="text-white/80 text-sm">{config.description}</p>
              </div>
            </div>
          </div>

          {/* Preview exercises */}
          <div className="my-3">
            <p className="text-white/90 text-sm font-medium">{config.preview}</p>
            <p className="text-white/70 text-xs mt-1">{recommendation.reason}</p>
          </div>

          {/* Bottom stats */}
          <div className="flex items-center justify-between text-white/80 text-xs">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{recommendation.duration}min</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3" />
                <span>+{recommendation.xpReward} XP</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{recommendation.socialProof}</span>
            </div>
          </div>
        </div>

        {/* Shimmer effect */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{
            x: ["-100%", "100%"],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "easeInOut"
          }}
        />
      </Card>
    </motion.div>
  );
}
