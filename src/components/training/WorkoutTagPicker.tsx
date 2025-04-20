
import React from "react";
import { cn } from "@/lib/utils";
import { useWorkoutStats } from "@/hooks/useWorkoutStats";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface WorkoutTagPickerProps {
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  trainingType?: string;
}

interface TagCategory {
  id: string;
  label: string;
  tags: string[];
}

const categoryConfig: Record<string, TagCategory[]> = {
  strength: [
    {
      id: "movement",
      label: "Movement Pattern",
      tags: ["Push", "Pull", "Upper Body", "Lower Body"]
    },
    {
      id: "body",
      label: "Body Focus",
      tags: ["Chest", "Back", "Core", "Shoulders", "Arms", "Legs", "Abs"]
    },
    {
      id: "goal",
      label: "Goal-Oriented",
      tags: ["Strength", "Power", "Hypertrophy", "Endurance"]
    },
    {
      id: "context",
      label: "Session Context",
      tags: ["Morning", "Afternoon", "Evening", "High Intensity", "Training"]
    }
  ],
  cardio: [
    {
      id: "type",
      label: "Type",
      tags: ["Running", "Cycling", "Swimming", "HIIT", "Interval"]
    },
    {
      id: "intensity",
      label: "Intensity",
      tags: ["High Intensity", "Low Intensity", "Moderate", "Endurance"]
    },
    {
      id: "context",
      label: "Session Context",
      tags: ["Morning", "Afternoon", "Evening", "Outdoors", "Training"]
    }
  ],
  recovery: [
    {
      id: "type",
      label: "Type",
      tags: ["Stretching", "Yoga", "Mobility", "Foam Rolling", "Joint Health"]
    },
    {
      id: "focus",
      label: "Focus Areas",
      tags: ["Upper Body", "Lower Body", "Back", "Legs", "Full Body"]
    },
    {
      id: "context",
      label: "Session Context",
      tags: ["Morning", "Evening", "Active Recovery", "Cool Down"]
    }
  ],
  default: [
    {
      id: "body",
      label: "Body Focus",
      tags: ["Chest", "Back", "Core", "Shoulders", "Arms", "Legs", "Abs"]
    },
    {
      id: "movement",
      label: "Movement Pattern",
      tags: ["Push", "Pull", "Upper Body", "Lower Body"]
    },
    {
      id: "context",
      label: "Session Context",
      tags: ["Morning", "Afternoon", "Evening", "Training"]
    }
  ]
};

const tagCategories = {
  strength: {
    pattern: /(strength|muscle|lifting|power|gains|push|pull|legs|upper|lower|core|back|chest|shoulders|arms|abs)/i,
    colors: {
      base: "bg-purple-500/20",
      border: "border-purple-500/30",
      glow: "shadow-purple-500/20",
      hover: "hover:bg-purple-500/30",
      text: "text-purple-200"
    }
  },
  cardio: {
    pattern: /(cardio|running|endurance|hiit|cycling|swimming|treadmill|stepper|rowing|elliptical)/i,
    colors: {
      base: "bg-red-500/20",
      border: "border-red-500/30",
      glow: "shadow-red-500/20",
      hover: "hover:bg-red-500/30",
      text: "text-red-200"
    }
  },
  recovery: {
    pattern: /(recovery|mobility|flexibility|stretch|yoga|foam|joint|cooldown)/i,
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

  const getCategoriesForType = () => {
    const trainingCategory = trainingType?.toLowerCase() || 'default';
    return categoryConfig[trainingCategory as keyof typeof categoryConfig] || 
           categoryConfig.default;
  };

  // Get historical tags specific to training type
  const getHistoricalTags = () => {
    if (!stats.tags) return [];
    
    return stats.tags
      .filter(tag => {
        const category = getTagCategory(tag.name);
        const trainingCategory = trainingType?.toLowerCase() || 'default';
        return category === trainingCategory || category === 'default';
      })
      .slice(0, 5)
      .map(tag => tag.name);
  };

  // Combine suggested tags with historical tags
  const enhanceWithHistoricalTags = (categories: TagCategory[]) => {
    const historicalTags = getHistoricalTags();
    
    if (historicalTags.length > 0) {
      categories.push({
        id: "recent",
        label: "Recently Used",
        tags: historicalTags
      });
    }
    
    return categories;
  };

  const categories = enhanceWithHistoricalTags(getCategoriesForType());

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <div key={category.id} className="space-y-3">
          <h4 className="text-sm font-medium text-gray-400">{category.label}</h4>
          <div className="flex flex-wrap gap-2">
            {category.tags.map((tag) => {
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
      ))}
    </div>
  );
}
