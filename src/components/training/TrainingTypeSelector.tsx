
import React from "react";
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
    <div className="w-full flex flex-col items-center space-y-6">
      {/* Indicator dots */}
      <div className="flex justify-center gap-2 mb-2">
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

      {/* Main selection area */}
      <div className="relative w-full max-w-sm">
        {/* Central selected type display */}
        <div className="w-full rounded-xl bg-gray-800/80 border border-white/10 p-6 flex flex-col items-center justify-center mb-6">
          <motion.div
            key={selectedType}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center space-y-3"
          >
            <div className={cn(
              "p-4 rounded-full",
              selectedTrainingTypeData.activeColor,
              "shadow-lg mb-1"
            )}>
              {selectedTrainingTypeData.icon}
            </div>
            
            <h3 className={cn(typography.headings.primary, "text-xl")}>
              {selectedTrainingTypeData.name}
            </h3>
            
            <p className={cn(typography.text.muted, "text-sm max-w-[90%]")}>
              {selectedTrainingTypeData.description}
            </p>
            
            <div className="mt-1 flex items-center gap-2 text-xs text-white/60">
              <span>Level {selectedTrainingTypeData.level}</span>
              <span>•</span>
              <span>{selectedTrainingTypeData.xp} XP</span>
            </div>
          </motion.div>
        </div>

        {/* Training type options */}
        <div className="grid grid-cols-2 gap-4">
          {TRAINING_TYPES.map((type) => {
            const isSelected = selectedType === type.name;
            
            return (
              <motion.div
                key={type.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(type.name)}
                className={cn(
                  "flex flex-col items-center justify-center p-4 gap-2",
                  "cursor-pointer rounded-xl transition-colors",
                  isSelected 
                    ? "bg-gray-800/80 border border-white/20" 
                    : "bg-gray-900/50 border border-white/5 hover:bg-gray-800/50"
                )}
              >
                <div className={cn(
                  "rounded-full p-3",
                  isSelected ? type.activeColor : type.color,
                  "shadow-md"
                )}>
                  {type.icon}
                </div>
                
                <span className={cn(
                  "text-sm font-medium mt-1",
                  isSelected ? "text-white" : "text-white/70"
                )}>
                  {type.name}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
