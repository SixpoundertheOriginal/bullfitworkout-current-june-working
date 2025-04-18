
import React from "react";
import { CircularProgress } from "./ui/circular-progress";
import { Timer, X, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RestTimerControlsProps {
  elapsedTime: number;
  maxTime: number;
  isActive: boolean;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSkip: () => void;
  className?: string;
  compact?: boolean;
}

export const RestTimerControls = ({
  elapsedTime,
  maxTime,
  isActive,
  onPause,
  onResume,
  onReset,
  onSkip,
  className = "",
  compact = false,
}: RestTimerControlsProps) => {
  const progress = Math.min((elapsedTime / maxTime) * 100, 100);

  if (compact) {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <span className="font-mono text-lg">{formatTime(elapsedTime)}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="relative flex items-center justify-center">
        <CircularProgress value={progress} className="w-16 h-16" />
        <span className="absolute font-mono text-sm">{formatTime(elapsedTime)}</span>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline" 
          size="icon"
          className="bg-gray-800/50 border-gray-700 hover:bg-gray-700"
          onClick={isActive ? onPause : onResume}
        >
          {isActive ? <Pause size={18} /> : <Play size={18} />}
        </Button>
        <Button
          variant="outline"
          size="icon" 
          className="bg-gray-800/50 border-gray-700 hover:bg-gray-700"
          onClick={onSkip}
        >
          <X size={18} />
        </Button>
      </div>
    </div>
  );
};
