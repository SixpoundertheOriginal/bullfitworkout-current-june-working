
import { WorkoutStats } from '@/types/workout-metrics';
import { workoutStatsApi } from '@/services/workoutStatsService';
import { DateRange } from 'react-day-picker';

export interface OverviewMetrics {
  totalWorkouts: number;
  totalDuration: number;
  avgDuration: number;
  totalVolume: number;
  thisWeekWorkouts: number;
  weeklyGoal: number;
  weeklyProgress: number;
  comparison?: {
    workoutsChange: number;
    volumeChange: number;
    durationChange: number;
  };
}

export interface WorkoutTypeMetric {
  type: string;
  count: number;
  percentage: number;
}

export interface MuscleFocusMetric {
  [muscleGroup: string]: number;
}

class OverviewDataService {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private getCacheKey(userId: string, dateRange: DateRange | undefined, type: string): string {
    const from = dateRange?.from?.toISOString() || 'no-from';
    const to = dateRange?.to?.toISOString() || 'no-to';
    return `${type}-${userId}-${from}-${to}`;
  }

  private isValidCache(entry: { timestamp: number; ttl: number }): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  private setCache(key: string, data: any, ttl: number = this.CACHE_TTL): void {
    this.cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  private getCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && this.isValidCache(entry)) {
      return entry.data as T;
    }
    if (entry) {
      this.cache.delete(key); // Clean expired cache
    }
    return null;
  }

  async fetchWorkoutStats(
    userId: string, 
    dateRange: DateRange | undefined, 
    weightUnit: string
  ): Promise<WorkoutStats> {
    const cacheKey = this.getCacheKey(userId, dateRange, 'workout-stats');
    const cached = this.getCache<WorkoutStats>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const stats = await workoutStatsApi.fetch(userId, dateRange, weightUnit);
    this.setCache(cacheKey, stats);
    return stats;
  }

  calculateOverviewMetrics(
    workouts: any[], 
    comparisonStats?: WorkoutStats
  ): OverviewMetrics {
    if (!workouts || workouts.length === 0) {
      return {
        totalWorkouts: 0,
        totalDuration: 0,
        avgDuration: 0,
        totalVolume: 0,
        thisWeekWorkouts: 0,
        weeklyGoal: 3,
        weeklyProgress: 0,
        comparison: undefined
      };
    }

    const totalWorkouts = workouts.length;
    const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const avgDuration = totalWorkouts > 0 ? totalDuration / totalWorkouts : 0;
    
    const totalVolume = workouts.reduce((sum, workout) => {
      if (!workout.exercises) return sum;
      return sum + Object.values(workout.exercises).flat().reduce((exerciseSum: number, set: any) => {
        return exerciseSum + (set.weight * set.reps);
      }, 0);
    }, 0);

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const thisWeekWorkouts = workouts.filter(w => 
      new Date(w.created_at) >= oneWeekAgo
    ).length;

    const weeklyGoal = 3;
    const weeklyProgress = weeklyGoal > 0 ? (thisWeekWorkouts / weeklyGoal) * 100 : 0;

    // Calculate comparison metrics if available
    const comparison = comparisonStats ? {
      workoutsChange: ((totalWorkouts - comparisonStats.totalWorkouts) / Math.max(comparisonStats.totalWorkouts, 1)) * 100,
      volumeChange: ((totalVolume - (comparisonStats.progressMetrics?.volumeChangePercentage || 0)) / Math.max(comparisonStats.progressMetrics?.volumeChangePercentage || 1, 1)) * 100,
      durationChange: ((avgDuration - comparisonStats.avgDuration) / Math.max(comparisonStats.avgDuration, 1)) * 100
    } : undefined;

    return {
      totalWorkouts,
      totalDuration,
      avgDuration,
      totalVolume,
      thisWeekWorkouts,
      weeklyGoal,
      weeklyProgress,
      comparison
    };
  }

  calculateWorkoutTypeData(workouts: any[]): WorkoutTypeMetric[] {
    if (!workouts || workouts.length === 0) return [];
    
    const typeCount: Record<string, number> = {};
    workouts.forEach(workout => {
      const type = 'Strength';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });
    
    return Object.entries(typeCount).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / workouts.length) * 100)
    }));
  }

  calculateMuscleFocusData(workouts: any[]): MuscleFocusMetric {
    if (!workouts || workouts.length === 0) return {};
    
    const muscleFocus: Record<string, number> = {};
    workouts.forEach(workout => {
      if (workout.exercises) {
        Object.keys(workout.exercises).forEach(exerciseName => {
          const muscleGroup = exerciseName.toLowerCase().includes('bench') ? 'chest' :
                             exerciseName.toLowerCase().includes('squat') ? 'legs' :
                             exerciseName.toLowerCase().includes('deadlift') ? 'back' :
                             exerciseName.toLowerCase().includes('curl') ? 'arms' : 'core';
          
          muscleFocus[muscleGroup] = (muscleFocus[muscleGroup] || 0) + 1;
        });
      }
    });
    
    return muscleFocus;
  }

  clearCache(): void {
    this.cache.clear();
  }

  // Cleanup expired cache entries
  cleanupCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (!this.isValidCache(entry)) {
        this.cache.delete(key);
      }
    }
  }
}

export const overviewDataService = new OverviewDataService();
