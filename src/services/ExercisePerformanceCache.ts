
interface CachedExerciseData {
  exerciseName: string;
  recentSets: any[];
  averageWeight: number;
  averageReps: number;
  maxWeight: number;
  lastPerformed: string;
  totalVolume: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  timestamp: number;
}

class ExercisePerformanceCache {
  private static instance: ExercisePerformanceCache;
  private cache = new Map<string, CachedExerciseData>();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): ExercisePerformanceCache {
    if (!ExercisePerformanceCache.instance) {
      ExercisePerformanceCache.instance = new ExercisePerformanceCache();
    }
    return ExercisePerformanceCache.instance;
  }

  updateExerciseData(exerciseName: string, sets: any[]): void {
    const completedSets = sets.filter(set => set.completed);
    if (completedSets.length === 0) return;

    const weights = completedSets.map(set => set.weight);
    const reps = completedSets.map(set => set.reps);
    
    const cachedData: CachedExerciseData = {
      exerciseName,
      recentSets: completedSets.slice(-5), // Keep last 5 sets
      averageWeight: weights.reduce((sum, w) => sum + w, 0) / weights.length,
      averageReps: Math.round(reps.reduce((sum, r) => sum + r, 0) / reps.length),
      maxWeight: Math.max(...weights),
      lastPerformed: new Date().toISOString(),
      totalVolume: completedSets.reduce((sum, set) => sum + (set.weight * set.reps), 0),
      trend: this.calculateTrend(completedSets),
      timestamp: Date.now()
    };

    this.cache.set(exerciseName, cachedData);
  }

  getExerciseData(exerciseName: string): CachedExerciseData | null {
    const cached = this.cache.get(exerciseName);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached;
    }
    return null;
  }

  private calculateTrend(sets: any[]): 'increasing' | 'stable' | 'decreasing' {
    if (sets.length < 3) return 'stable';
    
    const recentVolumes = sets.slice(-3).map(set => set.weight * set.reps);
    const firstVolume = recentVolumes[0];
    const lastVolume = recentVolumes[recentVolumes.length - 1];
    
    const changePercent = ((lastVolume - firstVolume) / firstVolume) * 100;
    
    if (changePercent > 5) return 'increasing';
    if (changePercent < -5) return 'decreasing';
    return 'stable';
  }

  clearExpiredCache(): void {
    const now = Date.now();
    for (const [exerciseName, data] of this.cache.entries()) {
      if (now - data.timestamp > this.CACHE_DURATION) {
        this.cache.delete(exerciseName);
      }
    }
  }

  getCacheStats(): { size: number; exercises: string[] } {
    return {
      size: this.cache.size,
      exercises: Array.from(this.cache.keys())
    };
  }
}

export const exercisePerformanceCache = ExercisePerformanceCache.getInstance();
