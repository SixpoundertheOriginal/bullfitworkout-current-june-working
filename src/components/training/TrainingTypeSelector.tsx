
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Dumbbell, Bike, Heart, Activity } from "lucide-react";
import { motion } from "framer-motion";
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
  const [hoveredType, setHoveredType] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  const selectedTrainingTypeData = TRAINING_TYPES.find(type => 
    type.name === selectedType
  ) || TRAINING_TYPES[0];

  // Use the hovered type if available, otherwise use the selected type
  const displayedType = hoveredType ? 
    TRAINING_TYPES.find(type => type.name === hoveredType) : 
    selectedTrainingTypeData;

  return (
    <div className="relative w-full max-w-[400px] mx-auto aspect-square flex items-center justify-center">
      {/* Center circle */}
      <div className="absolute w-40 h-40 rounded-full bg-gray-800/80 border border-white/10 flex flex-col items-center justify-center pointer-events-none shadow-lg">
        <motion.div
          key={displayedType?.name}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center text-center"
        >
          <span className="text-xl font-medium text-white">
            {displayedType?.name}
          </span>
        </motion.div>
      </div>

      {/* Radial buttons */}
      {TRAINING_TYPES.map((type, index) => {
        const totalTypes = TRAINING_TYPES.length;
        // Start from top (-90deg); bring closer to center
        const angle = ((index * (360 / totalTypes)) - 90) * (Math.PI / 180);
        const radius = 80; // px: smaller = closer to center

        // Reduce radius divisor to bring buttons in tight
        const x = 50 + Math.cos(angle) * (radius / 1.8);
        const y = 50 + Math.sin(angle) * (radius / 1.8);
        
        const isSelected = selectedType === type.name;
        const isHovered = hoveredType === type.name;
        
        return (
          <motion.button
            key={type.name}
            onClick={() => onSelect(type.name)}
            onMouseEnter={() => setHoveredType(type.name)}
            onMouseLeave={() => setHoveredType(null)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "absolute w-16 h-16 rounded-full",
              "flex items-center justify-center transition-all duration-200",
              "transform -translate-x-1/2 -translate-y-1/2",
              isSelected || isHovered ? [
                type.activeColor,
                "ring-2 ring-white/20 ring-offset-2 ring-offset-gray-900"
              ] : [
                type.color,
                "hover:ring-2 hover:ring-white/10 hover:ring-offset-2 hover:ring-offset-gray-900"
              ]
            )}
            style={{
              left: `${x}%`,
              top: `${y}%`,
            }}
            aria-label={type.name}
            type="button"
          >
            {type.icon}
          </motion.button>
        );
      })}
    </div>
  );
}

