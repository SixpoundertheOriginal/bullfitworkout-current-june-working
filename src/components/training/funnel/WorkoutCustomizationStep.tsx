
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { WorkoutTagPicker } from "../WorkoutTagPicker";
import { DurationSelector } from "../DurationSelector";
import { Badge } from "@/components/ui/badge";
import { Clock, Tag } from "lucide-react";

interface WorkoutCustomizationStepProps {
  trainingType: string;
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
  duration: number;
  onDurationChange: (duration: number) => void;
}

export function WorkoutCustomizationStep({
  trainingType,
  selectedTags,
  onToggleTag,
  duration,
  onDurationChange,
}: WorkoutCustomizationStepProps) {
  return (
    <div className="px-6 py-6 h-full overflow-y-auto">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Badge variant="outline" className="text-purple-400 border-purple-400/30">
            {trainingType}
          </Badge>
        </div>
        <h3 className="text-xl font-bold text-white mb-1">
          Customize Your Workout
        </h3>
        <p className="text-gray-400 text-sm">
          Fine-tune your session for the perfect challenge
        </p>
      </div>

      <div className="space-y-6">
        {/* Duration Section */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-purple-400" />
              <h4 className="font-medium text-white">Workout Duration</h4>
            </div>
            <DurationSelector value={duration} onChange={onDurationChange} />
          </CardContent>
        </Card>

        {/* Tags Section */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <Tag className="h-5 w-5 text-purple-400" />
              <h4 className="font-medium text-white">Focus Areas</h4>
              {selectedTags.length > 0 && (
                <Badge variant="secondary" className="ml-auto">
                  {selectedTags.length} selected
                </Badge>
              )}
            </div>
            <WorkoutTagPicker
              selectedTags={selectedTags}
              onToggleTag={onToggleTag}
              trainingType={trainingType}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
