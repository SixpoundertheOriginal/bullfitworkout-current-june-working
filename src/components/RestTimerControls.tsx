
import React from "react";
import { CircularProgress } from "./ui/circular-progress";
import { Timer, X, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RestTimerControlsProps {
  timeLeft: number;
  totalTime: number;
  isActive: boolean;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onSkip: () => void;
  className?: string;
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const RestTimerControls = ({
  timeLeft,
  totalTime,
  isActive,
  onPause,
  onResume,
  onReset,
  onSkip,
  className = "",
}: RestTimerControlsProps) => {
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      <div className="relative flex items-center justify-center">
        <CircularProgress value={progress} className="w-16 h-16" />
        <span className="absolute font-mono text-sm">{formatTime(timeLeft)}</span>
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
