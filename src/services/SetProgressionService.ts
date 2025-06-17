
interface SetProgressionStrategy {
  name: string;
  calculate: (exerciseName: string, sets: any[], userPreferences: any) => {
    weight: number;
    reps: number;
    restTime: number;
  };
}

interface ProgressionContext {
  exerciseName: string;
  currentSets: any[];
  userPreferences: any;
  workoutDuration: number;
  totalVolume: number;
}

class SetProgressionService {
  private static instance: SetProgressionService;
  private strategies = new Map<string, SetProgressionStrategy>();
  private performanceCache = new Map<string, any>();

  static getInstance(): SetProgressionService {
    if (!SetProgressionService.instance) {
      SetProgressionService.instance = new SetProgressionService();
    }
    return SetProgressionService.instance;
  }

  private constructor() {
    this.initializeStrategies();
  }

  private initializeStrategies() {
    // Last Completed Set Strategy (Default)
    this.strategies.set('lastCompleted', {
      name: 'Last Completed Set',
      calculate: (exerciseName: string, sets: any[]) => {
        const completedSets = sets.filter(set => set.completed);
        if (completedSets.length > 0) {
          const lastCompleted = completedSets[completedSets.length - 1];
          return {
            weight: lastCompleted.weight,
            reps: lastCompleted.reps,
            restTime: lastCompleted.restTime || 60
          };
        }
        return this.getDefaultValues();
      }
    });

    // Progressive Overload Strategy
    this.strategies.set('progressive', {
      name: 'Progressive Overload',
      calculate: (exerciseName: string, sets: any[]) => {
        const completedSets = sets.filter(set => set.completed);
        if (completedSets.length > 0) {
          const lastCompleted = completedSets[completedSets.length - 1];
          return {
            weight: lastCompleted.weight + 2.5, // Small increment
            reps: lastCompleted.reps,
            restTime: lastCompleted.restTime || 60
          };
        }
        return this.getDefaultValues();
      }
    });

    // Average Strategy
    this.strategies.set('average', {
      name: 'Average of Recent Sets',
      calculate: (exerciseName: string, sets: any[]) => {
        const completedSets = sets.filter(set => set.completed);
        if (completedSets.length > 0) {
          const recentSets = completedSets.slice(-3); // Last 3 sets
          const avgWeight = recentSets.reduce((sum, set) => sum + set.weight, 0) / recentSets.length;
          const avgReps = Math.round(recentSets.reduce((sum, set) => sum + set.reps, 0) / recentSets.length);
          const avgRest = recentSets.reduce((sum, set) => sum + (set.restTime || 60), 0) / recentSets.length;
          
          return {
            weight: Math.round(avgWeight * 2) / 2, // Round to nearest 0.5
            reps: avgReps,
            restTime: Math.round(avgRest)
          };
        }
        return this.getDefaultValues();
      }
    });
  }

  private getDefaultValues() {
    return { weight: 0, reps: 0, restTime: 60 };
  }

  calculateNextSet(context: ProgressionContext): {
    weight: number;
    reps: number;
    restTime: number;
    confidence: number;
  } {
    const strategyName = context.userPreferences?.progressionStrategy || 'lastCompleted';
    const strategy = this.strategies.get(strategyName) || this.strategies.get('lastCompleted')!;
    
    try {
      const result = strategy.calculate(context.exerciseName, context.currentSets, context.userPreferences);
      
      // Calculate confidence based on available data
      const completedSets = context.currentSets.filter(set => set.completed);
      const confidence = Math.min(completedSets.length * 0.25, 1); // Max 100% confidence
      
      return { ...result, confidence };
    } catch (error) {
      console.warn('[SetProgressionService] Error calculating progression:', error);
      return { ...this.getDefaultValues(), confidence: 0 };
    }
  }

  // Cache performance data for quick access
  cacheExercisePerformance(exerciseName: string, data: any) {
    this.performanceCache.set(exerciseName, {
      ...data,
      timestamp: Date.now()
    });
  }

  getCachedPerformance(exerciseName: string) {
    const cached = this.performanceCache.get(exerciseName);
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes cache
      return cached;
    }
    return null;
  }

  getAvailableStrategies(): string[] {
    return Array.from(this.strategies.keys());
  }
}

export const setProgressionService = SetProgressionService.getInstance();
