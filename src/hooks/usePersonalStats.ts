
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { PersonalStats, PersonalMilestone, ProgressTrend } from '@/types/personal-analytics';
import { subDays, differenceInDays, parseISO } from 'date-fns';

interface UsePersonalStatsOptions {
  exerciseId?: string;
  enabled?: boolean;
}

export function usePersonalStats(options: UsePersonalStatsOptions = {}) {
  const { user } = useAuth();
  const { exerciseId, enabled = true } = options;

  return useQuery({
    queryKey: ['personal-stats', user?.id, exerciseId],
    queryFn: async (): Promise<PersonalStats | null> => {
      if (!user?.id || !exerciseId) return null;

      // Get exercise sets data for this exercise
      const { data: exerciseSets, error: setsError } = await supabase
        .from('exercise_sets')
        .select(`
          *,
          workout_sessions!inner(*)
        `)
        .eq('exercise_name', exerciseId)
        .eq('workout_sessions.user_id', user.id)
        .order('created_at', { ascending: true });

      if (setsError) throw setsError;

      if (!exerciseSets || exerciseSets.length === 0) {
        return {
          exerciseId,
          userId: user.id,
          totalSessions: 0,
          totalVolume: 0,
          personalBest: null,
          lastPerformed: null,
          averageWeight: 0,
          averageReps: 0,
          trend: 'new',
          progressPercentage: 0,
          daysSinceLastPerformed: 0,
          isReadyToProgress: false,
          milestones: []
        };
      }

      // Calculate basic stats
      const totalSessions = new Set(exerciseSets.map(set => set.workout_id)).size;
      const totalVolume = exerciseSets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
      const averageWeight = exerciseSets.reduce((sum, set) => sum + set.weight, 0) / exerciseSets.length;
      const averageReps = exerciseSets.reduce((sum, set) => sum + set.reps, 0) / exerciseSets.length;

      // Find personal best
      const personalBest = exerciseSets.reduce((best, set) => {
        const volume = set.weight * set.reps;
        const bestVolume = best ? best.weight * best.reps : 0;
        
        if (volume > bestVolume) {
          return {
            weight: set.weight,
            reps: set.reps,
            date: set.created_at
          };
        }
        return best;
      }, null as { weight: number; reps: number; date: string } | null);

      // Calculate last performed
      const lastPerformed = exerciseSets[exerciseSets.length - 1]?.created_at || null;
      const daysSinceLastPerformed = lastPerformed 
        ? differenceInDays(new Date(), parseISO(lastPerformed))
        : 0;

      // Calculate trend
      const trend = calculateTrend(exerciseSets);
      
      // Calculate progress percentage (based on volume improvement over last 30 days)
      const progressPercentage = calculateProgressPercentage(exerciseSets);

      // Determine if ready to progress
      const isReadyToProgress = determineReadyToProgress(exerciseSets, daysSinceLastPerformed);

      // Generate milestones
      const milestones = generateMilestones(exerciseSets);

      return {
        exerciseId,
        userId: user.id,
        totalSessions,
        totalVolume,
        personalBest,
        lastPerformed,
        averageWeight,
        averageReps,
        trend,
        progressPercentage,
        daysSinceLastPerformed,
        isReadyToProgress,
        milestones
      };
    },
    enabled: enabled && !!user?.id && !!exerciseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

function calculateTrend(exerciseSets: any[]): 'increasing' | 'decreasing' | 'stable' | 'new' {
  if (exerciseSets.length < 3) return 'new';

  // Compare last 3 sessions vs previous 3 sessions
  const recentSets = exerciseSets.slice(-6);
  if (recentSets.length < 6) return 'stable';

  const firstHalf = recentSets.slice(0, 3);
  const secondHalf = recentSets.slice(3, 6);

  const firstHalfAvg = firstHalf.reduce((sum, set) => sum + (set.weight * set.reps), 0) / firstHalf.length;
  const secondHalfAvg = secondHalf.reduce((sum, set) => sum + (set.weight * set.reps), 0) / secondHalf.length;

  const improvement = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

  if (improvement > 5) return 'increasing';
  if (improvement < -5) return 'decreasing';
  return 'stable';
}

function calculateProgressPercentage(exerciseSets: any[]): number {
  if (exerciseSets.length < 2) return 0;

  const thirtyDaysAgo = subDays(new Date(), 30);
  const recentSets = exerciseSets.filter(set => 
    parseISO(set.created_at) >= thirtyDaysAgo
  );

  if (recentSets.length < 2) return 0;

  const firstVolume = recentSets[0].weight * recentSets[0].reps;
  const lastVolume = recentSets[recentSets.length - 1].weight * recentSets[recentSets.length - 1].reps;

  return Math.round(((lastVolume - firstVolume) / firstVolume) * 100);
}

function determineReadyToProgress(exerciseSets: any[], daysSinceLastPerformed: number): boolean {
  if (exerciseSets.length < 3) return false;
  if (daysSinceLastPerformed > 14) return false;

  // Check if last 3 sessions show consistent performance
  const lastThreeSets = exerciseSets.slice(-3);
  const volumes = lastThreeSets.map(set => set.weight * set.reps);
  const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
  
  // If all recent volumes are within 5% of average, ready to progress
  return volumes.every(vol => Math.abs((vol - avgVolume) / avgVolume) < 0.05);
}

function generateMilestones(exerciseSets: any[]): PersonalMilestone[] {
  const milestones: PersonalMilestone[] = [];

  if (exerciseSets.length === 1) {
    milestones.push({
      type: 'first_time',
      value: 1,
      date: exerciseSets[0].created_at,
      description: 'First time performing this exercise'
    });
  }

  // Volume milestones (1000, 5000, 10000, etc.)
  const totalVolume = exerciseSets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
  const volumeMilestones = [1000, 5000, 10000, 25000, 50000, 100000];
  
  volumeMilestones.forEach(milestone => {
    if (totalVolume >= milestone) {
      milestones.push({
        type: 'volume_milestone',
        value: milestone,
        date: new Date().toISOString(),
        description: `Reached ${milestone.toLocaleString()} total volume`
      });
    }
  });

  // Consistency milestones
  const sessions = new Set(exerciseSets.map(set => set.workout_id)).size;
  const consistencyMilestones = [5, 10, 25, 50, 100];
  
  consistencyMilestones.forEach(milestone => {
    if (sessions >= milestone) {
      milestones.push({
        type: 'consistency',
        value: milestone,
        date: new Date().toISOString(),
        description: `Completed ${milestone} sessions`
      });
    }
  });

  return milestones.slice(-5); // Return last 5 milestones
}

export function usePersonalStatsForMultipleExercises(exerciseIds: string[]) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['personal-stats-multiple', user?.id, exerciseIds.sort()],
    queryFn: async (): Promise<Record<string, PersonalStats>> => {
      if (!user?.id || exerciseIds.length === 0) return {};

      const statsPromises = exerciseIds.map(async (exerciseId) => {
        // This is a simplified version - in production you'd batch this query
        const stats = await usePersonalStats({ exerciseId, enabled: true }).queryFn?.();
        return [exerciseId, stats] as const;
      });

      const results = await Promise.all(statsPromises);
      return Object.fromEntries(results.filter(([_, stats]) => stats !== null));
    },
    enabled: !!user?.id && exerciseIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}
