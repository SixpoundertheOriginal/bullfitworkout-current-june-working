
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WorkoutPreviewCard } from "./WorkoutPreviewCard";
import { useSmartWorkoutRecommendations } from "@/services/workoutRecommendationService";
import { useExperiencePoints } from "@/hooks/useExperiencePoints";
import { cn } from "@/lib/utils";
import { Star, Trophy, Users } from "lucide-react";

interface EnhancedTrainingTypeSelectorProps {
  selectedType: string;
  onSelect: (type: string) => void;
}

export function EnhancedTrainingTypeSelector({ 
  selectedType, 
  onSelect 
}: EnhancedTrainingTypeSelectorProps) {
  const recommendations = useSmartWorkoutRecommendations();
  const { experienceData } = useExperiencePoints();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const heroRecommendation = recommendations[0];
  const secondaryRecommendations = recommendations.slice(1, 4);

  const handleCardSelect = (type: string) => {
    onSelect(type);
  };

  return (
    <div className="space-y-6">
      {/* Level progress teaser */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-2"
      >
        <div className="flex items-center justify-center gap-2 text-white/80">
          <Trophy className="h-4 w-4 text-yellow-400" />
          <span className="text-sm">Level {experienceData?.level || 1}</span>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-400" />
            <span className="text-xs">{experienceData?.totalXp || 0} XP</span>
          </div>
        </div>
        <p className="text-white/60 text-xs">
          {experienceData?.nextLevelThreshold ? 
            `${experienceData.nextLevelThreshold - (experienceData.currentLevelXp || 0)} XP to next level` :
            "Build your fitness journey"
          }
        </p>
      </motion.div>

      {/* Hero recommendation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <WorkoutPreviewCard
          recommendation={heroRecommendation}
          isHero={true}
          isSelected={selectedType === heroRecommendation.type}
          onClick={() => handleCardSelect(heroRecommendation.type)}
        />
      </motion.div>

      {/* Secondary recommendations grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {secondaryRecommendations.map((recommendation, index) => (
          <motion.div
            key={recommendation.type}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            onHoverStart={() => setHoveredCard(recommendation.type)}
            onHoverEnd={() => setHoveredCard(null)}
          >
            <WorkoutPreviewCard
              recommendation={recommendation}
              isSelected={selectedType === recommendation.type}
              onClick={() => handleCardSelect(recommendation.type)}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Social motivation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
          <Users className="h-4 w-4" />
          <span>Join thousands training right now</span>
        </div>
      </motion.div>

      {/* Hover preview */}
      <AnimatePresence>
        {hoveredCard && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-safe-bottom left-6 right-6 z-50 pointer-events-none"
          >
            <div className="bg-black/80 backdrop-blur-xl rounded-2xl p-4 border border-white/20">
              <p className="text-white text-sm text-center">
                Quick preview: {hoveredCard} workout builds strength and endurance
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
