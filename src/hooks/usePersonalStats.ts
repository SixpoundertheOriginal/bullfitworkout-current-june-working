
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';
import { personalStatsApi } from '@/services/personalStatsService';
import { PersonalStats } from '@/types/personal-analytics';

interface UsePersonalStatsOptions {
  exerciseId?: string;
  enabled?: boolean;
}

export function usePersonalStats(options: UsePersonalStatsOptions = {}) {
  const { user } = useAuth();
  const { exerciseId, enabled = true } = options;

  return useQuery({
    queryKey: ['personal-stats', user?.id, exerciseId],
    queryFn: () => personalStatsApi.fetch(user!.id, exerciseId!),
    enabled: enabled && !!user?.id && !!exerciseId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function usePersonalStatsForMultipleExercises(exerciseIds: string[]) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['personal-stats-multiple', user?.id, exerciseIds.sort()],
    queryFn: () => personalStatsApi.fetchMultiple(user!.id, exerciseIds),
    enabled: !!user?.id && exerciseIds.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}
