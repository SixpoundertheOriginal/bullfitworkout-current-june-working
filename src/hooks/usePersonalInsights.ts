
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { PersonalInsight } from '@/types/personal-analytics';
import { usePersonalStatsForMultipleExercises } from './usePersonalStats';
import { Exercise } from '@/types/exercise';
import { differenceInDays, parseISO } from 'date-fns';

interface UsePersonalInsightsOptions {
  exercises: Exercise[];
  enabled?: boolean;
}

export function usePersonalInsights({ exercises, enabled = true }: UsePersonalInsightsOptions) {
  const { user } = useAuth();
  const exerciseIds = exercises.map(ex => ex.name);

  const { data: personalStatsMap } = usePersonalStatsForMultipleExercises(exerciseIds);

  return useQuery({
    queryKey: ['personal-insights', user?.id, exerciseIds.sort()],
    queryFn: async (): Promise<PersonalInsight[]> => {
      if (!personalStatsMap || Object.keys(personalStatsMap).length === 0) {
        return [];
      }

      const insights: PersonalInsight[] = [];

      // Analyze each exercise for insights
      Object.entries(personalStatsMap).forEach(([exerciseId, stats]) => {
        if (!stats) return;

        const exercise = exercises.find(ex => ex.name === exerciseId);
        if (!exercise) return;

        // Achievement insights
        if (stats.personalBest && stats.trend === 'increasing') {
          insights.push({
            type: 'achievement',
            priority: 'high',
            title: 'Personal Best Streak!',
            description: `You're on a roll with ${exercise.name}! Keep pushing those limits.`,
            actionable: true,
            exerciseId
          });
        }

        // Ready to progress insights
        if (stats.isReadyToProgress) {
          insights.push({
            type: 'suggestion',
            priority: 'medium',
            title: 'Ready to Level Up',
            description: `Time to increase weight or reps for ${exercise.name}. You've shown consistent performance.`,
            actionable: true,
            exerciseId
          });
        }

        // Haven't done lately insights
        if (stats.daysSinceLastPerformed > 14) {
          insights.push({
            type: 'warning',
            priority: 'medium',
            title: 'Missing in Action',
            description: `It's been ${stats.daysSinceLastPerformed} days since you did ${exercise.name}. Don't lose that progress!`,
            actionable: true,
            exerciseId
          });
        }

        // Milestone achievements
        if (stats.milestones.length > 0) {
          const latestMilestone = stats.milestones[stats.milestones.length - 1];
          const daysSinceMilestone = differenceInDays(new Date(), parseISO(latestMilestone.date));
          
          if (daysSinceMilestone <= 7) {
            insights.push({
              type: 'milestone',
              priority: 'high',
              title: 'Milestone Unlocked!',
              description: latestMilestone.description,
              actionable: false,
              exerciseId
            });
          }
        }

        // Declining performance warnings
        if (stats.trend === 'decreasing' && stats.totalSessions > 5) {
          insights.push({
            type: 'warning',
            priority: 'high',
            title: 'Performance Dip',
            description: `Your ${exercise.name} performance has been declining. Consider reviewing your form or taking a recovery week.`,
            actionable: true,
            exerciseId
          });
        }
      });

      // Workout pattern insights
      const muscleGroupStats = analyzeMuscleGroupBalance(exercises, personalStatsMap);
      if (muscleGroupStats.imbalances.length > 0) {
        insights.push({
          type: 'suggestion',
          priority: 'medium',
          title: 'Muscle Balance Opportunity',
          description: `Consider adding more ${muscleGroupStats.imbalances[0]} exercises to balance your training.`,
          actionable: true
        });
      }

      // Sort by priority and limit results
      return insights
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        })
        .slice(0, 5);
    },
    enabled: enabled && !!user?.id && !!personalStatsMap,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

function analyzeMuscleGroupBalance(exercises: Exercise[], personalStatsMap: Record<string, any>) {
  const muscleGroupFrequency: Record<string, number> = {};
  
  Object.entries(personalStatsMap).forEach(([exerciseId, stats]) => {
    if (!stats || stats.totalSessions === 0) return;
    
    const exercise = exercises.find(ex => ex.name === exerciseId);
    if (!exercise) return;
    
    // Count sessions for each muscle group
    exercise.primary_muscle_groups?.forEach(muscle => {
      muscleGroupFrequency[muscle] = (muscleGroupFrequency[muscle] || 0) + stats.totalSessions;
    });
  });

  // Find imbalances (muscle groups with significantly fewer sessions)
  const frequencies = Object.values(muscleGroupFrequency);
  const avgFrequency = frequencies.reduce((sum, freq) => sum + freq, 0) / frequencies.length;
  
  const imbalances = Object.entries(muscleGroupFrequency)
    .filter(([_, frequency]) => frequency < avgFrequency * 0.7)
    .map(([muscle]) => muscle);

  return { muscleGroupFrequency, imbalances };
}
