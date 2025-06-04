
import { useWorkoutStatsContext } from "@/context/WorkoutStatsProvider";
import { useExperiencePoints } from "@/hooks/useExperiencePoints";

export interface WorkoutRecommendation {
  type: string;
  confidence: number;
  reason: string;
  duration: number;
  xpReward: number;
  socialProof: string;
  trending: boolean;
  streakContinuation?: boolean;
}

export function useSmartWorkoutRecommendations(): WorkoutRecommendation[] {
  const { stats } = useWorkoutStatsContext();
  const { experienceData } = useExperiencePoints();

  const getTimeBasedRecommendation = (): Partial<WorkoutRecommendation> => {
    const hour = new Date().getHours();
    
    if (hour >= 6 && hour <= 9) {
      return {
        reason: "Perfect morning energy boost",
        type: "Cardio",
        duration: 30,
        trending: true
      };
    } else if (hour >= 12 && hour <= 14) {
      return {
        reason: "Ideal lunch break session",
        type: "Strength",
        duration: 30,
        trending: false
      };
    } else if (hour >= 17 && hour <= 20) {
      return {
        reason: "Peak performance hours",
        type: "Strength",
        duration: 45,
        trending: true
      };
    } else {
      return {
        reason: "Perfect wind-down activity",
        type: "Yoga",
        duration: 20,
        trending: false
      };
    }
  };

  const getHistoryBasedRecommendation = (): Partial<WorkoutRecommendation> => {
    // Get the most recent workout type from workouts array
    const lastWorkoutType = stats?.workouts?.[0]?.training_type || stats?.workoutTypes?.[0]?.type || "Strength";
    const avgDuration = stats?.avgDuration || 30;
    
    // Suggest variety or continuation based on patterns
    if (lastWorkoutType === "Strength") {
      return {
        type: "Cardio",
        reason: "Balance your strength gains",
        duration: Math.round(avgDuration * 0.8)
      };
    } else if (lastWorkoutType === "Cardio") {
      return {
        type: "Strength",
        reason: "Build on your cardio base",
        duration: Math.round(avgDuration * 1.2)
      };
    } else {
      return {
        type: "Strength",
        reason: "Continue your momentum",
        duration: avgDuration
      };
    }
  };

  const timeRec = getTimeBasedRecommendation();
  const historyRec = getHistoryBasedRecommendation();

  const recommendations: WorkoutRecommendation[] = [
    {
      type: timeRec.type || "Strength",
      confidence: 95,
      reason: timeRec.reason || "Recommended for you",
      duration: timeRec.duration || 30,
      xpReward: (timeRec.duration || 30) * 2,
      socialProof: `${Math.floor(Math.random() * 3000 + 1500)} completed today`,
      trending: timeRec.trending || false,
      streakContinuation: stats?.streakDays ? stats.streakDays > 0 : false
    },
    {
      type: historyRec.type || "Cardio",
      confidence: 80,
      reason: historyRec.reason || "Based on your history",
      duration: historyRec.duration || 30,
      xpReward: (historyRec.duration || 30) * 2,
      socialProof: `${Math.floor(Math.random() * 2000 + 800)} completed today`,
      trending: false
    },
    {
      type: "Yoga",
      confidence: 70,
      reason: "Flexibility and mindfulness",
      duration: 25,
      xpReward: 50,
      socialProof: `${Math.floor(Math.random() * 1500 + 500)} completed today`,
      trending: false
    },
    {
      type: "Calisthenics",
      confidence: 65,
      reason: "Bodyweight mastery",
      duration: 35,
      xpReward: 70,
      socialProof: `${Math.floor(Math.random() * 1200 + 300)} completed today`,
      trending: Math.random() > 0.7
    }
  ];

  return recommendations.sort((a, b) => b.confidence - a.confidence);
}
