import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Dumbbell, Bike, Heart, Activity } from "lucide-react";
import { useWorkoutStats } from "@/hooks/useWorkoutStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
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

export function TrainingTypeSelector({ selectedType, onSelect }: TrainingTypeSelectorProps) {
  const { user } = useAuth();
  const { stats } = useWorkoutStats();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

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

  useEffect(() => {
    if (scrollRef.current && selectedType) {
      const container = scrollRef.current;
      const selectedElement = container.querySelector(`[data-type="${selectedType}"]`);
      
      if (selectedElement) {
        const containerWidth = container.offsetWidth;
        const elementWidth = selectedElement.clientWidth;
        const elementLeft = (selectedElement as HTMLElement).offsetLeft;
        
        container.scrollTo({
          left: elementLeft - (containerWidth / 2) + (elementWidth / 2),
          behavior: 'smooth'
        });
      }
    }
  }, [selectedType]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current!.offsetLeft);
    setScrollLeft(scrollRef.current!.scrollLeft);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current!.offsetLeft;
    const walk = (x - startX) * 2;
    scrollRef.current!.scrollLeft = scrollLeft - walk;
  };

  return (
    <div className="w-full overflow-hidden">
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto px-4 py-6 snap-x snap-mandatory scrollbar-none"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseUp}
      >
        {DEFAULT_TRAINING_TYPES.map((type, index) => {
          const isSelected = selectedType === type.name;
          
          return (
            <motion.div
              key={type.name}
              className={cn(
                "flex-shrink-0 snap-center",
                "w-[280px] h-[280px]",
                "transition-all duration-300",
                isSelected ? "scale-100" : "scale-90 hover:scale-95"
              )}
              onClick={() => onSelect(type.name)}
              data-type={type.name}
              whileHover={{ scale: isSelected ? 1 : 0.95 }}
              whileTap={{ scale: 0.95 }}
            >
              <div
                className={cn(
                  "w-full h-full rounded-3xl p-6",
                  "flex flex-col items-center justify-center gap-4",
                  "bg-gradient-to-br shadow-lg cursor-pointer",
                  "transition-all duration-300",
                  isSelected ? [
                    `${type.activeGradient}`,
                    "ring-2 ring-white/20 ring-offset-2 ring-offset-gray-900"
                  ] : type.gradient,
                  "relative overflow-hidden"
                )}
              >
                {type.level && (
                  <div className="absolute top-4 right-4 z-20">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm">
                      <span className="text-xs font-bold text-white">Lv{type.level}</span>
                    </div>
                  </div>
                )}

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className={cn(
                    "mb-4 p-4 rounded-full",
                    "bg-white/10 backdrop-blur-sm",
                    "transition-all duration-300"
                  )}>
                    {type.icon}
                  </div>
                  
                  <h3 className={cn(
                    typography.headings.primary,
                    "text-2xl mb-2"
                  )}>
                    {type.name}
                  </h3>
                  
                  <p className={cn(
                    typography.text.secondary,
                    "text-sm mb-4"
                  )}>
                    {type.description}
                  </p>

                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col items-center"
                    >
                      <div className="flex flex-wrap gap-2 justify-center">
                        {type.benefits.slice(0, 2).map((benefit, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs rounded-full bg-white/10 text-white/90"
                          >
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {type.xp && (
                  <div className="absolute bottom-4 left-4 right-4 h-1 bg-black/30 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${type.xp}%` }}
                      transition={{ delay: 0.5, duration: 1 }}
                      className="h-full bg-gradient-to-r from-white/30 to-white/10"
                    />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {customTypes?.map((type) => (
          <div 
            key={type.id} 
            className="flex-shrink-0 snap-center flex flex-col items-center space-y-2"
          >
            <button
              onClick={() => onSelect(type.name)}
              className={cn(
                "w-[280px] h-[280px] rounded-3xl flex items-center justify-center",
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
    </div>
  );
}
