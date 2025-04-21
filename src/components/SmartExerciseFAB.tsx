
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
  
  // Filter exercises based on training type and tags
  useEffect(() => {
    if (!exercises?.length) return;
    
    // Create a function to score exercises based on relevance
    const scoreExercise = (exercise: Exercise): number => {
      let score = 0;
      
      // Match on training type
      if (trainingType.toLowerCase().includes("strength") && exercise.is_compound) {
        score += 3;
      } else if (trainingType.toLowerCase().includes("cardio") && 
                 (exercise.primary_muscle_groups.includes("cardio") || 
                  exercise.equipment_type.includes("bodyweight"))) {
        score += 3;
      }
      
      // Match on movement pattern
      if (tags.some(tag => tag.toLowerCase() === "push") && 
          exercise.movement_pattern === "push") {
        score += 2;
      } else if (tags.some(tag => tag.toLowerCase() === "pull") && 
                exercise.movement_pattern === "pull") {
        score += 2;
      }
      
      // Match on muscle groups
      const muscleMatches = tags.filter(tag => 
        exercise.primary_muscle_groups.some(muscle => 
          muscle.toLowerCase().includes(tag.toLowerCase())
        )
      );
      score += muscleMatches.length * 2;
      
      // Secondary muscle matches
      const secondaryMuscleMatches = tags.filter(tag => 
        exercise.secondary_muscle_groups.some(muscle => 
          muscle.toLowerCase().includes(tag.toLowerCase())
        )
      );
      score += secondaryMuscleMatches.length;
      
      return score;
    };
    
    // Score and sort exercises
    const scoredExercises = exercises
      .map(exercise => ({ exercise, score: scoreExercise(exercise) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);
    
    // Take top 5
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
  
  // Calculate positions for the semi-circular menu with improved spacing
  const getSuggestionPosition = (index: number, total: number) => {
    // Create a semi-circle above the FAB
    const radius = 150; // radius of the semi-circle
    
    // Distribute items evenly within a 180° arc
    // Start from -150° (left side) to 30° (right side) for better visual balance
    const startAngle = Math.PI * 0.85; // ~150 degrees in radians
    const endAngle = Math.PI * 0.15; // ~30 degrees in radians
    
    // Calculate the angle step based on the number of items
    const angleStep = (startAngle - endAngle) / (total - 1 || 1);
    
    // Calculate the angle for this specific item
    const angle = startAngle - (angleStep * index);
    
    // Calculate positions using trigonometry
    const x = Math.cos(angle) * radius;
    const y = -Math.sin(angle) * radius; // Negative to go upward
    
    return { x, y };
  };
  
  return (
    <div 
      className={cn(
        "fixed z-50 bottom-24 right-6", 
        "transition-all duration-300",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16 pointer-events-none",
        className
      )}
    >
      {/* Exercise Suggestions */}
      <AnimatePresence>
        {isExpanded && (
          <div className="absolute bottom-16 right-0 flex items-center justify-center w-0 h-0">
            {suggestions.map((exercise, index) => {
              const position = getSuggestionPosition(index, suggestions.length);
              
              return (
                <motion.div
                  key={exercise.id}
                  initial={{ opacity: 0, scale: 0.8, x: 0, y: 0 }}
                  animate={{ 
                    opacity: 1,
                    scale: 1,
                    x: position.x, 
                    y: position.y,
                    transition: { 
                      type: "spring", 
                      stiffness: 300, 
                      damping: 20,
                      delay: index * 0.05
                    }
                  }}
                  exit={{ 
                    opacity: 0, 
                    scale: 0.8,
                    x: 0, 
                    y: 0,
                    transition: { duration: 0.2, delay: (suggestions.length - index) * 0.03 }
                  }}
                  className="absolute"
                  style={{ 
                    // Add z-index to prevent later elements from being under earlier ones
                    zIndex: 50 - index,
                    transformOrigin: 'center center'
                  }}
                >
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => handleSelectExercise(exercise)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 p-3",
                      "h-auto min-h-16 w-20",
                      "bg-gray-900/95 hover:bg-gray-800/95",
                      "border border-purple-500/30 rounded-xl",
                      "backdrop-blur-sm shadow-lg shadow-purple-900/20",
                      "text-white",
                      "transition-all duration-200 hover:scale-105",
                      "overflow-hidden"
                    )}
                  >
                    <Dumbbell className="h-5 w-5 text-purple-400 mb-1 flex-shrink-0" />
                    <span className="text-white text-xs font-medium line-clamp-1 w-full text-center">
                      {exercise.name}
                    </span>
                    <div className="flex justify-center mt-1 w-full">
                      {exercise.primary_muscle_groups.slice(0, 1).map(muscle => (
                        <Badge 
                          key={muscle} 
                          variant="outline" 
                          className="text-[9px] px-1 py-0 h-3.5 bg-purple-900/30 border-purple-500/30"
                        >
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </Button>
                </motion.div>
              );
            })}
            
            {/* Browse All Button */}
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={{ 
                opacity: 1,
                y: -210,
                transition: { 
                  type: "spring", 
                  stiffness: 300, 
                  damping: 20,
                  delay: 0.25
                }
              }}
              exit={{ 
                opacity: 0, 
                y: 0,
                transition: { duration: 0.2 }
              }}
              className="absolute left-1/2 -translate-x-1/2"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2",
                  "bg-gray-900/95 hover:bg-gray-800/95",
                  "border border-purple-500/30 rounded-lg",
                  "backdrop-blur-sm shadow-lg",
                  "text-white text-xs",
                  "transition-all duration-200 hover:scale-105"
                )}
              >
                <Search className="h-3.5 w-3.5 text-purple-400" />
                <span>Browse All</span>
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      {/* Main FAB Button */}
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
    </div>
  );
};
