
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Dumbbell, Bike, Heart, Activity } from "lucide-react";
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
}

const DEFAULT_TRAINING_TYPES: DefaultTrainingType[] = [
  {
    name: "Strength",
    icon: <Dumbbell className="h-7 w-7" />,
    gradient: "from-purple-500 via-purple-600 to-purple-700",
    activeGradient: "from-purple-400 via-purple-600 to-purple-800",
    bgColor: "bg-purple-500",
    description: "Build muscle and increase power"
  },
  {
    name: "Cardio",
    icon: <Bike className="h-7 w-7" />,
    gradient: "from-red-400 via-red-500 to-red-600",
    activeGradient: "from-red-300 via-red-500 to-red-700",
    bgColor: "bg-red-500",
    description: "Improve endurance and heart health"
  },
  {
    name: "Yoga",
    icon: <Heart className="h-7 w-7" />,
    gradient: "from-green-400 via-green-500 to-green-600",
    activeGradient: "from-green-300 via-green-500 to-green-700",
    bgColor: "bg-green-500",
    description: "Enhance flexibility and mindfulness"
  },
  {
    name: "Calisthenics",
    icon: (
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 24 24" 
        className="h-7 w-7 stroke-current"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 3v8" stroke="currentColor" />
        <path d="M9 7l3-3 3 3" stroke="currentColor" />
        <rect x="5" y="14" width="14" height="4" rx="2" stroke="currentColor" />
        <path d="M14 18v3" stroke="currentColor" />
        <path d="M10 18v3" stroke="currentColor" />
      </svg>
    ),
    gradient: "from-blue-400 via-blue-500 to-blue-600",
    activeGradient: "from-blue-300 via-blue-500 to-blue-700",
    bgColor: "bg-blue-500",
    description: "Master bodyweight exercises"
  }
];

export function TrainingTypeSelector({ selectedType, onSelect }: TrainingTypeSelectorProps) {
  const { user } = useAuth();
  const { stats } = useWorkoutStats();
  const [hoveredType, setHoveredType] = useState<string | null>(null);
  
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {DEFAULT_TRAINING_TYPES.map((type) => {
          const isSelected = selectedType === type.name;
          const isHovered = hoveredType === type.name;
          
          return (
            <motion.div 
              key={type.name}
              initial={{ scale: 1 }}
              animate={{ 
                scale: isSelected ? 1.05 : 1,
                y: isSelected ? -4 : 0
              }}
              className="flex flex-col items-center space-y-3"
            >
              <motion.button
                onHoverStart={() => setHoveredType(type.name)}
                onHoverEnd={() => setHoveredType(null)}
                onClick={() => onSelect(type.name)}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "relative overflow-hidden w-full aspect-square rounded-2xl flex flex-col items-center justify-center",
                  "transition-all duration-300",
                  "bg-gradient-to-br shadow-lg",
                  isSelected ? [
                    type.activeGradient,
                    "ring-2 ring-white/20 ring-offset-2 ring-offset-gray-900"
                  ] : type.gradient,
                  "hover:shadow-xl border border-white/10",
                )}
              >
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
                  isSelected ? "scale-105" : "",
                )}>
                  <div className="mb-2 p-3 rounded-full bg-white/10 backdrop-blur-sm">
                    {type.icon}
                  </div>
                  <span className={cn(
                    typography.headings.primary,
                    "text-lg transition-all duration-300",
                    isSelected ? "text-white" : "text-white/90"
                  )}>
                    {type.name}
                  </span>
                  
                  <AnimatePresence>
                    {isSelected && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-center text-white/80 mt-2"
                      >
                        {type.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
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
