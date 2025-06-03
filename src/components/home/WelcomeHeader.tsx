
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { typography } from "@/lib/typography";
import { WorkoutStats } from "@/types/workout-metrics";

interface WelcomeHeaderProps {
  stats?: WorkoutStats;
}

export const WelcomeHeader = React.memo(({ stats }: WelcomeHeaderProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl p-6 bg-gradient-to-r from-purple-600/30 to-pink-500/30 border border-purple-500/20 
               shadow-lg backdrop-blur-sm hover:shadow-purple-500/10 transition-all duration-300
               transform hover:-translate-y-0.5"
    >
      <div className="flex items-center">
        <div className="flex-1">
          <p className={cn(typography.text.primary, "text-xl")}>
            Begin your fitness adventure! 💪
          </p>
          <p className={cn(typography.text.secondary, "text-sm mt-1")}>
            Complete quests, gain XP, and level up your fitness journey
          </p>
        </div>
        
        {stats?.totalWorkouts && stats.totalWorkouts > 0 && (
          <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded-full">
            <div className="flex items-center">
              <motion.div 
                className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center"
                whileHover={{ scale: 1.1 }}
              >
                <span className="text-white font-bold text-sm">
                  {Math.min(99, Math.floor(stats.totalWorkouts / 5) + 1)}
                </span>
              </motion.div>
              <div className="ml-2">
                <p className="text-xs text-white/80">Fitness Level</p>
                <div className="w-16 h-1.5 bg-gray-800/70 rounded-full mt-1">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                    style={{ width: `${(stats.totalWorkouts % 5) * 20}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
});

WelcomeHeader.displayName = 'WelcomeHeader';
