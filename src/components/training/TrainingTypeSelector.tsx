
import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Dumbbell, Bike, Heart, Activity, ArrowRight } from "lucide-react";
import { useWorkoutStats } from "@/hooks/useWorkoutStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { typography } from '@/lib/typography';
import { Card } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";

interface TrainingTypeSelectorProps {
  selectedType: string;
  onSelect: (type: string) => void;
}

type DefaultTrainingType = {
  name: string;
  icon: React.ReactNode;
  gradient: string;
  bgColor: string;
  activeGradient: string;
  description: string;
  benefits: string[];
  level?: number;
  xp?: number;
}

type CustomTrainingType = {
  id: string;
  name: string;
  icon: string;
  color_start: string;
  color_end: string;
  user_id: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
  description?: string;
  benefits?: string[];
  level?: number;
  xp?: number;
};

const DEFAULT_TRAINING_TYPES = [
  {
    name: "Strength",
    icon: <Dumbbell className="h-7 w-7" />,
    gradient: "from-purple-500/80 to-purple-700/80",
    activeGradient: "from-purple-400 to-purple-600",
    bgColor: "bg-purple-500",
    description: "Build muscle & increase power",
    benefits: ["Muscle growth", "Better strength", "Power gains"],
    level: 2,
    xp: 65
  },
  {
    name: "Cardio",
    icon: <Bike className="h-7 w-7" />,
    gradient: "from-red-400/80 to-red-600/80",
    activeGradient: "from-red-300 to-red-500",
    bgColor: "bg-red-500",
    description: "Boost endurance & heart health",
    benefits: ["Stamina boost", "Heart health", "Fat burn"],
    level: 1,
    xp: 30
  },
  {
    name: "Yoga",
    icon: <Heart className="h-7 w-7" />,
    gradient: "from-green-400/80 to-green-600/80",
    activeGradient: "from-green-300 to-green-500",
    bgColor: "bg-green-500",
    description: "Flow & mindfulness",
    benefits: ["Flexibility", "Balance", "Peace"],
    level: 3,
    xp: 85
  },
  {
    name: "Calisthenics",
    icon: <Activity className="h-7 w-7" />,
    gradient: "from-blue-400/80 to-blue-600/80",
    activeGradient: "from-blue-300 to-blue-500",
    bgColor: "bg-blue-500",
    description: "Master bodyweight skills",
    benefits: ["Body control", "Strength", "Agility"],
    level: 1,
    xp: 45
  }
];

export function TrainingTypeSelector({ selectedType, onSelect }: TrainingTypeSelectorProps) {
  const { user } = useAuth();
  const { stats } = useWorkoutStats();
  const [touchActive, setTouchActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const { data: customTypes } = useQuery<CustomTrainingType[]>({
    queryKey: ['customTrainingTypes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('custom_training_types')
        .select('*')
        .order('usage_count', { ascending: false });
        
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const allTrainingTypes = [
    ...DEFAULT_TRAINING_TYPES,
    ...(customTypes || []).map(type => ({
      name: type.name,
      icon: type.icon,
      gradient: `from-[${type.color_start}] via-[${type.color_start}] to-[${type.color_end}]`,
      activeGradient: `from-[${type.color_start}] via-[${type.color_start}] to-[${type.color_end}]`,
      bgColor: `bg-[${type.color_start}]`,
      description: type.description || '',
      benefits: type.benefits || [],
      level: type.level || undefined,
      xp: type.xp || undefined
    }))
  ];

  const handleTypeSelect = (type: string) => {
    if (!isDragging) {
      onSelect(type);
    }
  };

  const selectedTrainingType = DEFAULT_TRAINING_TYPES.find(type => type.name === selectedType) || DEFAULT_TRAINING_TYPES[0];

  return (
    <div className="w-full relative">
      {/* Indicator dots */}
      <div className="flex justify-center gap-2 mb-6">
        {DEFAULT_TRAINING_TYPES.map((type, index) => (
          <motion.div
            key={index}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              selectedType === type.name ? "w-8 bg-white" : "w-2 bg-white/20"
            )}
          />
        ))}
      </div>

      {/* Radial menu container */}
      <div className="w-full aspect-square relative flex items-center justify-center">
        {/* Center circle with selected training type */}
        <div className="absolute z-10 w-1/2 h-1/2 rounded-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-white/10 shadow-xl">
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
                "bg-gradient-to-br", 
                selectedTrainingType.gradient,
                "shadow-lg"
              )}>
                {selectedTrainingType.icon}
              </div>
              
              <h3 className={cn(typography.headings.primary, "text-lg")}>
                {selectedTrainingType.name}
              </h3>
              
              <p className={cn(typography.text.muted, "text-xs text-center")}>
                {selectedTrainingType.description}
              </p>
              
              <div className="mt-2 flex items-center gap-1 text-xs text-white/60">
                <span>Level {selectedTrainingType.level}</span>
                <span>•</span>
                <span>{selectedTrainingType.xp} XP</span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Radial menu items */}
        {DEFAULT_TRAINING_TYPES.map((type, index) => {
          const totalItems = DEFAULT_TRAINING_TYPES.length;
          const angleStep = (2 * Math.PI) / totalItems;
          const angle = index * angleStep - Math.PI / 2; // Start from top (- Math.PI/2)
          
          // Calculate position on the circle
          const radius = 38; // % of container width
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
              onClick={() => handleTypeSelect(type.name)}
              className={cn(
                "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
                "w-20 h-20 flex flex-col items-center justify-center gap-1",
                "cursor-pointer"
              )}
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "rounded-full p-4",
                  "bg-gradient-to-br shadow-lg",
                  isSelected 
                    ? [type.activeGradient, "ring-2 ring-white/30"] 
                    : [type.gradient, "border border-white/10"]
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
              
              {/* Radial connector line */}
              <div 
                className={cn(
                  "absolute h-px bg-white/10",
                  "top-1/2 left-1/2 origin-left",
                  isSelected ? "bg-white/30" : "bg-white/10"
                )}
                style={{
                  width: `${radius}%`,
                  transform: `rotate(${angle}rad) scaleX(0.7)`,
                  transformOrigin: '0 0',
                  opacity: 0.3,
                }}
              />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
