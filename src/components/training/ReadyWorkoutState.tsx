
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Clock, 
  Flame, 
  Trophy, 
  Users, 
  Target,
  Dumbbell,
  Heart
} from 'lucide-react';
import { WorkoutTemplate } from '@/services/workoutTemplateService';
import { useExperiencePoints } from '@/hooks/useExperiencePoints';

interface ReadyWorkoutStateProps {
  template: WorkoutTemplate;
  onStartWorkout: () => void;
  trainingType: string;
}

const TRAINING_TYPE_CONFIGS = {
  "Strength": {
    icon: Dumbbell,
    gradient: "from-purple-600 to-purple-800",
    color: "purple"
  },
  "Cardio": {
    icon: Heart,
    gradient: "from-red-600 to-red-800",
    color: "red"
  },
  "Yoga": {
    icon: Heart,
    gradient: "from-green-600 to-green-800",
    color: "green"
  },
  "Calisthenics": {
    icon: Target,
    gradient: "from-blue-600 to-blue-800",
    color: "blue"
  }
};

export const ReadyWorkoutState: React.FC<ReadyWorkoutStateProps> = ({
  template,
  onStartWorkout,
  trainingType
}) => {
  const { experienceData } = useExperiencePoints();
  const config = TRAINING_TYPE_CONFIGS[trainingType as keyof typeof TRAINING_TYPE_CONFIGS] || TRAINING_TYPE_CONFIGS.Strength;
  const Icon = config.icon;
  
  const currentLevel = experienceData?.level || 1;
  const currentXp = experienceData?.currentLevelXp || 0;
  const nextLevelXp = experienceData?.nextLevelThreshold || 100;
  const progressToNext = (currentXp / nextLevelXp) * 100;

  return (
    <div className="space-y-6 p-4">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-3">
          <div className={`p-3 rounded-full bg-gradient-to-br ${config.gradient}`}>
            <Icon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Your {trainingType} Workout is Ready!</h1>
            <p className="text-white/70">Perfect match for your fitness goals</p>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-white">
              <Clock className="h-4 w-4" />
              <span className="font-semibold">{template.estimatedDuration}min</span>
            </div>
            <p className="text-xs text-white/60">Duration</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-white">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="font-semibold">{template.caloriesBurned}</span>
            </div>
            <p className="text-xs text-white/60">Calories</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-white">
              <Trophy className="h-4 w-4 text-yellow-400" />
              <span className="font-semibold">+{template.xpReward} XP</span>
            </div>
            <p className="text-xs text-white/60">Reward</p>
          </div>
        </div>
      </motion.div>

      {/* Level Progress Preview */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-gradient-to-r from-gray-900/80 to-gray-800/80 border-white/10 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Level {currentLevel} Progress</span>
            <span className="text-white/70 text-sm">{currentXp}/{nextLevelXp} XP</span>
          </div>
          <Progress value={progressToNext} className="h-2 mb-2" />
          <p className="text-xs text-white/60">
            Complete this workout to gain {template.xpReward} XP 
            {currentXp + template.xpReward >= nextLevelXp && " and level up! 🎉"}
          </p>
        </Card>
      </motion.div>

      {/* Exercise Preview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gray-900/60 border-white/10 p-4">
          <h3 className="text-white font-semibold mb-3">Today's Exercises</h3>
          <div className="space-y-2">
            {template.exercises.slice(0, 4).map((exercise, index) => (
              <div key={exercise.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-white font-medium">{exercise.name}</p>
                    <p className="text-white/60 text-xs">
                      {exercise.sets} sets × {exercise.reps} reps
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {exercise.muscleGroup}
                </Badge>
              </div>
            ))}
            {template.exercises.length > 4 && (
              <p className="text-white/60 text-sm text-center pt-2">
                +{template.exercises.length - 4} more exercises
              </p>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Focus Areas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-wrap gap-2 justify-center"
      >
        {template.focusAreas.map((area) => (
          <Badge key={area} variant="outline" className="text-white/80 border-white/20">
            {area}
          </Badge>
        ))}
      </motion.div>

      {/* Social Proof */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
          <Users className="h-4 w-4" />
          <span>{Math.floor(Math.random() * 2000 + 500)} people completed {trainingType.toLowerCase()} workouts today</span>
        </div>
      </motion.div>

      {/* Primary Action */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="pt-4"
      >
        <Button
          onClick={onStartWorkout}
          className="w-full h-16 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Play className="mr-3 h-6 w-6" />
          START WORKOUT
        </Button>
      </motion.div>
    </div>
  );
};
