
import React from "react";
import { Plus } from "lucide-react";

export function EmptyWorkoutState({ onTemplateSelect }) {
  const templates = [
    { 
      name: "Push", 
      description: "Decline Push-Up on Handrails • Mid-Grip Pull-Ups to ...",
      className: "exercise-label"
    },
    { 
      name: "Pull", 
      description: "Wide Grip Pull-Ups • Behind-the-Back Body Rows (R...",
      className: "exercise-label"
    },
    { 
      name: "Legs", 
      description: "Squat Variations • Leg Press • Romanian Deadlift",
      className: "exercise-label"
    },
    { 
      name: "Full Body", 
      description: "Decline Push-Up on Handrails • Wide Grip Pull-Ups • ...",
      className: "exercise-label"
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
                <h3 className="font-semibold text-white">{template.name}</h3>
                <p className={template.className}>{template.description}</p>
              </div>
              <Plus className="text-purple-400" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
