
import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Dumbbell, Bike, Heart, Activity } from "lucide-react";
import { useWorkoutStats } from "@/hooks/useWorkoutStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { typography } from '@/lib/typography';
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

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
  const [carouselApi, setCarouselApi] = useState<any>(null);

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

  // Set up initial position when selectedType changes
  useEffect(() => {
    if (carouselApi && selectedType) {
      const index = DEFAULT_TRAINING_TYPES.findIndex(type => type.name === selectedType);
      if (index >= 0) {
        carouselApi.scrollTo(index, { immediate: false });
      }
    }
  }, [selectedType, carouselApi]);

  // All training types combined
  const allTrainingTypes = [
    ...DEFAULT_TRAINING_TYPES,
    ...(customTypes || []).map(type => ({
      name: type.name,
      icon: type.icon,
      gradient: `from-[${type.color_start}] to-[${type.color_end}]`,
      activeGradient: `from-[${type.color_start}] via-[${type.color_mid || type.color_start}] to-[${type.color_end}]`,
      bgColor: `bg-[${type.color_start}]`,
      description: type.description || '',
      benefits: type.benefits || [],
      level: type.level,
      xp: type.xp
    }))
  ];

  return (
    <div className="w-full overflow-hidden">
      <Carousel
        setApi={setCarouselApi}
        opts={{
          align: "center",
          loop: false
        }}
        className="w-full"
      >
        <CarouselContent className="px-2">
          {allTrainingTypes.map((type, index) => {
            const isSelected = selectedType === type.name;
            
            return (
              <CarouselItem key={`${type.name}-${index}`} className="pl-4 md:basis-auto basis-[280px]">
                <motion.div
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
                            {type.benefits?.slice(0, 2).map((benefit, i) => (
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
              </CarouselItem>
            );
          })}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
