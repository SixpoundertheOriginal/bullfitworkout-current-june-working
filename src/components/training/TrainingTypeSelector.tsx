
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Dumbbell, Bike, Heart, Activity } from "lucide-react";
import { useWorkoutStats } from "@/hooks/useWorkoutStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { typography } from '@/lib/typography';
import useEmblaCarousel from "embla-carousel-react";

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

export function TrainingTypeSelector({ selectedType, onSelect }: TrainingTypeSelectorProps) {
  const { user } = useAuth();
  const { stats } = useWorkoutStats();
  const [touchActive, setTouchActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const options = {
    align: "center" as const,
    loop: true,
    dragFree: true,
    containScroll: "trimSnaps" as const, // Changed from boolean to valid string value
    slidesToScroll: 1,
    duration: 30,
    inViewThreshold: 0.6,
    breakpoints: {
      '(min-width: 768px)': { slidesToScroll: 2 }
    }
  };
  
  const [emblaRef, emblaApi] = useEmblaCarousel(options);
  
  const [current, setCurrent] = useState(0);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

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
    if (!emblaApi) return;

    const onDragStart = () => setIsDragging(true);
    const onDragEnd = () => {
      setIsDragging(false);
      setTimeout(() => setIsDragging(false), 100);
    };

    emblaApi.on("pointerDown", onDragStart);
    emblaApi.on("pointerUp", onDragEnd);

    return () => {
      emblaApi.off("pointerDown", onDragStart);
      emblaApi.off("pointerUp", onDragEnd);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (emblaApi && selectedType) {
      const index = allTrainingTypes.findIndex(type => type.name === selectedType);
      if (index >= 0) {
        emblaApi.scrollTo(index);
        setCurrent(index);
      }
    }
  }, [selectedType, emblaApi, allTrainingTypes]);

  useEffect(() => {
    if (!emblaApi) {
      return undefined;
    }

    const onSelect = () => {
      setCurrent(emblaApi.selectedScrollSnap());
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };

    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const handleTypeSelect = (type: string) => {
    if (!isDragging) {
      onSelect(type);
      // selectSound?.play().catch(() => {});
    }
  };

  return (
    <div className="w-full overflow-visible relative">
      <div className="flex justify-center gap-2 mb-6">
        {DEFAULT_TRAINING_TYPES.map((_, index) => (
          <motion.div
            key={index}
            className={cn(
              "h-1 rounded-full transition-all duration-300 relative",
              current === index ? "w-8 bg-white" : "w-2 bg-white/20"
            )}
            animate={{
              width: current === index ? 32 : 8,
              opacity: current === index ? 1 : 0.2
            }}
          >
            {current === index && (
              <motion.div
                className="absolute inset-0 bg-white rounded-full"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.7, 1],
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
              />
            )}
          </motion.div>
        ))}
      </div>

      <div 
        ref={emblaRef} 
        className="overflow-hidden"
        onTouchStart={() => setTouchActive(true)}
        onTouchEnd={() => {
          setTouchActive(false);
          setIsDragging(false);
        }}
      >
        <div className="flex">
          {DEFAULT_TRAINING_TYPES.map((type, index) => {
            const isSelected = selectedType === type.name;
            
            return (
              <motion.div
                key={`${type.name}-${index}`}
                className="min-w-0 shrink-0 grow-0 basis-[200px] px-2"
                whileHover={{ scale: isSelected ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  onClick={() => handleTypeSelect(type.name)}
                  animate={{ 
                    scale: isSelected ? 1 : 0.95,
                    y: isSelected ? -4 : 0
                  }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "w-full aspect-square rounded-2xl p-4",
                    "flex flex-col items-center justify-center gap-3",
                    "bg-gradient-to-br backdrop-blur-sm",
                    "cursor-pointer relative overflow-hidden",
                    "transition-all duration-300 ease-out",
                    "border-2 border-white/10",
                    "shadow-lg",
                    isSelected ? [
                      `${type.activeGradient}`,
                      "ring-2 ring-white/30 ring-offset-2 ring-offset-gray-900",
                      "transform"
                    ] : [
                      type.gradient,
                      "hover:border-white/20 hover:shadow-xl"
                    ]
                  )}
                >
                  {type.level && (
                    <div className="absolute top-3 right-3">
                      <motion.div 
                        className={cn(
                          "flex items-center justify-center",
                          "h-7 px-2 rounded-full",
                          "bg-black/40 backdrop-blur-sm",
                          "border border-white/10"
                        )}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                      >
                        <span className="text-xs font-medium text-white">Lv{type.level}</span>
                      </motion.div>
                    </div>
                  )}

                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className={cn(
                      "mb-3 p-3 rounded-xl",
                      "bg-white/10 backdrop-blur-sm",
                      "shadow-inner border border-white/5"
                    )}
                  >
                    {type.icon}
                  </motion.div>
                  
                  <div className="text-center space-y-1">
                    <motion.h3
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className={cn(typography.headings.primary, "text-xl")}
                    >
                      {type.name}
                    </motion.h3>
                    
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.9 }}
                      transition={{ delay: 0.3 }}
                      className="text-sm text-white/80"
                    >
                      {type.description}
                    </motion.p>
                  </div>

                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2"
                    >
                      <div className="flex flex-wrap gap-1 justify-center">
                        {type.benefits?.slice(0, 3).map((benefit, i) => (
                          <motion.span
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            className={cn(
                              "px-2 py-0.5 text-xs rounded-full",
                              "bg-black/20 backdrop-blur-sm",
                              "border border-white/10",
                              "text-white/90"
                            )}
                          >
                            {benefit}
                          </motion.span>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {type.xp && (
                    <motion.div 
                      className="absolute bottom-3 left-3 right-3"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      <div className="h-1 bg-black/20 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${type.xp}%` }}
                          transition={{ delay: 0.5, duration: 1 }}
                          className="h-full bg-gradient-to-r from-white/30 to-white/10"
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
    </div>
  );
}
