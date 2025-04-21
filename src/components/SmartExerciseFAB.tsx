
import React, { useState, useEffect } from "react";
import { Plus, Dumbbell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Exercise } from "@/types/exercise";
import { useExercises } from "@/hooks/useExercises";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";

interface SmartExerciseFABProps {
  onSelectExercise: (exercise: Exercise) => void;
  trainingType: string;
  tags: string[];
  visible?: boolean;
  className?: string;
}

export const SmartExerciseFAB = ({
  onSelectExercise,
  trainingType,
  tags,
  visible = true,
  className
}: SmartExerciseFABProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState<Exercise[]>([]);
  const { exercises } = useExercises();

  useEffect(() => {
    if (!exercises?.length) return;

    const scoreExercise = (exercise: Exercise): number => {
      let score = 0;

      if (trainingType.toLowerCase().includes("strength") && exercise.is_compound) {
        score += 3;
      } else if (
        trainingType.toLowerCase().includes("cardio") &&
        (exercise.primary_muscle_groups.includes("cardio") ||
          exercise.equipment_type.includes("bodyweight"))
      ) {
        score += 3;
      }

      if (tags.some((tag) => tag.toLowerCase() === "push") && exercise.movement_pattern === "push") {
        score += 2;
      } else if (
        tags.some((tag) => tag.toLowerCase() === "pull") &&
        exercise.movement_pattern === "pull"
      ) {
        score += 2;
      }

      const muscleMatches = tags.filter((tag) =>
        exercise.primary_muscle_groups.some((muscle) => muscle.toLowerCase().includes(tag.toLowerCase()))
      );
      score += muscleMatches.length * 2;

      const secondaryMuscleMatches = tags.filter((tag) =>
        exercise.secondary_muscle_groups.some((muscle) => muscle.toLowerCase().includes(tag.toLowerCase()))
      );
      score += secondaryMuscleMatches.length;

      return score;
    };

    const scoredExercises = exercises
      .map((exercise) => ({ exercise, score: scoreExercise(exercise) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    const topSuggestions = scoredExercises.slice(0, 5).map((item) => item.exercise);
    setSuggestions(topSuggestions);
  }, [exercises, trainingType, tags]);

  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);

    if (!isExpanded && suggestions.length === 0) {
      toast.info("No suggestions available for current training configuration", {
        duration: 2000
      });
    }
  };

  const handleSelectExercise = (exercise: Exercise) => {
    onSelectExercise(exercise);
    setIsExpanded(false);

    toast.success(`Added ${exercise.name} to your workout`, {
      style: {
        backgroundColor: "rgba(20, 20, 20, 0.9)",
        color: "white",
        border: "1px solid rgba(120, 120, 120, 0.3)"
      }
    });
  };

  const getSuggestionPosition = (index: number, total: number) => {
    // Increased angle step from 25 to 40 degrees for wider separation
    const angleStep = 40; 
    
    // Adjusted starting angle to ensure items fan out in the visible area
    const angle = -140 + index * angleStep;
    const radian = (angle * Math.PI) / 180;
    
    // Staggered distance calculation - base distance plus index-based offset
    // This creates a spiral effect that prevents direct overlapping
    const baseDistance = 100;
    const indexOffset = index * 15; // Additional 15px per item
    const distance = baseDistance + indexOffset;
    
    // Math.max ensures min 20px from edges (will not go off-screen)
    const bottom = Math.max(20, distance * Math.sin(-radian));
    const right = Math.max(20, distance * Math.cos(-radian));
    
    return { bottom, right };
  };

  return (
    <div
      className={cn(
        "fixed z-50 bottom-12 right-12",
        "transition-all duration-300",
        visible
          ? "opacity-100 pointer-events-auto"
          : "opacity-0 pointer-events-none",
        "overflow-visible",
        className
      )}
    >
      <AnimatePresence>
        {isExpanded && (
          <div
            className="absolute bottom-0 right-0 flex items-center justify-center"
            style={{
              width: 0,
              height: 0,
              pointerEvents: "none"
            }}
            aria-label="Exercise Suggestions"
          >
            {suggestions.map((exercise, index) => {
              const { bottom, right } = getSuggestionPosition(index, suggestions.length);

              return (
                <motion.button
                  key={exercise.id}
                  initial={{ opacity: 0, scale: 0.7, bottom: 0, right: 0 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    bottom,
                    right,
                    transition: {
                      type: "spring",
                      stiffness: 280,
                      damping: 24,
                      delay: index * 0.06
                    }
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.6,
                    bottom: 0,
                    right: 0,
                    transition: { duration: 0.21, delay: (suggestions.length - index) * 0.03 }
                  }}
                  className={cn(
                    "absolute flex flex-col items-center justify-center gap-1",
                    "menu-compact-item bg-gray-900/90 hover:bg-gray-800/95",
                    "border border-purple-700/20 rounded-full",
                    "shadow-lg shadow-purple-950/15",
                    "cursor-pointer select-none group",
                    "overflow-hidden",
                    "transition-all duration-200",
                    "backdrop-blur-sm",
                    "z-30"
                  )}
                  style={{
                    pointerEvents: "auto",
                    // Reduced size for more compact visual appearance
                    width: "62px",
                    height: "62px",
                    padding: "4px"
                  }}
                  onClick={() => handleSelectExercise(exercise)}
                  tabIndex={0}
                  aria-label={exercise.name}
                >
                  <Dumbbell className="h-4 w-4 text-purple-300 mb-1" />
                  <span
                    className="text-white text-[9px] font-medium w-full text-center item-label menu-item-text"
                    title={exercise.name}
                  >
                    {exercise.name}
                  </span>
                  <div className="flex justify-center w-full">
                    {exercise.primary_muscle_groups.slice(0, 1).map((muscle) => (
                      <Badge
                        key={muscle}
                        variant="outline"
                        className="text-[7px] px-1 py-0 h-3 bg-purple-900/45 border-purple-500/30"
                      >
                        {muscle}
                      </Badge>
                    ))}
                  </div>
                </motion.button>
              );
            })}

            {(() => {
              // Browse all button positioned at the end of the fan
              const { bottom, right } = getSuggestionPosition(suggestions.length, suggestions.length + 1);
              return (
                <motion.button
                  initial={{ opacity: 0, scale: 0.7, bottom: 0, right: 0 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    bottom,
                    right,
                    transition: {
                      type: "spring",
                      stiffness: 250,
                      damping: 25,
                      delay: 0.225
                    }
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.5,
                    bottom: 0,
                    right: 0,
                    transition: { duration: 0.18 }
                  }}
                  className={cn(
                    "absolute flex flex-row items-center px-1 py-1 rounded-full bg-purple-900/80 border border-purple-700/30 backdrop-blur-sm",
                    "shadow-md text-purple-100 text-[10px] gap-1 z-40",
                    "transition-all duration-200 hover:scale-105 hover:bg-purple-800/90",
                    "cursor-pointer justify-center"
                  )}
                  style={{
                    pointerEvents: "auto",
                    minWidth: 0,
                    minHeight: 0,
                    width: "70px",
                    height: "26px"
                  }}
                  aria-label="Browse All Exercises"
                  tabIndex={0}
                  onClick={() => setIsExpanded(false)}
                >
                  <Search className="h-3 w-3 text-purple-300 mr-0.5" />
                  <span className="max-w-[52px] truncate">Browse All</span>
                </motion.button>
              )
            })()}
          </div>
        )}
      </AnimatePresence>

      <Button
        variant="gradient"
        size="icon-lg"
        shape="pill"
        onClick={handleToggleExpand}
        className={cn(
          "transform transition-all duration-300 ease-in-out",
          "bg-gradient-to-r from-purple-600 to-pink-500",
          "hover:from-purple-700 hover:to-pink-600",
          "shadow-lg hover:shadow-purple-500/25",
          "border border-purple-500/20",
          isExpanded ? "rotate-45" : "",
          "active:scale-95"
        )}
        aria-label={isExpanded ? "Close Suggestions" : "Show Exercise Suggestions"}
      >
        <Plus size={24} />
      </Button>
      <style>
        {`
          .menu-item-text, .item-label {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 56px;
            font-size: 9px;
          }
          .menu-compact-item {
            min-width: 0;
            min-height: 0;
          }
        `}
      </style>
    </div>
  );
};
