
import { Exercise } from './exercise';
import { PersonalStats } from './personal-analytics';

export type MovementPattern = 'push' | 'pull' | 'squat' | 'hinge' | 'carry' | 'core' | 'rotation';
export type TrainingFocus = 'strength' | 'hypertrophy' | 'endurance' | 'power' | 'mobility' | 'stability';
export type ComplexityLevel = 'fundamental' | 'intermediate' | 'advanced' | 'expert';

export interface EnhancedExercise extends Exercise {
  // From Phase 1 (already implemented)
  personalStats?: PersonalStats;
  
  // New for Phase 2 - Smart Categorization
  movementPattern?: MovementPattern;
  trainingFocus?: TrainingFocus[];
  complexityLevel?: ComplexityLevel;
  equipmentAlternatives?: string[]; // Exercise IDs with similar movement but different equipment
  prerequisites?: string[]; // Exercise IDs that should be mastered first
  progressions?: string[]; // Exercise IDs that are next level progressions
  muscleActivation?: {
    primary: number; // 0-100 activation percentage
    secondary: number;
  };
}

export interface WorkoutAnalysis {
  muscleGroupBalance: Record<string, number>;
  movementPatternBalance: Record<MovementPattern, number>;
  pushPullRatio: number;
  complexityDistribution: Record<ComplexityLevel, number>;
  trainingFocusDistribution: Record<TrainingFocus, number>;
  recommendedCorrections: ExerciseRecommendation[];
}

export interface ExerciseRecommendation {
  exercise: EnhancedExercise;
  reason: 'muscle_balance' | 'movement_pattern' | 'progression' | 'variety' | 'preference';
  priority: 'high' | 'medium' | 'low';
  confidence: number; // 0-1 confidence score
}

export interface BalanceReport {
  imbalances: Array<{
    type: 'muscle_group' | 'movement_pattern' | 'training_focus';
    description: string;
    severity: 'mild' | 'moderate' | 'severe';
    recommendations: ExerciseRecommendation[];
  }>;
  overallScore: number; // 0-100 balance score
}

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  icon: string;
  filters: {
    muscleGroups?: string[];
    movementPatterns?: MovementPattern[];
    trainingFocus?: TrainingFocus[];
    complexityLevel?: ComplexityLevel[];
    equipment?: string[];
  };
  targetAudience: 'beginner' | 'intermediate' | 'advanced' | 'athlete' | 'bodybuilder' | 'powerlifter';
}
