
import React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyWorkoutState({ onTemplateSelect }) {
  const templates = [
    { 
      name: "Push", 
      description: "Decline Push-Up on Handrails • Mid-Grip Pull-Ups to ...",
    },
    { 
      name: "Pull", 
      description: "Wide Grip Pull-Ups • Behind-the-Back Body Rows (R...",
    },
    { 
      name: "Legs", 
      description: "Squat Variations • Leg Press • Romanian Deadlift",
    },
    { 
      name: "Full Body", 
      description: "Decline Push-Up on Handrails • Wide Grip Pull-Ups • ...",
    }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {templates.map((template) => (
          <button
            key={template.name}
            onClick={() => onTemplateSelect(template.name)}
            className="bg-gray-800/50 rounded-lg p-4 text-left hover:bg-gray-700/50 transition-colors"
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-semibold dark-text">{template.name}</h3>
                <p className="dark-text-muted text-sm">{template.description}</p>
              </div>
              <Plus className="text-purple-400" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
