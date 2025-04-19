
import React from "react";
import { cn } from "@/lib/utils";
import { Dumbbell, Bike, Weight } from "lucide-react"; // Changed from Running, Yoga to icons that exist
import { useWorkoutStats } from "@/hooks/useWorkoutStats";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

interface TrainingTypeSelectorProps {
  selectedType: string;
  onSelect: (type: string) => void;
}

type DefaultTrainingType = {
  name: string;
  icon: React.ReactNode;
  gradient: {
    from: string;
    to: string;
  };
}

const DEFAULT_TRAINING_TYPES: DefaultTrainingType[] = [
  {
    name: "Strength",
    icon: <Dumbbell className="h-6 w-6" />,
    gradient: { from: "#9b87f5", to: "#6E59A5" }
  },
  {
    name: "Cardio",
    icon: <Bike className="h-6 w-6" />, // Changed from Running to Bike
    gradient: { from: "#f87171", to: "#dc2626" }
  },
  {
    name: "Yoga",
    icon: <Weight className="h-6 w-6" rotate={45} />, // Changed Yoga to Weight with rotation
    gradient: { from: "#22c55e", to: "#16a34a" }
  },
  {
    name: "Calisthenics",
    icon: <Weight className="h-6 w-6" />,
    gradient: { from: "#60a5fa", to: "#2563eb" }
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

  // Get workout type statistics for sizing
  const getTypeSize = (typeName: string) => {
    const typeStats = stats.workoutTypes.find(t => t.type === typeName);
    if (!typeStats) return "md";
    
    const totalWorkouts = stats.totalWorkouts;
    const percentage = (typeStats.count / totalWorkouts) * 100;
    
    if (percentage > 30) return "lg";
    if (percentage > 15) return "md";
    return "sm";
  };

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-20 w-20",
    lg: "h-24 w-24"
  };

  return (
    <div className="flex flex-wrap gap-4 justify-center">
      {DEFAULT_TRAINING_TYPES.map((type) => {
        const size = getTypeSize(type.name);
        return (
          <button
            key={type.name}
            onClick={() => onSelect(type.name)}
            className={cn(
              "relative rounded-full transition-all duration-300 flex items-center justify-center",
              sizeClasses[size as keyof typeof sizeClasses],
              selectedType === type.name ? "ring-4 ring-purple-500 ring-offset-4 ring-offset-gray-900" : "",
              "hover:scale-110 group"
            )}
            style={{
              background: `linear-gradient(135deg, ${type.gradient.from}, ${type.gradient.to})`
            }}
          >
            {type.icon}
            <span className="absolute -bottom-6 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              {type.name}
            </span>
          </button>
        );
      })}
      
      {customTypes?.map((type) => (
        <button
          key={type.id}
          onClick={() => onSelect(type.name)}
          className={cn(
            "relative h-16 w-16 rounded-full transition-all duration-300 flex items-center justify-center",
            selectedType === type.name ? "ring-4 ring-purple-500 ring-offset-4 ring-offset-gray-900" : "",
            "hover:scale-110 group"
          )}
          style={{
            background: `linear-gradient(135deg, ${type.color_start}, ${type.color_end})`
          }}
        >
          {type.icon}
          <span className="absolute -bottom-6 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
            {type.name}
          </span>
        </button>
      ))}
    </div>
  );
}
