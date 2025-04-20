
import React from "react";
import { cn } from "@/lib/utils";
import { Dumbbell, Bike, Heart, Activity, PullUp } from "lucide-react";
import { useWorkoutStats } from "@/hooks/useWorkoutStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

interface TrainingTypeSelectorProps {
  selectedType: string;
  onSelect: (type: string) => void;
}

type DefaultTrainingType = {
  name: string;
  icon: React.ReactNode;
  gradient: string;
}

const DEFAULT_TRAINING_TYPES: DefaultTrainingType[] = [
  {
    name: "Strength",
    icon: <Dumbbell className="h-7 w-7" />,
    gradient: "from-purple-500 via-purple-600 to-purple-700"
  },
  {
    name: "Cardio",
    icon: <Bike className="h-7 w-7" />,
    gradient: "from-red-400 via-red-500 to-red-600"
  },
  {
    name: "Yoga",
    icon: <Heart className="h-7 w-7" />,
    gradient: "from-green-400 via-green-500 to-green-600"
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
    gradient: "from-blue-400 via-blue-500 to-blue-600"
  }
];

export function TrainingTypeSelector({ selectedType, onSelect }: TrainingTypeSelectorProps) {
  const { user } = useAuth();
  const { stats } = useWorkoutStats();
  
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
    const typeStats = stats.workoutTypes.find(t => t.type === typeName);
    if (!typeStats) return "md";
    
    const totalWorkouts = stats.totalWorkouts;
    const percentage = (typeStats.count / totalWorkouts) * 100;
    
    if (percentage > 30) return "lg";
    if (percentage > 15) return "md";
    return "sm";
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 justify-center">
        {DEFAULT_TRAINING_TYPES.map((type) => (
          <Button
            key={type.name}
            onClick={() => onSelect(type.name)}
            variant="icon-circle"
            size="lg"
            iconOnly
            icon={type.icon}
            className={cn(
              "bg-gradient-to-br text-white shadow-lg transition-all duration-300",
              type.gradient,
              selectedType === type.name && "ring-4 ring-purple-500/50 ring-offset-4 ring-offset-background scale-110",
              "hover:scale-105 active:scale-95",
              "group relative rounded-[1.5rem]"
            )}
          >
            <span className="absolute -bottom-6 text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {type.name}
            </span>
          </Button>
        ))}
        
        {customTypes?.map((type) => (
          <Button
            key={type.id}
            onClick={() => onSelect(type.name)}
            variant="icon-circle"
            size="lg"
            iconOnly
            icon={type.icon}
            className={cn(
              "bg-gradient-to-br text-white",
              `from-[${type.color_start}] to-[${type.color_end}]`,
              selectedType === type.name && "ring-4 ring-purple-500 ring-offset-4 ring-offset-background",
              "group relative"
            )}
          >
            <span className="absolute -bottom-6 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              {type.name}
            </span>
          </Button>
        ))}
      </div>

      {selectedType && (
        <div className="flex items-center justify-center py-2 text-center">
          <div className="px-4 py-2 bg-white/5 rounded-full backdrop-blur-sm border border-white/10">
            <span className="text-sm text-white/80">Selected Training Type: </span>
            <span className="font-medium text-white">{selectedType}</span>
          </div>
        </div>
      )}
    </div>
  );
}
