
import { ProcessedWorkoutMetrics } from '@/utils/workoutMetricsProcessor';

export interface WorkoutMetrics {
  time: number;
  exerciseCount: number;
  completedSets: number;
  totalSets: number;
  performance: {
    volume: number;
    intensity: number;
    density: number;
    efficiency: number;
  };
}

export interface SetMetrics {
  rpe?: number;
  status: 'completed' | 'failed' | 'partial';
  notes?: string;
}

export interface WorkoutPerformanceMetrics {
  totalVolume: number;
  averageRpe: number;
  setCompletionRate: number;
  metrics: Record<string, any>;
}

// Export the new centralized metrics type to support transition
export type { ProcessedWorkoutMetrics };
