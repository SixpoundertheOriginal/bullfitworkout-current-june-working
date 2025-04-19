
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ExerciseFABProps {
  onClick: () => void;
  className?: string;
  visible?: boolean;
}

export const ExerciseFAB = ({ onClick, className, visible = true }: ExerciseFABProps) => {
  return (
    <Button
      variant="gradient"
      size="icon-lg"
      shape="pill"
      icon={<Plus size={24} />}
      iconOnly
      onClick={onClick}
      className={cn(
        "fixed bottom-24 right-6 z-50", // Raised position to avoid overlapping with AddExerciseBar
        "transform transition-all duration-300 ease-in-out",
        "bg-gradient-to-r from-purple-600 to-pink-500",
        "hover:from-purple-700 hover:to-pink-600",
        "shadow-lg hover:shadow-purple-500/25",
        "border border-purple-500/20",
        "active:scale-95",
        visible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0 pointer-events-none",
        className
      )}
      aria-label="Add Exercise"
    />
  );
};
