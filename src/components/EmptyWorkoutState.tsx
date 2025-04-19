
import React from "react";
import { Plus, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyWorkoutStateProps {
  onTemplateSelect: (type: string) => void;
}

export function EmptyWorkoutState({ onTemplateSelect }: EmptyWorkoutStateProps) {
  const templates = [
    { name: "Push", description: "Chest, shoulders, triceps" },
    { name: "Pull", description: "Back, biceps, rear delts" },
    { name: "Legs", description: "Quads, hamstrings, calves" },
    { name: "Full Body", description: "Complete body workout" },
  ];

  return (
    <div className="text-center py-12">
      <div className="p-8 rounded-xl bg-gradient-to-r from-purple-600/10 to-pink-500/10 border border-purple-500/10 
        shadow-lg backdrop-blur-sm transform transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/5 
        relative overflow-hidden group">
        
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 bg-gradient-to-br from-purple-500/20 to-transparent 
          rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
        
        <h3 className="text-xl font-medium bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent relative">
          No exercises added yet
        </h3>
        
        <p className="text-gray-400 mt-2 mb-6 relative">
          Start with a template or add your first exercise below
        </p>

        <div className="flex flex-wrap gap-3 justify-center relative">
          {templates.map((template) => (
            <Button
              key={template.name}
              variant="outline"
              className="bg-gray-900/50 border-purple-500/20 hover:border-purple-500/40 hover:bg-gray-900/70
                transform transition-all duration-300 hover:scale-105 group/button"
              onClick={() => onTemplateSelect(template.name)}
            >
              <span className="mr-2">{template.name}</span>
              <Plus 
                size={16} 
                className="text-purple-400 group-hover/button:rotate-90 transition-transform duration-300" 
              />
            </Button>
          ))}
        </div>

        <div className="mt-8 flex justify-center relative">
          <ArrowDown 
            size={24} 
            className="text-purple-400/50 animate-bounce" 
          />
        </div>
      </div>
    </div>
  );
}
