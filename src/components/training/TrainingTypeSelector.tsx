
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Dumbbell, Bike, Heart, Activity } from "lucide-react";
import { useWorkoutStats } from "@/hooks/useWorkoutStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
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
  const [centerPoint, setCenterPoint] = useState({ x: 0, y: 0 });

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

  useEffect(() => {
    const updateCenterPoint = () => {
      const container = document.getElementById('radial-menu-container');
      if (container) {
        const rect = container.getBoundingClientRect();
        setCenterPoint({
          x: rect.width / 2,
          y: rect.height / 2
        });
      }
    };

    updateCenterPoint();
    window.addEventListener('resize', updateCenterPoint);
    return () => window.removeEventListener('resize', updateCenterPoint);
  }, []);

  const handleTypeSelect = (type: string) => {
    if (!isDragging) {
      onSelect(type);
    }
  };

  return (
    <div className="w-full relative">
      <div className="flex justify-center gap-2 mb-6">
        {DEFAULT_TRAINING_TYPES.map((_, index) => (
          <motion.div
            key={index}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              selectedType === DEFAULT_TRAINING_TYPES[index].name ? "w-8 bg-white" : "w-2 bg-white/20"
            )}
          />
        ))}
      </div>

      <div 
        id="radial-menu-container"
        className="relative h-[400px] w-full flex items-center justify-center"
        onTouchStart={() => setTouchActive(true)}
        onTouchEnd={() => {
          setTouchActive(false);
          setIsDragging(false);
        }}
      >
        {DEFAULT_TRAINING_TYPES.map((type, index) => {
          const angle = (index * (360 / DEFAULT_TRAINING_TYPES.length)) * (Math.PI / 180);
          const radius = 150; // Adjust this value to change the circle size
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const isSelected = selectedType === type.name;
          
          return (
            <motion.div
              key={type.name}
              initial={{ scale: 0, x: 0, y: 0 }}
              animate={{
                scale: 1,
                x: centerPoint.x + x - 100, // Adjusted to center cards better
                y: centerPoint.y + y - 100, // Adjusted to center cards better
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: index * 0.1,
              }}
              className="absolute"
              style={{ width: 200, height: 200 }} // Increased size
            >
              <motion.div
                onClick={() => handleTypeSelect(type.name)}
                whileHover={{ scale: isSelected ? 1 : 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "w-full h-full rounded-3xl p-6", // Increased border radius
                  "flex flex-col items-center justify-center gap-4", // Increased gap
                  "bg-gradient-to-br backdrop-blur-sm",
                  "cursor-pointer relative overflow-hidden",
                  "transition-all duration-300 ease-out",
                  "border-2 shadow-lg",
                  isSelected ? [
                    `${type.activeGradient}`,
                    "border-white ring-4 ring-white/30 ring-offset-2 ring-offset-gray-900",
                    "transform scale-110 z-10"
                  ] : [
                    type.gradient,
                    "border-white/10 hover:border-white/20"
                  ]
                )}
              >
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={cn(
                    "mb-4 p-4 rounded-2xl", // Increased padding and border radius
                    "bg-white/10 backdrop-blur-sm",
                    "shadow-inner border border-white/5"
                  )}
                >
                  {type.icon}
                </motion.div>
                
                <div className="text-center">
                  <motion.h3
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(typography.headings.primary, "text-xl")} // Increased text size
                  >
                    {type.name}
                  </motion.h3>
                </div>

                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute bottom-3 left-3 right-3" // Adjusted positioning
                  >
                    <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${type.xp || 50}%` }}
                        transition={{ delay: 0.2, duration: 0.8 }}
                        className="h-full bg-white/30"
                      />
                    </div>
                  </motion.div>
                )}
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
