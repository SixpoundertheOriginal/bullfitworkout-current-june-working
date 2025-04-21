import React, { useState, useEffect } from "react";
import { Plus, X, Dumbbell, BarChart3, Search } from "lucide-react";
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
      } else if (trainingType.toLowerCase().includes("cardio") && 
                 (exercise.primary_muscle_groups.includes("cardio") || 
                  exercise.equipment_type.includes("bodyweight"))) {
        score += 3;
      }
      
      if (tags.some(tag => tag.toLowerCase() === "push") && 
          exercise.movement_pattern === "push") {
        score += 2;
      } else if (tags.some(tag => tag.toLowerCase() === "pull") && 
                exercise.movement_pattern === "pull") {
        score += 2;
      }
      
      const muscleMatches = tags.filter(tag => 
        exercise.primary_muscle_groups.some(muscle => 
          muscle.toLowerCase().includes(tag.toLowerCase())
        )
      );
      score += muscleMatches.length * 2;
      
      const secondaryMuscleMatches = tags.filter(tag => 
        exercise.secondary_muscle_groups.some(muscle => 
          muscle.toLowerCase().includes(tag.toLowerCase())
        )
      );
      score += secondaryMuscleMatches.length;
      
      return score;
    };
    
    const scoredExercises = exercises
      .map(exercise => ({ exercise, score: scoreExercise(exercise) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);
    
    const topSuggestions = scoredExercises.slice(0, 5).map(item => item.exercise);
    setSuggestions(topSuggestions);
  }, [exercises, trainingType, tags]);
  
  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
    
    if (!isExpanded && suggestions.length === 0) {
      toast.info("No suggestions available for current training configuration", {
        duration: 2000,
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
        border: "1px solid rgba(120, 120, 120, 0.3)",
      },
    });
  };
  
  const getSuggestionPosition = (index: number, total: number) => {
    const baseRadius = Math.min(window.innerWidth, window.innerHeight) * 0.20;
    const radius = Math.max(90, Math.min(baseRadius, 120));
    const startAngle = -150;
    const endAngle = -30;
    const angleStep = total > 1 ? (endAngle - startAngle) / (total - 1) : 0;
    const angle = startAngle + index * angleStep;
    const radian = (angle * Math.PI) / 180;

    return {
      x: radius * Math.cos(radian),
      y: radius * Math.sin(radian)
    };
  };

  return (
    <div 
      className={cn(
        "fixed z-50 bottom-24 right-6",
        "transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16 pointer-events-none",
        "overflow-visible",
        className
      )}
      style={{ pointerEvents: visible ? "auto" : "none" }}
    >
      <AnimatePresence>
        {isExpanded && (
          <div
            className="absolute bottom-5 right-5 flex items-center justify-center"
            style={{
              width: 0,
              height: 0,
              pointerEvents: "none"
            }}
          >
            {suggestions.map((exercise, index) => {
              const { x, y } = getSuggestionPosition(index, suggestions.length);

              return (
                <motion.button
                  key={exercise.id}
                  initial={{ opacity: 0, scale: 0.7, x: 0, y: 0 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x,
                    y,
                    transition: {
                      type: "spring",
                      stiffness: 280,
                      damping: 24,
                      delay: index * 0.06,
                    }
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.6,
                    x: 0,
                    y: 0,
                    transition: { duration: 0.21, delay: (suggestions.length - index) * 0.03 }
                  }}
                  className={cn(
                    "absolute flex flex-col items-center justify-center gap-1",
                    "bg-gray-900/90 hover:bg-gray-800/95 ring-2 ring-purple-600/20",
                    "border border-purple-700/20 rounded-lg",
                    "min-w-0 w-16 h-16 p-0.5",
                    "shadow-lg shadow-purple-950/15",
                    "cursor-pointer select-none group",
                    "overflow-hidden",
                    "transition-all duration-200",
                    "backdrop-blur-sm",
                    "z-30",
                  )}
                  style={{
                    pointerEvents: "auto",
                  }}
                  onClick={() => handleSelectExercise(exercise)}
                  tabIndex={0}
                  aria-label={exercise.name}
                >
                  <Dumbbell className="h-4 w-4 text-purple-300 mb-1" />
                  <span
                    className="text-white text-xs font-medium w-full text-center menu-item-text"
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 72,
                    }}
                    title={exercise.name}
                  >
                    {exercise.name}
                  </span>
                  <div className="flex justify-center w-full">
                    {exercise.primary_muscle_groups.slice(0, 1).map(muscle => (
                      <Badge 
                        key={muscle}
                        variant="outline"
                        className="text-[9px] px-1 py-0 h-3.5 bg-purple-900/45 border-purple-500/30"
                      >
                        {muscle}
                      </Badge>
                    ))}
                  </div>
                </motion.button>
              );
            })}

            <motion.button
              initial={{ opacity: 0, scale: 0.7, y: 0, x: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
                ...getSuggestionPosition(suggestions.length, suggestions.length + 1),
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
                x: 0,
                y: 0,
                transition: { duration: 0.18 }
              }}
              className={cn(
                "absolute flex flex-row items-center px-2 py-1 rounded-md bg-purple-900/80 border border-purple-700/30 backdrop-blur-sm",
                "shadow-md text-purple-100 text-xs gap-1 z-40",
                "transition-all duration-200 hover:scale-105 hover:bg-purple-800/90",
                "cursor-pointer"
              )}
              style={{
                pointerEvents: "auto",
                minWidth: 0,
                minHeight: 0
              }}
              aria-label="Browse All Exercises"
              tabIndex={0}
              onClick={() => setIsExpanded(false)}
            >
              <Search className="h-3 w-3 text-purple-300 mr-0.5" />
              <span className="max-w-[72px] truncate">Browse All</span>
            </motion.button>
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
          .menu-item-text {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 72px;
          }
        `}
      </style>
    </div>
  );
};
