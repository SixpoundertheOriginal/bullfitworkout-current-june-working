
import React from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExerciseFABProps {
  onClick: () => void;
  className?: string;
  visible?: boolean;
}

export const ExerciseFAB = ({ onClick, className, visible = true }: ExerciseFABProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-50 flex h-16 w-16 items-center justify-center rounded-full",
        "bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg",
        "transform transition-all duration-300 ease-in-out",
        "hover:scale-105 active:scale-95 hover:shadow-xl focus:outline-none",
        visible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0 pointer-events-none",
        className
      )}
      aria-label="Add Exercise"
      role="button"
    >
      <Plus size={28} className="text-white" />
      <span className="sr-only">Add Exercise</span>
      
      {/* Ripple effect */}
      <span className="absolute inset-0 rounded-full bg-white opacity-30 transition-transform duration-300 ease-out group-active:scale-95"></span>
    </button>
  );
};
