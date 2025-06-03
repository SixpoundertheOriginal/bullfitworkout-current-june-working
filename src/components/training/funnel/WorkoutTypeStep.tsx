
import React from "react";
import { TrainingTypeSelector } from "../TrainingTypeSelector";
import { Card } from "@/components/ui/card";

interface WorkoutTypeStepProps {
  selectedType: string;
  onSelect: (type: string) => void;
}

export function WorkoutTypeStep({ selectedType, onSelect }: WorkoutTypeStepProps) {
  return (
    <div className="px-6 py-8 h-full flex flex-col">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-white mb-2">
          Choose Your Adventure
        </h3>
        <p className="text-gray-400 text-base">
          Select the type of workout that matches your mood today
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <TrainingTypeSelector
          selectedType={selectedType}
          onSelect={onSelect}
        />
      </div>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">
          Tap any training type to continue
        </p>
      </div>
    </div>
  );
}
