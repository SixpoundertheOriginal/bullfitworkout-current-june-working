
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Dumbbell, Zap, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";
import { CircularProgress } from "@/components/ui/circular-progress";

interface TrainingTypeSelectorProps {
  selectedType: string;
  onSelect: (type: string) => void;
}

type StrengthTrainingType = {
  name: string;
  icon: React.ReactNode;
  color: string;
  activeColor: string;
  description: string;
  level: number;
  xp: number;
  focus: string;
  repRange: string;
};

const STRENGTH_TRAINING_TYPES: StrengthTrainingType[] = [
  {
    name: "Strength Training",
    icon: <Dumbbell className="h-6 w-6" />,
    color: "bg-purple-500/80",
    activeColor: "bg-purple-500",
    description: "Heavy compound movements",
    level: 2,
    xp: 65,
    focus: "Power & 1RM",
    repRange: "1-5 reps",
  },
  {
    name: "Hypertrophy",
    icon: <Zap className="h-6 w-6" />,
    color: "bg-pink-500/80",
    activeColor: "bg-pink-500",
    description: "Muscle building focus",
    level: 1,
    xp: 30,
    focus: "Muscle Growth",
    repRange: "8-12 reps",
  },
  {
    name: "Calisthenics",
    icon: <Activity className="h-6 w-6" />,
    color: "bg-blue-500/80",
    activeColor: "bg-blue-500",
    description: "Bodyweight mastery",
    level: 1,
    xp: 45,
    focus: "Skills & Control",
    repRange: "5-15 reps",
  },
];

// Map of color gradients for each training type
const TYPE_GRADIENTS = {
  "Strength Training": "from-purple-600/15 via-purple-500/10 to-purple-400/5",
  "Hypertrophy": "from-pink-600/15 via-pink-500/10 to-pink-400/5",
  "Calisthenics": "from-blue-600/15 via-blue-500/10 to-blue-400/5"
};

const TYPE_ACCENT_COLORS = {
  "Strength Training": "border-purple-500/30",
  "Hypertrophy": "border-pink-500/30",
  "Calisthenics": "border-blue-500/30"
};

const TYPE_TEXT_COLORS = {
  "Strength Training": "text-purple-200",
  "Hypertrophy": "text-pink-200",
  "Calisthenics": "text-blue-200"
};

export function TrainingTypeSelector({ selectedType, onSelect }: TrainingTypeSelectorProps) {
  const [hoveredType, setHoveredType] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const selectedTrainingTypeData = STRENGTH_TRAINING_TYPES.find(
    (type) => type.name === selectedType
  ) || STRENGTH_TRAINING_TYPES[0];

  const displayedType =
    hoveredType
      ? STRENGTH_TRAINING_TYPES.find((type) => type.name === hoveredType)
      : selectedTrainingTypeData;

  // Button positioning radius
  const BUTTON_RADIUS = 98; 

  // Calculate XP progress as a percentage
  const xpProgress = displayedType ? Math.min(displayedType.xp, 100) : 0;

  return (
    <div
      className={cn(
        "relative w-full max-w-[340px] mx-auto aspect-square flex items-center justify-center",
        "overflow-visible mb-6"
      )}
      style={{
        minHeight: isMobile ? 300 : 0,
      }}
    >
      <div className={cn(
        "absolute w-40 h-40 rounded-full",
        "bg-gray-800/90 border border-white/10",
        "flex flex-col items-center justify-center z-20 overflow-visible",
        "transition-all duration-300",
        displayedType && TYPE_ACCENT_COLORS[displayedType.name],
        "shadow-lg"
      )}>
        {/* Circle gradient background */}
        <div className={cn(
          "absolute inset-0 rounded-full bg-gradient-to-b opacity-50",
          displayedType && TYPE_GRADIENTS[displayedType.name]
        )} />
        
        {/* XP Progress Ring */}
        <div className="absolute inset-0 flex items-center justify-center">
          <CircularProgress 
            value={xpProgress} 
            size={160} 
            strokeWidth={3} 
            className="text-gray-700 [&>svg>circle:nth-child(2)]:text-purple-500/70"
          />
        </div>
        
        {/* Animated pulse effect */}
        <motion.div
          className="absolute inset-0 rounded-full opacity-0"
          animate={{
            scale: [1, 1.05, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatType: "loop"
          }}
        />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={displayedType?.name}
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.08 }}
            transition={{ duration: 0.23 }}
            className="flex flex-col items-center text-center px-5"
          >
            {/* Training type icon */}
            <div className={cn(
              "flex items-center justify-center mb-1.5",
              "text-white/90"
            )}>
              {displayedType && React.cloneElement(displayedType.icon as React.ReactElement, { 
                className: "h-5 w-5" 
              })}
            </div>
            
            {/* Training type name */}
            <span className={cn(
              "text-lg font-medium text-white mb-1",
              displayedType && TYPE_TEXT_COLORS[displayedType.name]
            )}>
              {displayedType?.name}
            </span>
            
            {/* Focus and rep range */}
            <div className="text-xs text-white/70 text-center">
              <div className="font-medium">{displayedType?.focus}</div>
              <div className="text-white/50">{displayedType?.repRange}</div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {STRENGTH_TRAINING_TYPES.map((type, index) => {
        const totalTypes = STRENGTH_TRAINING_TYPES.length;
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
