
import React from "react";
import { cn } from "@/lib/utils";
import { Dumbbell, Bike, Weight } from "lucide-react";
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
    icon: <Dumbbell className="h-6 w-6" />,
    gradient: "from-purple-600 to-purple-700"
  },
  {
    name: "Cardio",
    icon: <Bike className="h-6 w-6" />,
    gradient: "from-red-500 to-red-600"
  },
  {
    name: "Yoga",
    icon: <Weight className="h-6 w-6 rotate-45" />,
    gradient: "from-green-500 to-green-600"
  },
  {
    name: "Calisthenics",
    icon: <Weight className="h-6 w-6" />,
    gradient: "from-blue-500 to-blue-600"
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
              "bg-gradient-to-br text-white",
              type.gradient,
              selectedType === type.name && "ring-4 ring-purple-500 ring-offset-4 ring-offset-background",
              "group relative"
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

      {/* Add the selected type label */}
      {selectedType && (
        <div className="flex items-center justify-center py-2 text-center">
          <div className="px-4 py-2 bg-white/5 rounded-full backdrop-blur-sm">
            <span className="text-sm text-white/80">Selected Training Type: </span>
            <span className="font-medium text-white">{selectedType}</span>
          </div>
        </div>
      )}
    </div>
  );
}
