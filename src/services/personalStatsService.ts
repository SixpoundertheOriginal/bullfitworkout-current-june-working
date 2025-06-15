
import { PersonalStats } from '@/types/personal-analytics';

// Personal Stats API
const fetchPersonalStats = async (userId: string, exerciseId: string): Promise<PersonalStats> => {
  try {
    console.log('[DataService] Fetching personal stats for exercise:', exerciseId);
    
    // Mock implementation with all required PersonalStats properties
    return {
      exerciseId,
      userId,
      totalSessions: 0,
      totalVolume: 0,
      personalBest: null,
      lastPerformed: null,
      averageWeight: 0,
      averageReps: 0,
      trend: 'stable',
      progressPercentage: 0,
      daysSinceLastPerformed: 0,
      isReadyToProgress: false,
      milestones: [],
    };
  } catch (error) {
    console.error('[DataService] Error fetching personal stats:', error);
    throw error;
  }
};

const fetchMultiplePersonalStats = async (userId: string, exerciseIds: string[]): Promise<Record<string, PersonalStats>> => {
  try {
    console.log('[DataService] Fetching multiple personal stats for exercises:', exerciseIds);
    
    // Mock implementation with all required PersonalStats properties
    const stats: Record<string, PersonalStats> = {};
    exerciseIds.forEach(id => {
      stats[id] = {
        exerciseId: id,
        userId,
        totalSessions: 0,
        totalVolume: 0,
        personalBest: null,
        lastPerformed: null,
        averageWeight: 0,
        averageReps: 0,
        trend: 'stable',
        progressPercentage: 0,
        daysSinceLastPerformed: 0,
        isReadyToProgress: false,
        milestones: [],
      };
    });
    
    return stats;
  } catch (error) {
    console.error('[DataService] Error fetching multiple personal stats:', error);
    throw error;
  }
};

export const personalStatsApi = {
  fetch: fetchPersonalStats,
  fetchMultiple: fetchMultiplePersonalStats
};
