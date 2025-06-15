
import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Zap, Target, Award } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'streak' | 'milestone' | 'pr' | 'consistency';
  progress: number;
  maxProgress: number;
  isCompleted: boolean;
  icon: 'trophy' | 'star' | 'zap' | 'target' | 'award';
  color: string;
}

interface AchievementCardProps {
  achievements: Achievement[];
  className?: string;
}

const iconMap = {
  trophy: Trophy,
  star: Star,
  zap: Zap,
  target: Target,
  award: Award,
};

const colorMap = {
  gold: 'from-yellow-500 to-orange-500',
  purple: 'from-purple-500 to-pink-500',
  blue: 'from-blue-500 to-cyan-500',
  green: 'from-green-500 to-emerald-500',
  red: 'from-red-500 to-pink-500',
};

export const AchievementCard = React.memo(({ achievements, className = '' }: AchievementCardProps) => {
  const recentAchievements = achievements.slice(0, 3);

  return (
    <Card className={`bg-gray-900/50 border-gray-800 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Achievements
          </h3>
          <span className="text-xs text-gray-400">
            {achievements.filter(a => a.isCompleted).length}/{achievements.length}
          </span>
        </div>

        <div className="space-y-3">
          {recentAchievements.map((achievement, index) => {
            const IconComponent = iconMap[achievement.icon];
            const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-3 rounded-lg border ${
                  achievement.isCompleted 
                    ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30' 
                    : 'bg-gray-800/50 border-gray-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-full ${
                    achievement.isCompleted 
                      ? `bg-gradient-to-r ${colorMap[achievement.color as keyof typeof colorMap] || colorMap.gold}` 
                      : 'bg-gray-700'
                  }`}>
                    <IconComponent className={`h-4 w-4 ${
                      achievement.isCompleted ? 'text-white' : 'text-gray-400'
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`text-sm font-medium ${
                        achievement.isCompleted ? 'text-white' : 'text-gray-300'
                      }`}>
                        {achievement.title}
                      </h4>
                      {achievement.isCompleted && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
                        >
                          <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                        </motion.div>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-400 mb-2">{achievement.description}</p>
                    
                    {!achievement.isCompleted && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">{achievement.progress}/{achievement.maxProgress}</span>
                          <span className="text-gray-500">{Math.round(progressPercentage)}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 0.8, delay: index * 0.2 }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {achievements.length === 0 && (
          <div className="text-center py-6 text-gray-400">
            <Trophy className="h-8 w-8 mx-auto mb-2 text-gray-600" />
            <p className="text-sm">Start working out to unlock achievements!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

AchievementCard.displayName = 'AchievementCard';
