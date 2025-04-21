
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Dumbbell, Bike, Heart, Activity, Star, Award, Medal } from "lucide-react";
import { useWorkoutStats } from "@/hooks/useWorkoutStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { typography } from '@/lib/typography';

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

const DEFAULT_TRAINING_TYPES: DefaultTrainingType[] = [
  {
    name: "Strength",
    icon: <Dumbbell className="h-7 w-7" />,
    gradient: "from-purple-500 via-purple-600 to-purple-700",
    activeGradient: "from-purple-400 via-purple-600 to-purple-800",
    bgColor: "bg-purple-500",
    description: "Build muscle and increase power",
    benefits: ["Increased muscle mass", "Better bone density", "Higher metabolism"],
    level: 2,
    xp: 65
  },
  {
    name: "Cardio",
    icon: <Bike className="h-7 w-7" />,
    gradient: "from-red-400 via-red-500 to-red-600",
    activeGradient: "from-red-300 via-red-500 to-red-700",
    bgColor: "bg-red-500",
    description: "Improve endurance and heart health",
    benefits: ["Better cardiovascular health", "Increased stamina", "Improved mood"],
    level: 1,
    xp: 30
  },
  {
    name: "Yoga",
    icon: <Heart className="h-7 w-7" />,
    gradient: "from-green-400 via-green-500 to-green-600",
    activeGradient: "from-green-300 via-green-500 to-green-700",
    bgColor: "bg-green-500",
    description: "Enhance flexibility and mindfulness",
    benefits: ["Improved flexibility", "Better stress management", "Enhanced balance"],
    level: 3,
    xp: 85
  },
  {
    name: "Calisthenics",
    icon: <Activity className="h-7 w-7" />,
    gradient: "from-blue-400 via-blue-500 to-blue-600",
    activeGradient: "from-blue-300 via-blue-500 to-blue-700",
    bgColor: "bg-blue-500",
    description: "Master bodyweight exercises",
    benefits: ["Functional strength", "Body control", "No equipment needed"],
    level: 1,
    xp: 45
  }
];

// Animation variants for the cards
const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.9 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: index * 0.1,
      duration: 0.5,
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }),
  hover: {
    y: -5,
    scale: 1.05,
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  },
  tap: {
    scale: 0.95,
    boxShadow: "0 5px 10px rgba(0, 0, 0, 0.1)",
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 15
    }
  },
  selected: {
    y: -8,
    scale: 1.08,
    boxShadow: "0 15px 30px rgba(0, 0, 0, 0.3)",
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 25
    }
  }
};

export function TrainingTypeSelector({ selectedType, onSelect }: TrainingTypeSelectorProps) {
  const { user } = useAuth();
  const { stats } = useWorkoutStats();
  const [hoveredType, setHoveredType] = useState<string | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(selectedType);
  const [showUnlockAnimation, setShowUnlockAnimation] = useState<string | null>(null);
  
  useEffect(() => {
    setSelectedCard(selectedType);
  }, [selectedType]);
  
  const { data: customTypes } = useQuery({
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

  const getTypeSize = (typeName: string) => {
    const typeStats = stats?.workoutTypes?.find(t => t.type === typeName);
    if (!typeStats || !stats?.totalWorkouts) return "md";
    
    const totalWorkouts = stats.totalWorkouts;
    const percentage = (typeStats.count / totalWorkouts) * 100;
    
    if (percentage > 30) return "lg";
    if (percentage > 15) return "md";
    return "sm";
  };

  const handleSelectType = (typeName: string) => {
    setSelectedCard(typeName);
    onSelect(typeName);
    
    // Show unlock animation effect if it's first time selecting
    if (!showUnlockAnimation && !selectedType) {
      setShowUnlockAnimation(typeName);
      setTimeout(() => setShowUnlockAnimation(null), 2000);
    }
  };
  
  // Particle animation component for selection effect
  const SelectionParticles = ({ active }: { active: boolean }) => {
    return (
      <AnimatePresence>
        {active && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(10)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: "50%", 
                  y: "50%", 
                  opacity: 1,
                  scale: 0
                }}
                animate={{
                  x: `${50 + (Math.random() * 100 - 50)}%`,
                  y: `${50 + (Math.random() * 100 - 50)}%`,
                  opacity: 0,
                  scale: Math.random() * 0.5 + 0.5,
                  rotate: Math.random() * 360
                }}
                transition={{
                  duration: 1 + Math.random(),
                  ease: "easeOut"
                }}
                className="absolute w-2 h-2 bg-white rounded-full"
                style={{
                  boxShadow: "0 0 10px 2px rgba(255, 255, 255, 0.7)"
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    );
  };
  
  // Level badge component
  const LevelBadge = ({ level }: { level: number }) => {
    return (
      <div className="absolute top-2 right-2 z-20">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm border border-white/20"
        >
          <Star className="w-4 h-4 text-yellow-300" />
          <span className="absolute text-xs font-bold text-white">{level}</span>
        </motion.div>
      </div>
    );
  };
  
  // XP bar component
  const XPBar = ({ xp }: { xp: number }) => {
    return (
      <div className="absolute bottom-2 left-2 right-2 h-1 bg-black/30 rounded-full overflow-hidden z-20">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${xp}%` }}
          transition={{ delay: 0.5, duration: 1 }}
          className="h-full bg-gradient-to-r from-yellow-400 to-yellow-300"
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="relative py-3">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500/10 via-purple-500/30 to-purple-500/10"
        />
        <motion.h3
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={cn(typography.headings.primary, "text-center text-lg mb-1")}
        >
          Select Your Character Class
        </motion.h3>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className={cn(typography.text.secondary, "text-center text-sm")}
        >
          Choose your training style and unlock special abilities
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-500/10 via-purple-500/30 to-purple-500/10"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {DEFAULT_TRAINING_TYPES.map((type, index) => {
          const isSelected = selectedCard === type.name;
          const isHovered = hoveredType === type.name;
          const showUnlock = showUnlockAnimation === type.name;
          
          return (
            <motion.div 
              key={type.name}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
              className="flex flex-col items-center space-y-3"
            >
              <motion.button
                onHoverStart={() => setHoveredType(type.name)}
                onHoverEnd={() => setHoveredType(null)}
                onClick={() => handleSelectType(type.name)}
                whileHover="hover"
                whileTap="tap"
                animate={isSelected ? "selected" : "visible"}
                variants={cardVariants}
                custom={index}
                className={cn(
                  "relative overflow-hidden w-full aspect-square rounded-2xl flex flex-col items-center justify-center",
                  "transition-all duration-300",
                  "bg-gradient-to-br shadow-lg",
                  isSelected ? [
                    type.activeGradient,
                    "ring-2 ring-white/20 ring-offset-2 ring-offset-gray-900"
                  ] : type.gradient,
                  "border border-white/10",
                  "transform perspective-1000"
                )}
              >
                {/* Level indicator */}
                {type.level && <LevelBadge level={type.level} />}
                
                {/* XP bar */}
                {type.xp && <XPBar xp={type.xp} />}
                
                {/* Selection particles effect */}
                <SelectionParticles active={showUnlock} />
                
                {/* Pulse effect for selected item */}
                {isSelected && (
                  <motion.div 
                    className="absolute inset-0 bg-white/10 rounded-2xl"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                      opacity: [0.1, 0.2, 0.1], 
                      scale: [0.8, 1.1, 0.8] 
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "loop"
                    }}
                  />
                )}
                
                {/* Hover effect */}
                <motion.div 
                  className="absolute inset-0 bg-white/5 rounded-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isHovered && !isSelected ? 1 : 0 }}
                  transition={{ duration: 0.2 }}
                />
                
                <div className={cn(
                  "relative z-10 flex flex-col items-center justify-center h-full w-full p-4",
                  "transition-all duration-300",
                )}>
                  <motion.div 
                    className="mb-2 p-3 rounded-full bg-white/10 backdrop-blur-sm"
                    animate={isSelected ? { 
                      y: [0, -5, 0],
                      scale: [1, 1.1, 1]
                    } : {}}
                    transition={{
                      duration: 2,
                      repeat: isSelected ? Infinity : 0,
                      repeatType: "loop"
                    }}
                  >
                    {type.icon}
                  </motion.div>
                  <span className={cn(
                    typography.headings.primary,
                    "text-lg transition-all duration-300",
                    isSelected ? "text-white" : "text-white/90"
                  )}>
                    {type.name}
                  </span>
                  
                  <AnimatePresence>
                    {isSelected && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-center mt-2"
                      >
                        <p className="text-xs text-white/80 mb-2">{type.description}</p>
                        <ul className="text-left text-xs text-white/70 space-y-1">
                          {type.benefits.map((benefit, i) => (
                            <motion.li 
                              key={i}
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + (i * 0.1) }}
                              className="flex items-center"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-white/50 mr-1.5 flex-shrink-0" />
                              {benefit}
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* "Unlocked" animation overlay */}
                <AnimatePresence>
                  {showUnlock && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center rounded-2xl z-30"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ duration: 0.5, type: "spring" }}
                        className="flex flex-col items-center"
                      >
                        <Medal className="w-10 h-10 text-yellow-400 mb-2" />
                        <p className="text-white font-bold text-lg">Unlocked!</p>
                        <p className="text-white/80 text-xs">New abilities available</p>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>
          );
        })}
        
        {customTypes?.map((type) => (
          <div 
            key={type.id} 
            className="flex flex-col items-center space-y-2"
          >
            <button
              onClick={() => onSelect(type.name)}
              className={cn(
                "w-full aspect-square rounded-2xl flex items-center justify-center",
                "transition-all duration-300",
                "bg-gradient-to-br shadow-lg border border-white/10",
                `from-[${type.color_start}] to-[${type.color_end}]`,
                selectedType === type.name && [
                  "scale-105", 
                  "ring-2 ring-white/20 ring-offset-2 ring-offset-gray-900"
                ],
                "hover:scale-105 active:scale-95 hover:shadow-xl"
              )}
            >
              {type.icon}
            </button>
            <span 
              className={cn(
                "text-sm text-center w-full truncate",
                selectedType === type.name 
                  ? typography.text.primary
                  : typography.text.muted
              )}
            >
              {type.name}
            </span>
          </div>
        ))}
      </div>

      {selectedType && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center py-2 text-center mt-4"
        >
          <div className="px-6 py-3 bg-black/20 rounded-full backdrop-blur-sm border border-white/10 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-purple-500 animate-pulse" />
            <span className={cn(typography.text.primary, "font-semibold")}>{selectedType}</span>
            <span className={typography.text.muted}>selected</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
