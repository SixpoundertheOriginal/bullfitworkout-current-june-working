
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Dumbbell, Bike, Heart, Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { useWorkoutStats } from "@/hooks/useWorkoutStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { typography } from '@/lib/typography';
import { Button } from "@/components/ui/button";
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem,
} from "@/components/ui/carousel";
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
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    loop: false,
    dragFree: false, // Changed to false for smoother snapping
    containScroll: "trimSnaps",
    slidesToScroll: 1,
    speed: 20, // Increased animation speed
    inViewThreshold: 0.7, // Improved threshold for better snap
  });
  
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

    emblaApi.on("dragStart", () => setIsDragging(true));
    emblaApi.on("dragEnd", () => setIsDragging(false));

    return () => {
      emblaApi.off("dragStart", () => setIsDragging(true));
      emblaApi.off("dragEnd", () => setIsDragging(false));
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

  const handleManualScroll = (direction: 'prev' | 'next') => {
    if (!emblaApi) return;
    
    if (direction === 'prev' && canScrollPrev) {
      emblaApi.scrollPrev({ duration: 300 });
    } else if (direction === 'next' && canScrollNext) {
      emblaApi.scrollNext({ duration: 300 });
    }
  };

  return (
    <div 
      className="w-full overflow-visible relative"
      onTouchStart={() => setTouchActive(true)}
      onTouchEnd={() => {
        setTouchActive(false);
        setIsDragging(false);
      }}
    >
      <div className="flex justify-center gap-1 mb-3">
        {allTrainingTypes.map((_, index) => (
          <motion.div
            key={index}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              current === index ? "w-4 bg-white" : "w-1.5 bg-white/30"
            )}
            animate={{
              width: current === index ? 16 : 6,
              opacity: current === index ? 1 : 0.5
            }}
          />
        ))}
      </div>

      <div className="relative">
        <Button
          onClick={() => handleManualScroll('prev')}
          variant="ghost"
          size="icon"
          className={cn(
            "absolute left-0 z-10 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full",
            "bg-black/30 border-white/10 hover:bg-black/50",
            "transition-all duration-200 backdrop-blur-sm",
            !canScrollPrev && "opacity-30 pointer-events-none"
          )}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex px-10 md:px-16">
            {allTrainingTypes.map((type, index) => {
              const isSelected = selectedType === type.name;
              
              return (
                <div 
                  key={`${type.name}-${index}`} 
                  className="min-w-0 shrink-0 grow-0 basis-[280px] px-2 py-1"
                >
                  <motion.div
                    className={cn(
                      "w-full cursor-grab active:cursor-grabbing",
                      "transition-all duration-300",
                      isSelected ? "scale-100" : "scale-95 hover:scale-98"
                    )}
                    onClick={() => !isDragging && onSelect(type.name)}
                    whileHover={{ scale: isSelected ? 1 : 0.98 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div
                      className={cn(
                        "w-full h-[280px] rounded-3xl p-6",
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
                        
                        {type.description && (
                          <p className={cn(
                            typography.text.secondary,
                            "text-sm mb-4"
                          )}>
                            {type.description}
                          </p>
                        )}

                        {isSelected && type.benefits && type.benefits.length > 0 && (
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
                </div>
              );
            })}
          </div>
        </div>
        
        <Button
          onClick={() => handleManualScroll('next')}
          variant="ghost"
          size="icon"
          className={cn(
            "absolute right-0 z-10 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full",
            "bg-black/30 border-white/10 hover:bg-black/50",
            "transition-all duration-200 backdrop-blur-sm",
            !canScrollNext && "opacity-30 pointer-events-none"
          )}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ 
          opacity: touchActive ? 0 : 1, 
          y: touchActive ? 20 : 0 
        }}
        transition={{ 
          delay: 0.5,
          duration: 0.2
        }}
        className="mt-4 text-center text-white/60 text-xs flex items-center justify-center"
      >
        <ChevronLeft size={14} className="mr-1 animate-pulse" /> 
        Swipe to see more training types 
        <ChevronRight size={14} className="ml-1 animate-pulse" />
      </motion.div>
    </div>
  );
}
