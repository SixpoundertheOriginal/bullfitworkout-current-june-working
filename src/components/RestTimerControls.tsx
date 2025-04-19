
import React from "react";
import { CircularProgress } from "./ui/circular-progress";
import { Timer, X, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

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
      <div className={cn("flex flex-col items-center gap-1", className)}>
        <Timer size={20} className={cn(
          "text-purple-400 mb-1",
          isActive && "animate-pulse"
        )} />
        <span className="text-lg font-mono text-white">
          {formatTime(elapsedTime)}
        </span>
        <span className="text-xs text-gray-400 font-medium">Rest</span>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="relative flex items-center justify-center">
        <CircularProgress 
          value={progress} 
          className="w-16 h-16 [&>circle]:text-purple-500/20 [&>circle:last-child]:text-purple-500" 
        />
        <span className="absolute font-mono text-white text-sm">{formatTime(elapsedTime)}</span>
      </div>
      
      <div className="flex gap-2">
        <Button
          variant="outline" 
          size="icon"
          className="bg-gray-800/50 border-gray-700 hover:bg-gray-700 text-white"
          onClick={isActive ? onPause : onResume}
        >
          {isActive ? <Pause size={18} /> : <Play size={18} />}
        </Button>
        <Button
          variant="outline"
          size="icon" 
          className="bg-gray-800/50 border-gray-700 hover:bg-gray-700 text-white"
          onClick={onSkip}
        >
          <X size={18} />
        </Button>
      </div>
    </div>
  );
};
