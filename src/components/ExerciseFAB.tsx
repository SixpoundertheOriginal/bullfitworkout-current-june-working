
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
      size="lg"
      shape="pill"
      icon={<Plus size={24} />}
      iconOnly
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-50 shadow-lg",
        "transform transition-all duration-300 ease-in-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0 pointer-events-none",
        className
      )}
      aria-label="Add Exercise"
    />
  );
};
