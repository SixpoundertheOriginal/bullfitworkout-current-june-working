import React from "react";
import { cn } from "@/lib/utils";
import { useWorkoutStats } from "@/hooks/useWorkoutStats";

interface WorkoutTagPickerProps {
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  trainingType?: string;
}

const tagCategories = {
  strength: {
    pattern: /(strength|muscle|lifting|power|gains)/i,
    colors: {
      base: "bg-purple-500/20",
      border: "border-purple-500/30",
      glow: "shadow-purple-500/20",
      hover: "hover:bg-purple-500/30",
      text: "text-purple-200"
    }
  },
  cardio: {
    pattern: /(cardio|running|endurance|hiit|conditioning)/i,
    colors: {
      base: "bg-red-500/20",
      border: "border-red-500/30",
      glow: "shadow-red-500/20",
      hover: "hover:bg-red-500/30",
      text: "text-red-200"
    }
  },
  recovery: {
    pattern: /(recovery|mobility|flexibility|stretch|yoga)/i,
    colors: {
      base: "bg-green-500/20",
      border: "border-green-500/30",
      glow: "shadow-green-500/20",
      hover: "hover:bg-green-500/30",
      text: "text-green-200"
    }
  },
  default: {
    pattern: /.*/i,
    colors: {
      base: "bg-gray-500/20",
      border: "border-gray-700",
      glow: "shadow-white/10",
      hover: "hover:bg-gray-500/30",
      text: "text-gray-200"
    }
  }
};

export function WorkoutTagPicker({ selectedTags, onToggleTag, trainingType }: WorkoutTagPickerProps) {
  const { stats } = useWorkoutStats();
  
  const currentHour = new Date().getHours();
  
  const getTagCategory = (tag: string) => {
    for (const [category, { pattern }] of Object.entries(tagCategories)) {
      if (category === 'default') continue;
      if (pattern.test(tag)) return category;
    }
    return 'default';
  };

  const getTagColors = (tag: string) => {
    const category = getTagCategory(tag);
    return tagCategories[category]?.colors || tagCategories.default.colors;
  };

  const getSuggestedTags = () => {
    let suggestions = new Set<string>();
    
    if (trainingType?.toLowerCase().includes('strength')) {
      suggestions.add('Strength');
      suggestions.add('Muscle');
      suggestions.add('Power');
    } else if (trainingType?.toLowerCase().includes('cardio')) {
      suggestions.add('Cardio');
      suggestions.add('Endurance');
      suggestions.add('HIIT');
    }
    
    if (currentHour >= 5 && currentHour < 11) {
      suggestions.add('Morning');
      suggestions.add('Energy');
    } else if (currentHour >= 11 && currentHour < 17) {
      suggestions.add('Afternoon');
    } else if (currentHour >= 17 && currentHour < 22) {
      suggestions.add('Evening');
      suggestions.add('After Work');
    }
    
    if (stats.tags) {
      stats.tags.slice(0, 5).forEach(tag => suggestions.add(tag.name));
    }
    
    return Array.from(suggestions);
  };

  const suggestedTags = getSuggestedTags();

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {suggestedTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          const colors = getTagColors(tag);
          
          return (
            <button
              key={tag}
              onClick={() => onToggleTag(tag)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm transition-all duration-200",
                "border border-opacity-50 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background",
                colors.base,
                colors.border,
                colors.text,
                colors.hover,
                isSelected && [
                  "scale-105",
                  "shadow-lg",
                  colors.glow,
                  "border-opacity-100"
                ]
              )}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
