
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Dumbbell, Bike, Heart, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { typography } from '@/lib/typography';
import { useIsMobile } from "@/hooks/use-mobile";

interface TrainingTypeSelectorProps {
  selectedType: string;
  onSelect: (type: string) => void;
}

type TrainingType = {
  name: string;
  icon: React.ReactNode;
  color: string;
  activeColor: string;
  description: string;
  level: number;
  xp: number;
}

// Simplified training types with consistent styling
const TRAINING_TYPES: TrainingType[] = [
  {
    name: "Strength",
    icon: <Dumbbell className="h-6 w-6" />,
    color: "bg-purple-500/80",
    activeColor: "bg-purple-500",
    description: "Build muscle & increase power",
    level: 2,
    xp: 65
  },
  {
    name: "Cardio",
    icon: <Bike className="h-6 w-6" />,
    color: "bg-red-500/80",
    activeColor: "bg-red-500",
    description: "Boost endurance & heart health",
    level: 1,
    xp: 30
  },
  {
    name: "Yoga",
    icon: <Heart className="h-6 w-6" />,
    color: "bg-green-500/80",
    activeColor: "bg-green-500",
    description: "Flow & mindfulness",
    level: 3,
    xp: 85
  },
  {
    name: "Calisthenics",
    icon: <Activity className="h-6 w-6" />,
    color: "bg-blue-500/80",
    activeColor: "bg-blue-500",
    description: "Master bodyweight skills",
    level: 1,
    xp: 45
  }
];

export function TrainingTypeSelector({ selectedType, onSelect }: TrainingTypeSelectorProps) {
  const isMobile = useIsMobile();
  
  // Find selected training type data
  const selectedTrainingTypeData = TRAINING_TYPES.find(type => 
    type.name === selectedType
  ) || TRAINING_TYPES[0];

  return (
    <div className="w-full flex flex-col items-center space-y-8">
      {/* Indicator dots */}
      <div className="flex justify-center gap-2 mb-4">
        {TRAINING_TYPES.map((type, index) => (
          <motion.div
            key={index}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              selectedType === type.name ? "w-8 bg-white" : "w-2 bg-white/20"
            )}
          />
        ))}
      </div>

      {/* Central display of selected type */}
      <div className="relative w-64 h-64 mx-auto">
        {/* Center circle with selected training info */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full flex flex-col items-center justify-center bg-gray-900/90 border border-white/10 shadow-lg z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedType}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center justify-center gap-2 p-4 w-full h-full"
            >
              <div className={cn(
                "p-4 rounded-full",
                selectedTrainingTypeData.activeColor,
                "shadow-lg"
              )}>
                {selectedTrainingTypeData.icon}
              </div>
              
              <h3 className={cn(typography.headings.primary, "text-lg")}>
                {selectedTrainingTypeData.name}
              </h3>
              
              <p className={cn(typography.text.muted, "text-xs text-center max-w-[90%]")}>
                {selectedTrainingTypeData.description}
              </p>
              
              <div className="mt-1 flex items-center gap-1 text-xs text-white/60">
                <span>Level {selectedTrainingTypeData.level}</span>
                <span>•</span>
                <span>{selectedTrainingTypeData.xp} XP</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Outer circle with training type options */}
        {TRAINING_TYPES.map((type, index) => {
          const totalItems = TRAINING_TYPES.length;
          const angleStep = (2 * Math.PI) / totalItems;
          // Start from top position (-Math.PI/2)
          const angle = index * angleStep - Math.PI / 2;
          
          // Calculate position on the circle (radius = 32% of container)
          const radius = 32;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          const isSelected = selectedType === type.name;
          
          return (
            <motion.div
              key={type.name}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: `${x}%`,
                y: `${y}%`,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: index * 0.1,
              }}
              onClick={() => onSelect(type.name)}
              className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                "flex flex-col items-center justify-center gap-1",
                "cursor-pointer"
              )}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "rounded-full p-4",
                  "shadow-lg",
                  isSelected 
                    ? [type.activeColor, "ring-2 ring-white/30"] 
                    : [type.color, "border border-white/10"]
                )}
              >
                {type.icon}
              </motion.div>
              
              <span className={cn(
                "text-sm font-medium",
                isSelected ? "text-white" : "text-white/70"
              )}>
                {type.name}
              </span>
              
              {/* Connector line to center */}
              <div 
                className={cn(
                  "absolute h-px",
                  isSelected ? "bg-white/30" : "bg-white/10"
                )}
                style={{
                  width: `${radius}%`,
                  transform: `rotate(${angle}rad) scaleX(0.7)`,
                  transformOrigin: '0 0',
                  top: "50%",
                  left: "50%",
                }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
