
import { Exercise } from './exercise';

export interface PersonalStats {
  exerciseId: string;
  userId: string;
  totalSessions: number;
  totalVolume: number;
  personalBest: {
    weight: number;
    reps: number;
    date: string;
  } | null;
  lastPerformed: string | null;
  averageWeight: number;
  averageReps: number;
  trend: 'increasing' | 'decreasing' | 'stable' | 'new';
  progressPercentage: number;
  daysSinceLastPerformed: number;
  isReadyToProgress: boolean;
  milestones: PersonalMilestone[];
}

export interface PersonalMilestone {
  type: 'personal_best' | 'volume_milestone' | 'consistency' | 'first_time';
  value: number;
  date: string;
  description: string;
}

export interface ExerciseWithPersonalStats extends Exercise {
  personalStats?: PersonalStats;
}

export interface ProgressTrend {
  period: 'week' | 'month' | 'quarter';
  change: number;
  direction: 'up' | 'down' | 'stable';
  confidence: number;
}

export interface PersonalInsight {
  type: 'achievement' | 'suggestion' | 'warning' | 'milestone';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  actionable?: boolean;
  exerciseId?: string;
}
