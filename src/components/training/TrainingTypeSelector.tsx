
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
};

const TRAINING_TYPES: TrainingType[] = [
  {
    name: "Strength",
    icon: <Dumbbell className="h-6 w-6" />,
    color: "bg-purple-500/80",
    activeColor: "bg-purple-500",
    description: "Build muscle & increase power",
    level: 2,
    xp: 65,
  },
  {
    name: "Cardio",
    icon: <Bike className="h-6 w-6" />,
    color: "bg-red-500/80",
    activeColor: "bg-red-500",
    description: "Boost endurance & heart health",
    level: 1,
    xp: 30,
  },
  {
    name: "Yoga",
    icon: <Heart className="h-6 w-6" />,
    color: "bg-green-500/80",
    activeColor: "bg-green-500",
    description: "Flow & mindfulness",
    level: 3,
    xp: 85,
  },
  {
    name: "Calisthenics",
    icon: <Activity className="h-6 w-6" />,
    color: "bg-blue-500/80",
    activeColor: "bg-blue-500",
    description: "Master bodyweight skills",
    level: 1,
    xp: 45,
  },
];

export function TrainingTypeSelector({ selectedType, onSelect }: TrainingTypeSelectorProps) {
  const [hoveredType, setHoveredType] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const selectedTrainingTypeData = TRAINING_TYPES.find(
    (type) => type.name === selectedType
  ) || TRAINING_TYPES[0];

  const displayedType =
    hoveredType
      ? TRAINING_TYPES.find((type) => type.name === hoveredType)
      : selectedTrainingTypeData;

  // Increased radius for more spacing (was 120, now 100 for 95-105 middle ground)
  const BUTTON_RADIUS = 102; 

  return (
    <div
      className={cn(
        "relative w-full max-w-[340px] mx-auto aspect-square flex items-center justify-center",
        // Added overflow-visible and responsive inclusive
        "overflow-visible"
      )}
      style={{
        // Make sure mobile allows vertical overflow (for scroll) and radial for desktop
        minHeight: isMobile ? 280 : 0,
      }}
    >
      <div className="absolute w-40 h-40 rounded-full bg-gray-800/80 border border-white/10 flex flex-col items-center justify-center z-20 overflow-visible">
        <AnimatePresence mode="wait">
          <motion.div
            key={displayedType?.name}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.08 }}
            transition={{ duration: 0.23 }}
            className="flex flex-col items-center text-center"
          >
            <span className="text-xl font-medium text-white">
              {displayedType?.name}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {TRAINING_TYPES.map((type, index) => {
        const totalTypes = TRAINING_TYPES.length;
        // Place further from center (radius changed)
        const angle = ((index * (360 / totalTypes)) - 90) * (Math.PI / 180);

        const x = Math.cos(angle) * BUTTON_RADIUS;
        const y = Math.sin(angle) * BUTTON_RADIUS;

        const isSelected = selectedType === type.name;
        const isHovered = hoveredType === type.name;

        return (
          <motion.button
            key={type.name}
            onClick={() => onSelect(type.name)}
            onMouseEnter={() => setHoveredType(type.name)}
            onMouseLeave={() => setHoveredType(null)}
            // Enhanced transition/scale effect on hover
            className={cn(
              "absolute w-14 h-14 rounded-full flex items-center justify-center",
              "transition-all duration-200 z-30 overflow-visible",
              isSelected || isHovered
                ? [
                    type.activeColor,
                    "ring-2 ring-white/20 ring-offset-2 ring-offset-gray-900"
                  ]
                : [
                    type.color,
                    "hover:ring-2 hover:ring-white/10 hover:ring-offset-2 hover:ring-offset-gray-900"
                  ]
            )}
            style={{
              left: `calc(50% + ${x}px - 28px)`,
              top: `calc(50% + ${y}px - 28px)`,
              transform: isHovered
                ? 'scale(1.13)'
                : isSelected
                  ? 'scale(1.08)'
                  : 'scale(1)',
            }}
            whileHover={{ scale: 1.13 }}
            whileTap={{ scale: 0.93 }}
            transition={{ type: "spring", stiffness: 320, damping: 25 }}
          >
            {type.icon}
          </motion.button>
        );
      })}
    </div>
  );
}

