
import React from "react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useWorkoutStatsContext } from "@/context/WorkoutStatsProvider";
import { Timer, Zap, Target } from "lucide-react";
import { motion } from "framer-motion";

interface DurationSelectorProps {
  value: number;
  onChange: (value: number) => void;
}

export function DurationSelector({ value, onChange }: DurationSelectorProps) {
  const { stats } = useWorkoutStatsContext();
  const avgDuration = Math.round(stats.avgDuration || 30);

  // Preset duration options
  const presetDurations = [15, 30, 45, 60];

  const getDurationFeedbackColor = (duration: number) => {
    if (!avgDuration) return "text-gray-400";
    if (duration < avgDuration * 0.5) return "text-yellow-400";
    if (duration > avgDuration * 1.5) return "text-purple-400";
    return "text-green-400";
  };

  const getDurationDescription = (duration: number) => {
    if (duration <= 20) return "Quick & focused";
    if (duration <= 35) return "Balanced session";
    if (duration <= 50) return "Full workout";
    return "Extended training";
  };

  const getEstimatedExercises = (duration: number) => {
    return Math.round(duration / 8) + 2; // Rough estimate
  };

  const handleSliderChange = (newValue: number[]) => {
    onChange(newValue[0]);
  };

  const handlePresetClick = (preset: number) => {
    onChange(preset);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="text-purple-400" size={20} />
          <span className="text-base font-medium text-white">Duration</span>
        </div>
        <motion.div 
          className={`text-2xl font-bold ${getDurationFeedbackColor(value)}`}
          key={value}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {Math.round(value)} min
        </motion.div>
      </div>

      {/* Preset Buttons */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {presetDurations.map((preset) => (
          <Button
            key={preset}
            variant={value === preset ? "default" : "outline"}
            size="sm"
            onClick={() => handlePresetClick(preset)}
            className={`text-xs transition-all duration-200 ${
              value === preset 
                ? "bg-purple-600 hover:bg-purple-700 text-white" 
                : "border-gray-600 text-gray-300 hover:border-purple-500"
            }`}
          >
            {preset}m
          </Button>
        ))}
      </div>

      {/* Enhanced Slider */}
      <div className="px-1">
        <Slider
          defaultValue={[value]}
          min={5}
          max={120}
          step={5}
          onValueChange={handleSliderChange}
          className="[&>span]:bg-gradient-to-r [&>span]:from-purple-500 [&>span]:to-pink-500 [&_.slider-thumb]:focus:ring-2 [&_.slider-thumb]:focus:ring-purple-500/50"
        />
        
        <div className="flex justify-between mt-3 text-xs text-gray-400">
          <span>Quick (5m)</span>
          {avgDuration > 0 && (
            <div className="flex items-center gap-1">
              <Target size={12} />
              <span>Your avg: {avgDuration}m</span>
            </div>
          )}
          <span>Extended (120m)</span>
        </div>
      </div>

      {/* Workout Preview */}
      <motion.div 
        className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">Workout Preview</span>
          <Zap className="h-4 w-4 text-yellow-400" />
        </div>
        
        <div className="space-y-1 text-sm text-gray-400">
          <div className="flex justify-between">
            <span>Style:</span>
            <span className="text-gray-300">{getDurationDescription(value)}</span>
          </div>
          <div className="flex justify-between">
            <span>Est. exercises:</span>
            <span className="text-gray-300">{getEstimatedExercises(value)}</span>
          </div>
          <div className="flex justify-between">
            <span>Expected XP:</span>
            <span className="text-yellow-400">+{Math.round(value * 2)}</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
