
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { typography } from "@/lib/typography";
import { WorkoutStats } from "@/types/workout-metrics";
import { Flame, Target, TrendingUp, Calendar } from "lucide-react";

interface EnhancedWelcomeHeaderProps {
  stats?: WorkoutStats;
}

export const EnhancedWelcomeHeader = React.memo(({ stats }: EnhancedWelcomeHeaderProps) => {
  const currentHour = new Date().getHours();
  const timeBasedGreeting = 
    currentHour < 12 ? "Good morning" :
    currentHour < 17 ? "Good afternoon" :
    currentHour < 21 ? "Good evening" : "Good night";

  const streakDays = stats?.streakDays || 0;
  const totalWorkouts = stats?.totalWorkouts || 0;
  const weeklyGoal = 4; // Could be made dynamic
  const weeklyProgress = Math.min(streakDays % 7, weeklyGoal);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-2xl p-6 bg-gradient-to-br from-purple-600/20 via-pink-500/20 to-blue-500/20 
               border border-purple-500/30 shadow-2xl backdrop-blur-sm 
               hover:shadow-purple-500/20 transition-all duration-500
               transform hover:-translate-y-1"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className={cn(typography.text.primary, "text-2xl font-bold mb-1")}
          >
            {timeBasedGreeting}, Champion! 💪
          </motion.p>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={cn(typography.text.secondary, "text-sm")}
          >
            Ready to push your limits today?
          </motion.p>
        </div>
        
        {/* Streak Badge */}
        {streakDays > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
            className="flex items-center gap-2 bg-orange-500/20 px-3 py-2 rounded-full border border-orange-500/30"
          >
            <Flame className="h-4 w-4 text-orange-400" />
            <span className="text-orange-300 font-semibold text-sm">{streakDays} day streak</span>
          </motion.div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4">
        {/* Total Workouts */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <div className="flex items-center justify-center mb-2">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Target className="h-5 w-5 text-purple-400" />
            </div>
          </div>
          <p className="text-xl font-bold text-white">{totalWorkouts}</p>
          <p className="text-xs text-gray-400">Total Workouts</p>
        </motion.div>

        {/* Weekly Progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <div className="flex items-center justify-center mb-2">
            <div className="relative w-10 h-10">
              <svg className="w-10 h-10 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgba(168, 85, 247, 0.2)"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="rgb(168, 85, 247)"
                  strokeWidth="3"
                  strokeDasharray={`${(weeklyProgress / weeklyGoal) * 100}, 100`}
                />
              </svg>
              <Calendar className="absolute inset-0 m-auto h-4 w-4 text-purple-400" />
            </div>
          </div>
          <p className="text-xl font-bold text-white">{weeklyProgress}/{weeklyGoal}</p>
          <p className="text-xs text-gray-400">This Week</p>
        </motion.div>

        {/* Fitness Level */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <div className="flex items-center justify-center mb-2">
            <motion.div 
              className="w-10 h-10 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <TrendingUp className="h-5 w-5 text-white" />
            </motion.div>
          </div>
          <p className="text-xl font-bold text-white">{Math.min(99, Math.floor(totalWorkouts / 5) + 1)}</p>
          <p className="text-xs text-gray-400">Fitness Level</p>
        </motion.div>
      </div>

      {/* Progress Bar */}
      {totalWorkouts > 0 && (
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-4"
        >
          <div className="w-full h-2 bg-gray-800/50 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(totalWorkouts % 5) * 20}%` }}
              transition={{ delay: 1, duration: 0.8 }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1 text-center">
            {5 - (totalWorkouts % 5)} workouts to next level
          </p>
        </motion.div>
      )}
    </motion.div>
  );
});

EnhancedWelcomeHeader.displayName = 'EnhancedWelcomeHeader';
