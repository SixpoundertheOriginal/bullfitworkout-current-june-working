
import React from "react";
import { TagSelector } from "@/components/ui/TagSelector";
import { useWorkoutStatsContext } from "@/context/WorkoutStatsProvider";
import { Hash } from "lucide-react";

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

const getCategoriesForType = (trainingType?: string) => {
  const trainingCategory = trainingType?.toLowerCase() || 'default';
  return categoryConfig[trainingCategory as keyof typeof categoryConfig] || 
         categoryConfig.default;
};

export function WorkoutTagPicker({ selectedTags, onToggleTag, trainingType }: WorkoutTagPickerProps) {
  const { stats } = useWorkoutStatsContext();

  // Get historical tags specific to training type
  const getHistoricalTags = () => {
    if (!stats.tags || stats.tags.length === 0) return [];
    
    return stats.tags
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

  const categories = enhanceWithHistoricalTags(getCategoriesForType(trainingType));

  return (
    <div className="space-y-6">
      {categories.map((category) => (
        <TagSelector
          key={category.id}
          label={category.label}
          options={category.tags.map(tag => ({ label: tag, value: tag }))}
          selected={selectedTags.filter(tag => category.tags.includes(tag))}
          onChange={(newSelected) => {
            // Handle multi-category selection by toggling individual tags
            const categoryTags = category.tags;
            const currentCategorySelection = selectedTags.filter(tag => categoryTags.includes(tag));
            
            // Find what changed
            const added = newSelected.filter(tag => !currentCategorySelection.includes(tag));
            const removed = currentCategorySelection.filter(tag => !newSelected.includes(tag));
            
            // Apply changes
            added.forEach(tag => onToggleTag(tag));
            removed.forEach(tag => onToggleTag(tag));
          }}
          placeholder={`Select ${category.label.toLowerCase()}`}
        />
      ))}
    </div>
  );
}
