
import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Clock, Play, ArrowRight } from "lucide-react";

interface SmartWorkoutCardProps {
  title: string;
  description: string;
  duration?: number;
  workoutType?: string;
  isPrimary?: boolean;
  isActive?: boolean;
  onClick: () => void;
  className?: string;
}

export const SmartWorkoutCard = React.memo(({
  title,
  description,
  duration,
  workoutType,
  isPrimary = false,
  isActive = false,
  onClick,
  className
}: SmartWorkoutCardProps) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={cn(
          "cursor-pointer border transition-all duration-300 hover:shadow-lg",
          isPrimary 
            ? "bg-gradient-to-br from-purple-600/20 to-pink-500/20 border-purple-500/30 hover:border-purple-400/50" 
            : "bg-gray-800/50 border-gray-700 hover:border-gray-600",
          isActive && "ring-2 ring-purple-500/50",
          className
        )}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <h3 className={cn(
                "font-semibold mb-1",
                isPrimary ? "text-white" : "text-gray-200"
              )}>
                {title}
              </h3>
              <p className={cn(
                "text-sm",
                isPrimary ? "text-gray-200" : "text-gray-400"
              )}>
                {description}
              </p>
            </div>
            
            <div className="flex items-center gap-2 ml-3">
              {isPrimary ? (
                <Play className="h-5 w-5 text-white" />
              ) : (
                <ArrowRight className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-3">
            {duration && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-400">{duration} min</span>
              </div>
            )}
            
            {workoutType && (
              <Badge 
                variant="outline" 
                className={cn(
                  "text-xs",
                  isPrimary ? "border-purple-400/50 text-purple-300" : "border-gray-600 text-gray-400"
                )}
              >
                {workoutType}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
});

SmartWorkoutCard.displayName = 'SmartWorkoutCard';
