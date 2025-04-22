
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
  
  const selectedTrainingTypeData = TRAINING_TYPES.find(type => 
    type.name === selectedType
  ) || TRAINING_TYPES[0];

  return (
    <div className="relative w-full max-w-[500px] mx-auto aspect-square p-4">
      <div className="absolute inset-0 m-auto w-32 h-32 rounded-full bg-gray-800/80 border border-white/10 flex items-center justify-center">
        <motion.div
          key={selectedType}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col items-center text-center space-y-2"
        >
          <div className={cn(
            "p-3 rounded-full",
            selectedTrainingTypeData.activeColor
          )}>
            {selectedTrainingTypeData.icon}
          </div>
          <span className="text-sm font-medium text-white">
            {selectedTrainingTypeData.name}
          </span>
        </motion.div>
      </div>

      <div className="absolute inset-0 w-full h-full">
        {TRAINING_TYPES.map((type, index) => {
          // Adjust radius to bring buttons closer
          const radius = 120; // Reduced from 160
          const totalTypes = TRAINING_TYPES.length;
          const angle = (index * (360 / totalTypes)) * (Math.PI / 180);
          
          const x = Math.cos(angle) * radius + radius;
          const y = Math.sin(angle) * radius + radius;
          
          const isSelected = selectedType === type.name;
          
          return (
            <motion.button
              key={type.name}
              onClick={() => onSelect(type.name)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "absolute w-16 h-16 -translate-x-1/2 -translate-y-1/2 rounded-full",
                "flex items-center justify-center transition-colors",
                isSelected ? type.activeColor : type.color
              )}
              style={{
                left: `${x}px`,
                top: `${y}px`,
              }}
            >
              {type.icon}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
