
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Target, 
  Flame, 
  Star,
  TrendingUp,
  Award
} from 'lucide-react';
import { useExperiencePoints } from '@/hooks/useExperiencePoints';
import { useWorkoutStatsContext } from '@/context/WorkoutStatsProvider';

interface WorkoutMotivationProps {
  xpReward: number;
  trainingType: string;
}

export const WorkoutMotivation: React.FC<WorkoutMotivationProps> = ({
  xpReward,
  trainingType
}) => {
  const { experienceData } = useExperiencePoints();
  const { stats } = useWorkoutStatsContext();
  
  const currentStreak = stats?.streakDays || 0;
  const weeklyGoal = 500; // XP
  const weeklyProgress = stats?.weeklyXp || 0;
  const weeklyPercentage = Math.min((weeklyProgress / weeklyGoal) * 100, 100);
  
  const achievements = [
    {
      title: "Consistency King",
      description: `${currentStreak} day streak`,
      icon: Flame,
      color: "text-orange-400",
      progress: currentStreak,
      max: 7,
      unlocked: currentStreak >= 7
    },
    {
      title: "Weekly Warrior",
      description: `${weeklyProgress}/${weeklyGoal} XP`,
      icon: Target,
      color: "text-blue-400",
      progress: weeklyProgress,
      max: weeklyGoal,
      unlocked: weeklyProgress >= weeklyGoal
    },
    {
      title: `${trainingType} Master`,
      description: "Complete 10 sessions",
      icon: Award,
      color: "text-purple-400",
      progress: 7, // This would come from actual data
      max: 10,
      unlocked: false
    }
  ];

  return (
    <div className="space-y-4">
      {/* XP Reward Preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-500/30 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-full">
              <Star className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold">XP Reward</h3>
              <p className="text-white/70 text-sm">
                Earn {xpReward} XP for completing this workout
              </p>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-yellow-400">+{xpReward}</div>
              <div className="text-xs text-white/60">Experience</div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Achievement Progress */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <h4 className="text-white font-medium">Achievement Progress</h4>
        {achievements.map((achievement, index) => {
          const Icon = achievement.icon;
          const progressPercentage = (achievement.progress / achievement.max) * 100;
          
          return (
            <motion.div
              key={achievement.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
            >
              <Card className={`p-3 ${
                achievement.unlocked 
                  ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/30' 
                  : 'bg-gray-900/60 border-white/10'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${
                    achievement.unlocked ? 'bg-green-500/20' : 'bg-white/10'
                  }`}>
                    <Icon className={`h-4 w-4 ${achievement.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-sm">{achievement.title}</span>
                      {achievement.unlocked && (
                        <Badge className="bg-green-500/20 text-green-400 text-xs">
                          Unlocked!
                        </Badge>
                      )}
                    </div>
                    <p className="text-white/60 text-xs">{achievement.description}</p>
                    <Progress 
                      value={progressPercentage} 
                      className="h-1.5 mt-1"
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Motivational Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-purple-400" />
            <div>
              <p className="text-white font-medium">You're on fire! 🔥</p>
              <p className="text-white/70 text-sm">
                {currentStreak > 0 
                  ? `${currentStreak} day streak - keep it going!`
                  : "Start your streak today!"
                }
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
