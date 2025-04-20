
import React from "react";
import { cn } from "@/lib/utils";
import { Dumbbell, Bike, Heart, Activity } from "lucide-react";
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
  bgColor: string;
}

const DEFAULT_TRAINING_TYPES: DefaultTrainingType[] = [
  {
    name: "Strength",
    icon: <Dumbbell className="h-7 w-7" />,
    gradient: "from-purple-500 via-purple-600 to-purple-700",
    bgColor: "bg-purple-500"
  },
  {
    name: "Cardio",
    icon: <Bike className="h-7 w-7" />,
    gradient: "from-red-400 via-red-500 to-red-600",
    bgColor: "bg-red-500"
  },
  {
    name: "Yoga",
    icon: <Heart className="h-7 w-7" />,
    gradient: "from-green-400 via-green-500 to-green-600",
    bgColor: "bg-green-500"
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
    bgColor: "bg-blue-500"
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
          <div 
            key={type.name} 
            className="flex flex-col items-center w-20 space-y-2"
          >
            <button
              onClick={() => onSelect(type.name)}
              className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center",
                "transition-all duration-300 text-white",
                "bg-gradient-to-br shadow-lg border border-white/10",
                type.gradient,
                selectedType === type.name && [
                  "scale-105", 
                  "ring-[3px] ring-purple-500 ring-offset-2 ring-offset-gray-900"
                ],
                "hover:scale-105 active:scale-95"
              )}
            >
              {type.icon}
            </button>
            <span 
              className={cn(
                "text-sm text-center w-full truncate",
                selectedType === type.name 
                  ? "font-medium text-white" 
                  : "text-gray-400"
              )}
            >
              {type.name}
            </span>
          </div>
        ))}
        
        {customTypes?.map((type) => (
          <div 
            key={type.id} 
            className="flex flex-col items-center w-20 space-y-2"
          >
            <button
              onClick={() => onSelect(type.name)}
              className={cn(
                "w-20 h-20 rounded-2xl flex items-center justify-center",
                "transition-all duration-300 text-white",
                "bg-gradient-to-br shadow-lg border border-white/10",
                `from-[${type.color_start}] to-[${type.color_end}]`,
                selectedType === type.name && [
                  "scale-105", 
                  "ring-[3px] ring-purple-500 ring-offset-2 ring-offset-gray-900"
                ],
                "hover:scale-105 active:scale-95"
              )}
            >
              {type.icon}
            </button>
            <span 
              className={cn(
                "text-sm text-center w-full truncate",
                selectedType === type.name 
                  ? "font-medium text-white" 
                  : "text-gray-400"
              )}
            >
              {type.name}
            </span>
          </div>
        ))}
      </div>

      {selectedType && (
        <div className="flex items-center justify-center py-2 text-center">
          <div className="px-4 py-2 bg-black/20 rounded-full backdrop-blur-sm border border-white/10">
            <span className="text-sm text-white/80">Selected Training Type: </span>
            <span className="font-medium text-white">{selectedType}</span>
          </div>
        </div>
      )}
    </div>
  );
}
